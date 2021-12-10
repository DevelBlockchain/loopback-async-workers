import { service } from '@loopback/core';
import { repository } from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import Compiler from '../compiler/vm/compiler';
import { Environment } from '../compiler/vm/data';
import BywiseVirtualMachine from '../compiler/vm/virtual-machine';
import { ContractsEnvRepository } from '../repositories';
import { ContractProvider, TransactionsProvider, WalletProvider } from '../services';
import { ConfigProvider } from '../services/configs.service';
import { CompileRequestDTO, ObjectDTO, SimulateAccountDTO, SimulateContractDTO, SimulateSliceDTO, TransactionsDTO, TransactionsType, TryCompileDTO, ValueDTO } from '../types';
import { ethers } from "ethers";
import { VirtualMachineProvider } from '../services/virtual-machine.service';

export class ContractsController {
  constructor(
    @repository(ContractsEnvRepository) public contractsEnvRepository: ContractsEnvRepository,
    @service(TransactionsProvider) private transactionsProvider: TransactionsProvider,
    @service(ConfigProvider) private configProvider: ConfigProvider,
    @service(VirtualMachineProvider) private virtualMachineProvider: VirtualMachineProvider,
  ) { }

  @get('/api/v1/contracts/{address}/abi')
  @response(200, {
    description: 'Contract ABI',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ObjectDTO),
      },
    },
  })
  async getABI(
    @param.path.string('address') address: string,
  ): Promise<Environment> {
    let contractEnv = await this.contractsEnvRepository.findOne({ where: { address } });
    if (!contractEnv || !contractEnv.env || !contractEnv.env.contract) {
      throw new HttpErrors.NotFound();
    }
    return Environment.fromJSON(contractEnv.env);
  }

  @post('/api/v1/contracts/compiler')
  @response(200, {
    description: 'Try compile',
    content: {
      'application/json': {
        schema: getModelSchemaRef(TryCompileDTO),
      },
    },
  })
  async compiler(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompileRequestDTO),
        },
      },
    })
    compileRequestDTO: CompileRequestDTO,
  ): Promise<any> {
    let ctx: SimulateSliceDTO;
    try {
      let compiler = new Compiler(BywiseVirtualMachine.getDictionary());
      let isMainnet = ContractProvider.isMainNet();
      let abi = compiler.compilerASM(isMainnet, compileRequestDTO.code);
      let accounts: SimulateAccountDTO[] = [];
      if (!compileRequestDTO.ctx) {
        ctx = new SimulateSliceDTO();
        ctx.simulate = true;
        for (let i = 0; i < 5; i++) {
          let account = await ethers.Wallet.createRandom();
          let address = WalletProvider.encodeBWSAddress(ContractProvider.isMainNet(), false, account.address);
          accounts.push(new SimulateAccountDTO({
            address: address,
            balance: '100',
          }))
        }
        for await (const account of accounts) {
          let sender = await this.virtualMachineProvider.getWallet(account.address, ctx);
          sender.balance = account.balance;
        }
      } else {
        ctx = compileRequestDTO.ctx;
      }

      let tx = new TransactionsDTO();
      (await this.configProvider.getAll()).forEach(config => {
        if (config.name == 'validator') {
          tx.validator = config.value
        }
      })
      if (compileRequestDTO.from) {
        tx.from = compileRequestDTO.from;
      } else if (ctx.walletsModels[0]) {
        tx.from = ctx.walletsModels[0].address;
      } else {
        tx.from = WalletProvider.ZERO_ADDRESS;
      }
      tx.data = abi.toJSON(true);
      tx.to = abi.address;
      tx.version = '1';
      tx.amount = '0';
      tx.fee = '1';
      tx.type = TransactionsType.TX_CONTRACT;
      tx.created = new Date().toISOString();
      let output = await this.transactionsProvider.simulateTransaction(tx, ctx);

      let compiledData = new TryCompileDTO({
        contract: abi.toJSON(),
        simulateAccounts: ctx.walletsModels.map(wallet => new SimulateAccountDTO({ address: wallet.address, balance: wallet.balance })),
        output,
        ctx,
      });
      return compiledData;
    } catch (err: any) {
      console.error(err);
      return new TryCompileDTO({
        error: err.message
      });
    }
  }

  @post('/api/v1/contracts/simulate')
  @response(200, {
    description: 'Accepted transaction',
    content: {
      'application/json': {
        schema: getModelSchemaRef(TryCompileDTO, {
          exclude: ['contract']
        }),
      },
    },
  })
  async simulate(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SimulateContractDTO),
        },
      },
    })
    simulateContractDTO: SimulateContractDTO,
  ): Promise<any> {
    let ctx: SimulateSliceDTO | undefined = undefined;
    try {
      let tx = new TransactionsDTO();
      (await this.configProvider.getAll()).forEach(config => {
        if (config.name == 'validator') {
          tx.validator = config.value
        }
      })
      tx.from = simulateContractDTO.from;
      tx.to = simulateContractDTO.to;
      tx.amount = simulateContractDTO.amount;
      tx.data = simulateContractDTO.data;
      tx.type = TransactionsType.TX_CONTRACT_EXE;
      tx.version = '1';
      tx.fee = '1';
      tx.created = new Date().toISOString();

      if (!simulateContractDTO.ctx) {
        ctx = new SimulateSliceDTO();
        ctx.simulate = true;
      } else {
        ctx = simulateContractDTO.ctx;
      }
      let output = await this.transactionsProvider.simulateTransaction(tx, ctx);
      let compiledData = new TryCompileDTO({
        simulateAccounts: ctx.walletsModels.map(wallet => new SimulateAccountDTO({ address: wallet.address, balance: wallet.balance })),
        output,
        ctx,
      });
      return compiledData;
    } catch (err: any) {
      console.error(err);
      return new TryCompileDTO({
        error: err.message
      });
    }
  }
}
