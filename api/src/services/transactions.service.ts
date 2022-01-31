import { injectable, BindingScope, Provider, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { ethers } from "ethers";
import { WalletProvider } from '.';
import { Transactions } from '../models';
import { TransactionsRepository } from '../repositories';
import { ContractProvider } from './contract.service';
import { SimulateSliceDTO, TransactionOutputDTO, TransactionsDTO, TransactionsStatus } from '../types/transactions.type';
import { VirtualMachineProvider } from './virtual-machine.service';
import { ConfigProvider } from './configs.service';
import { getHashFromTransaction } from '../utils/helper';

@injectable({ scope: BindingScope.TRANSIENT })
export class TransactionsProvider {

  static mempoolNotValidatedTransactions: TransactionsDTO[] = [];

  constructor(
    @repository(TransactionsRepository) private transactionsRepository: TransactionsRepository,
    @service(ContractProvider) private contractProvider: ContractProvider,
    @service(ConfigProvider) public configProvider: ConfigProvider,
    @service(VirtualMachineProvider) private virtualMachineProvider: VirtualMachineProvider,
  ) {
    
  }

  private static validadeTransaction(tx: TransactionsDTO) {
    if (!WalletProvider.isValidAddress(tx.validator)) {
      throw new Error('invalid transaction validator address ' + tx.validator);
    }
    if (!WalletProvider.isValidAddress(tx.from)) {
      throw new Error('invalid transaction sender address ' + tx.from);
    }
    if (!WalletProvider.isValidAddress(tx.to)) {
      throw new Error('invalid transaction recipient address ' + tx.to);
    }
    if (/^[0-9](\.[0-9]+)?$/.test(tx.amount)) {
      throw new Error('invalid transaction amount ' + tx.amount);
    }
    if (/^[0-9](\.[0-9]+)?$/.test(tx.fee)) {
      throw new Error('invalid transaction fee ' + tx.fee);
    }
    if (tx.foreignKeys) {
      tx.foreignKeys.forEach(key => {
        if (!/^[A-Fa-f0-9]{64}$/.test(key)) {
          throw new Error('invalid transaction foreignKey ' + key);
        }
      })
    }
    if (/^[0-9a-f]{40}$/.test(tx.hash)) {
      throw new Error('invalid transaction hash ' + tx.hash);
    }
  }

  async createNewTransaction(to: string, amount: string, fee: string, type: string, data: any, foreignKeys?: string[]) {
    let account = this.contractProvider.getAccount();
    let tx = new TransactionsDTO();
    tx.version = '1';
    tx.from = WalletProvider.encodeBWSAddress(ContractProvider.isMainNet(), false, account.address);
    tx.validator = tx.from;
    tx.to = to;
    let decodedAddress = WalletProvider.decodeBWSAddress(to);
    tx.tag = decodedAddress.tag;
    tx.amount = amount;
    tx.fee = fee;
    tx.type = type;
    tx.data = data;
    tx.foreignKeys = foreignKeys;
    tx.created = (new Date()).toISOString();

    TransactionsProvider.validadeTransaction(tx);

    tx.hash = getHashFromTransaction(tx);
    tx.sign = (await account.signMessage(Buffer.from(tx.hash, 'hex')));
    tx.validatorSign = tx.sign;
    return tx;
  }

  async simulateTransaction(tx: TransactionsDTO, ctx: SimulateSliceDTO): Promise<TransactionOutputDTO> {
    let newTx = new Transactions(tx);
    ctx.simulate = true;
    await this.virtualMachineProvider.executeTransaction(newTx, ctx);
    return newTx.output;
  }

  async saveTransaction(tx: TransactionsDTO): Promise<Transactions> {
    TransactionsProvider.validadeTransaction(tx);

    let hash = Buffer.from(getHashFromTransaction(tx), 'hex');
    let recoveredAddress = ethers.utils.verifyMessage(hash, tx.sign);
    let decodeAddress = WalletProvider.decodeBWSAddress(tx.from);
    if (recoveredAddress !== decodeAddress.ethAddress) {
      throw new Error('Invalid sender signature');
    }
    let validatorConfig = await this.configProvider.getByName('validator');
    if (tx.validator !== validatorConfig.value) {
      throw new Error('Invalid validator');
    }
    let sizeLimit = await this.configProvider.getByName('sizeLimit');
    if (tx.data.length > parseInt(sizeLimit.value)) {
      throw new Error('tx.data field exceeded the size limit');
    }
    if (tx.validatorSign) {
      let recoveredValidatorAddress = ethers.utils.verifyMessage(hash, tx.validatorSign);
      let decodeValidatorAddress = WalletProvider.decodeBWSAddress(tx.validator);
      if (recoveredValidatorAddress !== decodeValidatorAddress.ethAddress) {
        throw new Error('Invalid validator signature');
      }
    } else if (tx.validator !== WalletProvider.ZERO_ADDRESS) {
      throw new Error('Validator signature not found');
    }
    let registeredTx = await this.transactionsRepository.findOne({
      where: {
        hash: tx.hash
      }
    })
    if (!registeredTx) {
      let ctx = new SimulateSliceDTO();
      let newTx = new Transactions(tx);
      await this.virtualMachineProvider.executeTransaction(newTx, ctx);
      
      newTx.status = TransactionsStatus.TX_MEMPOOL;
      await this.transactionsRepository.create(newTx);
      return newTx;
    } else {
      throw new Error('Transaction already registered');
    }
  }
}
