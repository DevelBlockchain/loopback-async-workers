import { injectable, BindingScope, Provider, service } from '@loopback/core';
import { base16Decode, base16Encode, sha256, signBytes } from '@waves/ts-lib-crypto';
import { WalletProvider } from '.';
import { Blocks, Slices, Transactions } from '../models';
import { ContractProvider } from './contract.service';

@injectable({ scope: BindingScope.TRANSIENT })
export class BlockchainProvider {

  constructor(
    @service(ContractProvider) private contractProvider: ContractProvider
  ) {

  }

  private static numberToHex(number: number) {
    let hex = number.toString(16);
    if ((hex.length % 2) > 0) {
      hex = "0" + hex;
    }
    while (hex.length < 16) {
      hex = "00" + hex;
    }
    if (hex.length > 16 || number < 0) {
      throw new Error(`invalid pointer "${number}"`);
    }
    return hex;
  }

  static getHashFromTransaction(tx: Transactions): string {
    let bytes = '';
    bytes += Buffer.from(tx.version, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.from, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.to, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.amount, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.fee, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.type, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.data, 'utf-8').toString('hex');
    if(tx.foreignKeys) {
      tx.foreignKeys.forEach(key => {
        bytes += key;
      })
    }
    bytes += Buffer.from(tx.created, 'utf-8').toString('hex');
    bytes = base16Encode(sha256(base16Decode(bytes))).substring(2);
    return bytes;
  }

  static getHashFromSlice(slice: Slices): string {
    let bytes = '';
    bytes += BlockchainProvider.numberToHex(slice.height);
    bytes += BlockchainProvider.numberToHex(slice.numberOfTransactions);
    bytes += Buffer.from(slice.version, 'utf-8').toString('hex');
    bytes += Buffer.from(slice.createdBy, 'utf-8').toString('hex');
    bytes += Buffer.from(slice.created, 'utf-8').toString('hex');
    bytes += slice.merkleRoot;
    bytes += slice.lastHash;
    bytes = base16Encode(sha256(base16Decode(bytes))).substring(2);
    return bytes;
  }

  static getHashFromBlock(block: Blocks): string {
    let bytes = '';
    bytes += BlockchainProvider.numberToHex(block.height);
    bytes += BlockchainProvider.numberToHex(block.numberOfTransactions);
    bytes += Buffer.from(block.version, 'utf-8').toString('hex');
    bytes += Buffer.from(block.createdBy, 'utf-8').toString('hex');
    bytes += Buffer.from(block.created, 'utf-8').toString('hex');
    bytes += block.merkleRoot;
    bytes += block.lastHash;
    bytes = base16Encode(sha256(base16Decode(bytes))).substring(2);
    return bytes;
  }

  async createNewTransaction(to: string, amount: string, fee: string, type: string, data: string, foreignKeys?: string[]) {
    if (!WalletProvider.isBywiseAddress(to)) {
      throw new Error('invalid address ' + to);
    }
    if (!/ˆ[0-9](\.[0-9]+)?$/.test(amount)) {
      throw new Error('invalid amount ' + amount);
    }
    if (!/ˆ[0-9](\.[0-9]+)?$/.test(fee)) {
      throw new Error('invalid fee ' + fee);
    }
    if(foreignKeys) {
      foreignKeys.forEach(key => {
        if (!/ˆ[A-Fa-f0-9]{64}$/.test(key)) {
          throw new Error('invalid foreignKey ' + key);
        }
      })
    }
    
    let account = this.contractProvider.getAccount();
    let tx = new Transactions();
    tx.version = '1';
    tx.from = WalletProvider.getBywiseAddress(account.publicKey);
    tx.to = to;
    tx.amount = amount;
    tx.fee = fee;
    tx.type = type;
    tx.data = data;
    tx.foreignKeys = foreignKeys;
    tx.created = (new Date()).toISOString();

    tx.hash = BlockchainProvider.getHashFromTransaction(tx);
    tx.sign = (await account.signMessage(Buffer.from(tx.hash, 'hex')));
    return tx;
  }

  async createNewSlice(transactions: Transactions[], lastSlice?: Slices | undefined) {
    let account = this.contractProvider.getAccount();
    let slice = new Slices();
    slice.isPublic = true;
    slice.height = 0;
    slice.numberOfTransactions = transactions.length;
    slice.transactions = transactions.map(tx => tx.hash);
    slice.version = '1';
    slice.createdBy = WalletProvider.getBywiseAddress(account.publicKey);
    slice.created = (new Date()).toISOString();
    let hash = '';
    if (slice.transactions.length > 0) {
      slice.transactions.forEach(txHash => {
        hash += txHash;
      })
    } else {
      hash = '0000000000000000000000000000000000000000000000000000000000000000'
    }
    slice.merkleRoot = hash;
    if (transactions.length > 0) {
      let hash = '';
      transactions.forEach(txHash => {
        hash += txHash;
      })
      slice.merkleRoot = base16Encode(sha256(base16Decode(hash))).substring(2);
    } else {
      slice.merkleRoot = '0000000000000000000000000000000000000000000000000000000000000000';
    }
    slice.hash = BlockchainProvider.getHashFromSlice(slice);
    slice.sign = (await account.signMessage(Buffer.from(slice.hash, 'hex')));
    return slice;
  }

  async createNewBlock(slices: Slices[], lastBlock?: Blocks | undefined) {
    let account = this.contractProvider.getAccount();
    let block = new Blocks();
    if (lastBlock) {
      block.height = lastBlock.height + 1;
    } else {
      block.height = 0;
    }
    block.numberOfTransactions = 0;
    slices = slices.sort((a, b) => a.height - b.height);
    slices.forEach(slice => {
      block.numberOfTransactions += slice.numberOfTransactions;
    })
    block.version = '1';
    block.createdBy = WalletProvider.getBywiseAddress(account.publicKey);
    block.created = (new Date()).toISOString();
    if (slices.length > 0) {
      let hash = '';
      slices.forEach(slice => {
        hash += BlockchainProvider.getHashFromSlice(slice);
      })
      block.merkleRoot = base16Encode(sha256(base16Decode(hash))).substring(2);
    } else {
      block.merkleRoot = '0000000000000000000000000000000000000000000000000000000000000000';
    }
    if (lastBlock) {
      block.lastHash = block.hash;
    } else {
      block.lastHash = '0000000000000000000000000000000000000000000000000000000000000000';
    }
    block.hash = BlockchainProvider.getHashFromBlock(block);
    block.sign = (await account.signMessage(Buffer.from(block.hash, 'hex')));
    block.externalTxID = '';
    return block;
  }
}
