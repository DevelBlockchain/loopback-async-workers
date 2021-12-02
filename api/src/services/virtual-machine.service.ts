import { injectable, BindingScope, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import BigNumber from "bignumber.js";
import { ContractProvider, WalletProvider } from '.';
import { BywiseBlockchainInterface } from '../compiler/bywise/bywise-blockchain';
import { ContractABI, Environment, Types, Variable } from '../compiler/vm/data';
import BywiseVirtualMachine from '../compiler/vm/virtual-machine';
import { Transactions, TransactionsType, Wallets } from '../models';
import { ContractsEnv } from '../models/contracts-env.model';
import { ContractsVars } from '../models/contracts-vars.model';
import { WalletsRepository } from '../repositories';
import { ContractsEnvRepository } from '../repositories/contracts-env.repository';
import { ContractsVarsRepository } from '../repositories/contracts-vars.repository';
import { CommandDTO, SimulateSliceDTO, WalletInfoDTO } from '../types/transactions.type';
import { ConfigProvider } from './configs.service';

@injectable({ scope: BindingScope.TRANSIENT })
export class VirtualMachineProvider implements BywiseBlockchainInterface {
  constructor(
    @repository(WalletsRepository) public walletsRepository: WalletsRepository,
    @repository(ContractsEnvRepository) public contractsEnvRepository: ContractsEnvRepository,
    @repository(ContractsVarsRepository) public contractsVarsRepository: ContractsVarsRepository,
    @service(ConfigProvider) public configProvider: ConfigProvider,
  ) { }

  async getWallet(address: string, ctx: SimulateSliceDTO): Promise<Wallets> {
    for (let i = 0; i < ctx.walletsModels.length; i++) {
      let updatedWallet = ctx.walletsModels[i];
      if (updatedWallet.address === address) {
        return updatedWallet;
      }
    }
    let wallet = null;
    if (!wallet) {
      wallet = await this.walletsRepository.findOne({ where: { address: address } });
    }
    if (!wallet) {
      wallet = await this.walletsRepository.create({
        balance: '0',
        address: address,
      });
    }
    ctx.walletsModels.push(wallet);
    return wallet;
  }

  async getContractEnv(address: string, ctx: SimulateSliceDTO): Promise<ContractsEnv> {
    for (let i = 0; i < ctx.contractEnvModels.length; i++) {
      let contractEnv = ctx.contractEnvModels[i];
      if (contractEnv.address === address) {
        return contractEnv;
      }
    }
    let contractEnv = null;
    if (!contractEnv) {
      contractEnv = await this.contractsEnvRepository.findOne({ where: { address: address } });
    }
    if (!contractEnv) {
      contractEnv = await this.contractsEnvRepository.create({
        address: address,
      });
    }
    ctx.contractEnvModels.push(contractEnv);
    return contractEnv;
  }

  async getContractVars(address: string, key: string, ctx: SimulateSliceDTO): Promise<ContractsVars> {
    for (let i = 0; i < ctx.contractVarsModels.length; i++) {
      let contractVars = ctx.contractVarsModels[i];
      if (contractVars.address === address) {
        return contractVars;
      }
    }
    let contractVars = null;
    if (!contractVars) {
      contractVars = await this.contractsVarsRepository.findOne({ where: { address, key } });
    }
    if (!contractVars) {
      contractVars = await this.contractsVarsRepository.create({
        address,
        key,
      });
    }
    ctx.contractVarsModels.push(contractVars);
    return contractVars;
  }

  private async send(senderAddress: string, toAddress: string, amount: string, ctx: SimulateSliceDTO) {
    let sender = await this.getWallet(senderAddress, ctx);
    let recipient = await this.getWallet(toAddress, ctx);
    let amountBN = new BigNumber(amount);
    let senderBalance = new BigNumber(sender.balance);
    let recipientBalance = new BigNumber(recipient.balance);
    senderBalance = senderBalance.minus(amountBN);
    if (senderBalance.isLessThan(new BigNumber(0))) {
      throw new Error('insufficient funds')
    }
    recipientBalance = recipientBalance.plus(amount);
    sender.balance = senderBalance.toString();
    recipient.balance = recipientBalance.toString();
  }

  async executeTransaction(tx: Transactions, ctx: SimulateSliceDTO, simulate = false): Promise<string> {
    let cost = 0;
    let amount = tx.amount;
    let size = tx.data.length;

    ctx.tx = tx;
    await this.send(tx.from, tx.validator, tx.fee, ctx);
    await this.send(tx.from, tx.to, tx.amount, ctx);

    if (tx.type === TransactionsType.TX_CONTRACT) {
      let contract = ContractABI.fromJSON(JSON.parse(tx.data));
      await this.getWallet(contract.address, ctx);
      let contractEnv = await this.getContractEnv(contract.address, ctx);
      if (contractEnv.env) {
        throw new Error(`Contract ${contract.address} already exists`);
      }
      let isMainnet = ContractProvider.isMainNet();
      let executeLimit = await this.configProvider.getByName('executeLimit');

      let output = await BywiseVirtualMachine.exec(
        ctx,
        isMainnet,
        executeLimit.getNumber().toNumber(),
        contract,
        this
      );
      contractEnv.env = output.env;
      cost = output.cost;
    } else if (tx.type === TransactionsType.TX_CONTRACT_EXE) {
      let contractEnv = await this.getContractEnv(tx.to, ctx);
      if (!contractEnv.env) {
        throw new Error(`Contract ${tx.to} not found`);
      }
      let env = Environment.fromJSON(contractEnv.env);
      let isMainnet = ContractProvider.isMainNet();
      let executeLimit = await this.configProvider.getByName('executeLimit');
      let cmd = new CommandDTO(JSON.parse(tx.data));
      let output = await BywiseVirtualMachine.execFunction(
        ctx,
        isMainnet,
        executeLimit.getNumber().toNumber(),
        true,
        env,
        this,
        cmd.name,
        cmd.input,
      );
      cost = output.cost;
    } else if (tx.type === TransactionsType.TX_COMMAND) {
      let cmd = new CommandDTO(JSON.parse(tx.data));
      await this.setConfig(ctx, cmd);
    }

    let configFee = await this.configProvider.getByName('fee');
    let code = '';
    code += `const BigNumber = require("bignumber.js");\n`;
    //code += `import BigNumber from "bignumber.js";\n`;
    code += `let size = new BigNumber('${size}');\n`;
    code += `let amount = new BigNumber('${amount}');\n`;
    code += `let cost = new BigNumber('${cost}');\n`;
    code += `${configFee.value}`;
    (new BigNumber(2)).toFixed()
    console.log('code')
    console.log(code)
    let fee = eval(code);
    fee = `${fee}`;
    if (fee !== tx.fee && !simulate) {
      throw new Error(`Invalid fee`);
    }
    return fee;
  }

  async checkAdminAddress(ctx: SimulateSliceDTO) {
    let adminAddress = await this.configProvider.getByName('adminAddress');
    if (adminAddress.value !== WalletProvider.ZERO_ADDRESS && (!ctx.tx || adminAddress.value !== ctx.tx.from)) {
      throw new Error(`setConfig forbidden`);
    }
  }

  async setConfig(ctx: SimulateSliceDTO, cmd: CommandDTO): Promise<void> {
    if (cmd.name == 'setConfig' && cmd.input.length === 3) {
      await this.checkAdminAddress(ctx);
      let configs = await this.configProvider.getAll();
      for (let i = 0; i < configs.length; i++) {
        let cfg = configs[i];
        if (cmd.input[0] === cfg.name) {
          let type = Types.getType(cmd.input[1]);
          if (!type) {
            throw new Error(`invalid type ${cmd.input[1]}`);
          }
          cfg.type = cmd.input[1];
          cfg.value = cmd.input[2];
          ctx.configs.push(cfg);
          return;
        }
      }
    } else if (cmd.name == 'setBalance' && cmd.input.length === 2) {
      await this.checkAdminAddress(ctx);
      let address = cmd.input[0];
      let amount = cmd.input[1];
      if (WalletProvider.isValidAddress(address)) {
        let wallet = await this.getWallet(address, ctx);
        wallet.balance = amount;
        return;
      } else {
        throw new Error(`invalid address ${address}`);
      }
    } else if (cmd.name == 'addBalance' && cmd.input.length === 2) {
      await this.checkAdminAddress(ctx);
      let address = cmd.input[0];
      let amount = cmd.input[1];
      if (WalletProvider.isValidAddress(address)) {
        let wallet = await this.getWallet(address, ctx);
        wallet.balance = new BigNumber(wallet.balance).plus(new BigNumber(amount)).toString();
        return;
      } else {
        throw new Error(`invalid address ${address}`);
      }
    } else if (cmd.name == 'subBalance' && cmd.input.length === 2) {
      await this.checkAdminAddress(ctx);
      let address = cmd.input[0];
      let amount = cmd.input[1];
      if (WalletProvider.isValidAddress(address)) {
        let wallet = await this.getWallet(address, ctx);
        wallet.balance = new BigNumber(wallet.balance).minus(new BigNumber(amount)).toString();
        if (new BigNumber(wallet.balance).isLessThan(new BigNumber(0))) {
          wallet.balance = "0";
        }
        return;
      } else {
        throw new Error(`invalid address ${address}`);
      }
    } else if (cmd.name == 'setInfo' && cmd.input.length === 2) {
      let key = cmd.input[0];
      let value = cmd.input[1];
      if ((!ctx.tx)) {
        throw new Error(`setInfo forbidden`);
      }
      let wallet = await this.getWallet(ctx.tx.from, ctx);
      if (key === 'name') wallet.name = value;
      if (key === 'url') wallet.url = value;
      if (key === 'bio') wallet.bio = value;
      if (key === 'photo') wallet.photo = value;
      if (key === 'publicKey') wallet.publicKey = value;
      return;
    }
    throw new Error("Method not implemented.");
  }

  async saveEnvironment(ctx: SimulateSliceDTO, env: Environment): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async executeFunction(ctx: SimulateSliceDTO, env: Environment, name: string, inputs: Variable[]): Promise<Variable[]> {
    if (name === 'print') {
      console.log('Execute funtion on bywise inteface', inputs.map(v => v.value).join(' '))
      return [];
    } else if (name === 'balanceOf') {
      if (inputs.length === 1) {
        if (WalletProvider.isValidAddress(inputs[0].value)) {
          let wallet = await this.getWallet(inputs[0].value, ctx);
          return [new Variable(Types.number, wallet.balance)];
        } else {
          throw new Error(`invalid address ${inputs[0]}`);
        }
      } else {
        throw new Error(`invalid input size - expected ${1} received ${inputs.length}`);
      }
    }
    throw new Error("Method not implemented.");
  }
}
