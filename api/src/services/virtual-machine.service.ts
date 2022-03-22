import { injectable, BindingScope, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import BigNumber from "bignumber.js";
import { ContractProvider } from '.';
import { BywiseBlockchainInterface } from '../compiler/bywise/bywise-blockchain';
import { ContractABI, Environment, Type, Types, Variable } from '../compiler/vm/data';
import BywiseVirtualMachine from '../compiler/vm/virtual-machine';
import { Configs, Transactions, Wallets } from '../models';
import { ContractsEnv } from '../models/contracts-env.model';
import { ContractsVars } from '../models/contracts-vars.model';
import { ConfigsRepository, WalletsRepository } from '../repositories';
import { ContractsEnvRepository } from '../repositories/contracts-env.repository';
import { ContractsVarsRepository } from '../repositories/contracts-vars.repository';
import { CommandDTO, SimulateSliceDTO, TransactionOutputDTO } from '../types/transactions.type';
import { ContractsVarsProvider } from './contracts-vars.service';
import { TxType, BywiseHelper } from '@bywise/web3';

@injectable({ scope: BindingScope.TRANSIENT })
export class VirtualMachineProvider implements BywiseBlockchainInterface {
  constructor(
    @repository(WalletsRepository) public walletsRepository: WalletsRepository,
    @repository(ContractsEnvRepository) public contractsEnvRepository: ContractsEnvRepository,
    @repository(ContractsVarsRepository) public contractsVarsRepository: ContractsVarsRepository,
    @repository(ConfigsRepository) public configsRepository: ConfigsRepository,
    @service(ContractsVarsProvider) public contractsVarsProvider: ContractsVarsProvider,
  ) { }

  async getWallet(address: string, ctx: SimulateSliceDTO): Promise<Wallets> {
    for (let i = 0; i < ctx.walletsModels.length; i++) {
      let updatedWallet = ctx.walletsModels[i];
      if (updatedWallet.address === address) {
        return updatedWallet;
      }
    }
    let wallet = null;
    if (ctx.simulate) {
      wallet = new Wallets({
        balance: '100',
        address: address,
      });
    } else {
      if (!wallet) {
        wallet = await this.walletsRepository.findOne({ where: { address: address } });
      }
      if (!wallet) {
        wallet = await this.walletsRepository.create({
          balance: '0',
          address: address,
        });
      }
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
    let contractEnv = await this.contractsEnvRepository.findOne({ where: { address: address } });
    if (!contractEnv) {
      if (ctx.simulate) {
        contractEnv = new ContractsEnv({ address });
      } else {
        contractEnv = await this.contractsEnvRepository.create({
          address: address,
        });
      }
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
    let contractVars = await this.contractsVarsRepository.findOne({ where: { address, key } });
    if (!contractVars) {
      if (ctx.simulate) {
        contractVars = new ContractsVars({ address, key });
      } else {
        contractVars = await this.contractsVarsRepository.create({
          address,
          key,
        });
      }
    }
    ctx.contractVarsModels.push(contractVars);
    return contractVars;
  }

  async getConfig(name: string, ctx: SimulateSliceDTO): Promise<Configs> {
    for (let i = 0; i < ctx.configs.length; i++) {
      let config = ctx.configs[i];
      if (config.name === name) {
        return config;
      }
    }
    let config = await this.configsRepository.findOne({ where: { name } });
    if (!config) {
      if (ctx.simulate) {
        config = new Configs({ name });
      } else {
        config = await this.configsRepository.create({
          name,
        });
      }
    }
    ctx.configs.push(config);
    return config;
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

  private async sub(senderAddress: string, amount: BigNumber, ctx: SimulateSliceDTO) {
    const sender = await this.getWallet(senderAddress, ctx);
    const senderBalance = new BigNumber(sender.balance);
    if (senderBalance.minus(amount).isLessThan(new BigNumber(0))) {
      const remainder = amount.minus(senderBalance);
      sender.balance = (new BigNumber(0)).toString();
      return remainder;
    } else {
      sender.balance = senderBalance.minus(amount).toString();
      return new BigNumber(0);
    }
  }

  private async add(recipientAddress: string, amount: BigNumber, ctx: SimulateSliceDTO) {
    const recipient = await this.getWallet(recipientAddress, ctx);
    const recipientBalance = new BigNumber(recipient.balance);
    recipient.balance = recipientBalance.plus(amount).toString();
  }

  async executeTransaction(tx: Transactions, ctx: SimulateSliceDTO): Promise<TransactionOutputDTO> {
    let transactionOutput = new TransactionOutputDTO();
    transactionOutput.cost = 0;
    transactionOutput.size = JSON.stringify(tx.data).length;

    ctx.tx = tx;
    let debit = new BigNumber(tx.fee);
    ctx.totalFee = new BigNumber(ctx.totalFee).plus(debit).toString();
    for (let i = 0; i < tx.to.length; i++) {
      const to = tx.to[i];
      const amount = new BigNumber(tx.amount[i]);
      debit = debit.plus(amount);
      await this.add(to, amount, ctx);
    }
    for (let i = 0; i < tx.from.length; i++) {
      const from = tx.from[i];
      debit = await this.sub(from, debit, ctx);
    }
    if (debit.isGreaterThan(new BigNumber(0))) {
      throw new Error('insufficient funds');
    }

    if (tx.type === TxType.TX_CONTRACT) {
      let contract = ContractABI.fromJSON(tx.data);
      await this.getWallet(contract.address, ctx);
      let contractEnv = await this.getContractEnv(contract.address, ctx);
      if (contractEnv.env) {
        throw new Error(`Contract ${contract.address} already exists`);
      }
      let isMainnet = ContractProvider.isMainNet();
      let executeLimit = await this.getConfig('executeLimit', ctx);

      let output = await BywiseVirtualMachine.exec(
        ctx,
        isMainnet,
        parseInt(executeLimit.value),
        contract,
        this
      );
      contractEnv.env = output.env;
      transactionOutput.cost = output.cost;
      transactionOutput.logs = output.logs;
    } else if (tx.type === TxType.TX_CONTRACT_EXE) {
      let contractEnv = await this.getContractEnv(tx.to[0], ctx);
      if (!contractEnv.env) {
        throw new Error(`Contract ${tx.to} not found`);
      }
      let env = Environment.fromJSON(contractEnv.env);
      let executeLimit = await this.getConfig('executeLimit', ctx);
      let cmd = new CommandDTO(tx.data);
      let output = await BywiseVirtualMachine.execFunction(
        ctx,
        parseInt(executeLimit.value),
        env,
        this,
        cmd.name,
        cmd.input,
      );

      contractEnv.env = env.toJSON();
      transactionOutput.output = output.output;
      transactionOutput.cost = output.cost;
      transactionOutput.logs = output.logs;
    } else if (tx.type === TxType.TX_COMMAND) {
      let cmd = new CommandDTO(tx.data);
      await this.setConfig(ctx, cmd);
    }

    let configFee = await this.getConfig('fee', ctx);
    let code = '';
    code += `const BigNumber = require("bignumber.js");\n`;
    code += `let size = new BigNumber('${transactionOutput.size}');\n`;
    code += `let amount = new BigNumber('${tx.amount}');\n`;
    code += `let cost = new BigNumber('${transactionOutput.cost}');\n`;
    code += `${configFee.value}`;
    let fee = `${eval(code)}`;

    if (fee !== tx.fee && !ctx.simulate) {
      throw new Error(`Invalid fee`);
    }
    transactionOutput.fee = fee;
    transactionOutput.output = transactionOutput.output
    tx.output = transactionOutput;
    return transactionOutput;
  }

  async checkAdminAddress(ctx: SimulateSliceDTO) {
    let adminAddress = await this.getConfig('adminAddress', ctx);
    if (adminAddress.value !== BywiseHelper.ZERO_ADDRESS && (!ctx.tx || adminAddress.value !== ctx.tx.from[0])) {
      throw new Error(`setConfig forbidden`);
    }
  }

  async setConfig(ctx: SimulateSliceDTO, cmd: CommandDTO): Promise<void> {
    if (cmd.name == 'setConfig' && cmd.input.length === 3) {
      await this.checkAdminAddress(ctx);
      let configs = await this.configsRepository.find();
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
      if (BywiseHelper.isValidAddress(address)) {
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
      if (BywiseHelper.isValidAddress(address)) {
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
      if (BywiseHelper.isValidAddress(address)) {
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
      let wallet = await this.getWallet(ctx.tx.from[0], ctx);
      if (key === 'name') wallet.name = value;
      if (key === 'url') wallet.url = value;
      if (key === 'bio') wallet.bio = value;
      if (key === 'photo') wallet.photo = value;
      if (key === 'publicKey') wallet.publicKey = value;
      return;
    }
    throw new Error("Method not implemented.");
  }

  async executeFunction(ctx: SimulateSliceDTO, env: Environment, name: string, inputs: Variable[]): Promise<Variable[]> {
    if (name === 'print') {
      console.log('Execute funtion on bywise inteface', inputs.map(v => v.value).join(' '))
      return [];
    } else if (name === 'balanceOf') {
      if (inputs.length === 1) {
        if (BywiseHelper.isValidAddress(inputs[0].value)) {
          let wallet = await this.getWallet(inputs[0].value, ctx);
          return [new Variable(Types.number, wallet.balance)];
        } else {
          throw new Error(`invalid address ${inputs[0]}`);
        }
      } else {
        throw new Error(`invalid input size - expected ${1} received ${inputs.length}`);
      }
    } else if (name === 'tx.from') {
      if (!ctx.tx) throw new Error("Transaction context not found");
      return [new Variable(Types.address, ctx.tx.from[0])];
    } else if (name === 'tx.amount') {
      if (!ctx.tx) throw new Error("Transaction context not found");
      return [new Variable(Types.number, ctx.tx.amount[0])];
    }
    throw new Error("Method not implemented.");
  }

  pushArray = async (ctx: SimulateSliceDTO, env: Environment, registerId: string, value: Variable, index: number | undefined): Promise<void> => {
    if (!ctx.tx) throw new Error("Transaction context not found");
    await this.contractsVarsProvider.arrayPush(ctx.simulateId, ctx.tx.to[0], registerId, value.value, value.type, index);
  }
  popArray = async (ctx: SimulateSliceDTO, env: Environment, registerId: string, index: number | undefined): Promise<Variable> => {
    if (!ctx.tx) throw new Error("Transaction context not found");
    return await this.contractsVarsProvider.arrayPop(ctx.simulateId, ctx.tx.to[0], registerId, index);
  }
  getArrayLength = async (ctx: SimulateSliceDTO, env: Environment, registerId: string): Promise<number> => {
    if (!ctx.tx) throw new Error("Transaction context not found");
    return await this.contractsVarsProvider.getArrayLength(ctx.simulateId, ctx.tx.to[0], registerId);
  }
  getArray = async (ctx: SimulateSliceDTO, env: Environment, registerId: string, index: number): Promise<Variable | null> => {
    if (!ctx.tx) throw new Error("Transaction context not found");
    return await this.contractsVarsProvider.getArray(ctx.simulateId, ctx.tx.to[0], registerId, index);
  }

  setMap = async (ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string, value: Variable): Promise<void> => {
    if (!ctx.tx) throw new Error("Transaction context not found");
    await this.contractsVarsProvider.setMap(ctx.simulateId, ctx.tx.to[0], registerId, key, value.value, value.type);
  }
  getMap = async (ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string): Promise<Variable | null> => {
    if (!ctx.tx) throw new Error("Transaction context not found");
    return await this.contractsVarsProvider.getMap(ctx.simulateId, ctx.tx.to[0], registerId, key);
  }
  delMap = async (ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string): Promise<void> => {
    if (!ctx.tx) throw new Error("Transaction context not found");
    await this.contractsVarsProvider.delMap(ctx.simulateId, ctx.tx.to[0], registerId, key);
  }
}