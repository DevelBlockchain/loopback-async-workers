import { injectable, BindingScope, Provider, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { ethers } from "ethers";
import { base16Decode, base16Encode, sha256, signBytes } from '@waves/ts-lib-crypto';
import { WalletProvider } from '.';
import { Transactions, TransactionsStatus } from '../models';
import { TransactionsRepository } from '../repositories';
import { ContractProvider } from './contract.service';
import { TransactionsDTO } from '../types/transactions.type';

@injectable({ scope: BindingScope.TRANSIENT })
export class TransactionsProvider {

  static mempoolNotValidatedTransactions: TransactionsDTO[] = [];

  constructor(
    @repository(TransactionsRepository) private transactionsRepository: TransactionsRepository,
    @service(ContractProvider) private contractProvider: ContractProvider
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
    if (/ˆ[0-9](\.[0-9]+)?$/.test(tx.amount)) {
      throw new Error('invalid transaction amount ' + tx.amount);
    }
    if (/ˆ[0-9](\.[0-9]+)?$/.test(tx.fee)) {
      throw new Error('invalid transaction fee ' + tx.fee);
    }
    if (tx.foreignKeys) {
      tx.foreignKeys.forEach(key => {
        if (!/ˆ[A-Fa-f0-9]{64}$/.test(key)) {
          throw new Error('invalid transaction foreignKey ' + key);
        }
      })
    }
    if (/ˆ[0-9a-f]{40}$/.test(tx.hash)) {
      throw new Error('invalid transaction hash ' + tx.hash);
    }
  }

  static getHashFromTransaction(tx: TransactionsDTO): string {
    let bytes = '';
    bytes += Buffer.from(tx.version, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.from, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.to, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.amount, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.fee, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.type, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.data, 'utf-8').toString('hex');
    if (tx.foreignKeys) {
      tx.foreignKeys.forEach(key => {
        bytes += key;
      })
    }
    bytes += Buffer.from(tx.created, 'utf-8').toString('hex');
    bytes = base16Encode(sha256(base16Decode(bytes))).substring(2).toLowerCase();
    return bytes;
  }

  async createNewTransaction(to: string, amount: string, fee: string, type: string, data: string, foreignKeys?: string[]) {
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

    tx.hash = TransactionsProvider.getHashFromTransaction(tx);
    tx.sign = (await account.signMessage(Buffer.from(tx.hash, 'hex')));
    tx.validatorSign = tx.sign;
    return tx;
  }

  async saveTransaction(tx: TransactionsDTO): Promise<boolean> {
    TransactionsProvider.validadeTransaction(tx);

    if (!tx.validatorSign) {
      for (let i = 0; i < TransactionsProvider.mempoolNotValidatedTransactions.length; i++) {
        let mempoolTx = TransactionsProvider.mempoolNotValidatedTransactions[i];
        if(tx.hash === mempoolTx.hash) {
          return false;
        }
      }
      TransactionsProvider.mempoolNotValidatedTransactions.push(tx);
      if(TransactionsProvider.mempoolNotValidatedTransactions.length > 1000) {
        TransactionsProvider.mempoolNotValidatedTransactions = TransactionsProvider.mempoolNotValidatedTransactions.slice(1);
      }
      return true;
    } else {
      let hash = Buffer.from(TransactionsProvider.getHashFromTransaction(tx), 'hex');
      let recoveredAddress = ethers.utils.verifyMessage(hash, tx.sign);
      let decodeAddress = WalletProvider.decodeBWSAddress(tx.from);
      if (recoveredAddress !== decodeAddress.ethAddress) {
        throw new Error('invalid sender signature');
      }
      recoveredAddress = ethers.utils.verifyMessage(hash, tx.validatorSign);
      decodeAddress = WalletProvider.decodeBWSAddress(tx.validator);
      if (recoveredAddress !== decodeAddress.ethAddress) {
        throw new Error('invalid validator signature');
      }
      let registeredTx = await this.transactionsRepository.findOne({
        where: {
          hash: tx.hash
        }
      })
      if (!registeredTx) {
        let newTx = new Transactions(tx);
        newTx.status = TransactionsStatus.TX_MEMPOOL;
        console.log(newTx)
        await this.transactionsRepository.create(newTx);
        return true;
      } else {
        return false;
      }
    }
  }
}