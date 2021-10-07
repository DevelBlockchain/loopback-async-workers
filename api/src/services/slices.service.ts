import { injectable, BindingScope, Provider, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { base16Decode, base16Encode, sha256, signBytes } from '@waves/ts-lib-crypto';
import { ethers } from 'ethers';
import { WalletProvider } from '.';
import { Blocks, Slices, Transactions, TransactionsStatus, Wallets } from '../models';
import { SlicesRepository, TransactionsRepository, WalletsRepository } from '../repositories';
import { BlockDTO, SliceDTO, TransactionsDTO } from '../types/transactions.type';
import { numberToHex } from '../utils/helper';
import { ContractProvider } from './contract.service';

@injectable({ scope: BindingScope.TRANSIENT })
export class SlicesProvider {

  private static mempoolSlices: SliceDTO[] = [];

  constructor(
    @repository(SlicesRepository) private slicesRepository: SlicesRepository,
    @repository(TransactionsRepository) private transactionsRepository: TransactionsRepository,
    @repository(WalletsRepository) public walletsRepository: WalletsRepository,
    @service(ContractProvider) private contractProvider: ContractProvider,
    @service(WalletProvider) private walletProvider: WalletProvider,
  ) {

  }

  async validadeSlice(lastBlockHash: string, slice: SliceDTO) {
    if (slice.height < 0) {
      throw new Error('invalid slice height ' + slice.height);
    }
    if (slice.lastBlockHash !== lastBlockHash) {
      throw new Error(`invalid slice lastBlockHash ${slice.lastBlockHash} ${lastBlockHash}`);
    }
    if (/ˆ[0-9a-f]{40}$/.test(slice.lastBlockHash)) {
      throw new Error('invalid slice lastBlockHash ' + slice.lastBlockHash);
    }
    if (slice.numberOfTransactions <= 0) {
      throw new Error('invalid numberOfTransactions ' + slice.numberOfTransactions);
    }
    if (slice.transactions.length !== slice.numberOfTransactions) {
      throw new Error('invalid slice length ' + slice.transactions.length + ' ' + slice.numberOfTransactions);
    }
    if (slice.isPublic) {
      for (let i = 0; i < slice.transactions.length; i++) {
        let txHash = slice.transactions[i];
        let tx = await this.transactionsRepository.findOne({ where: { hash: txHash } });
        if (!tx) {
          throw new Error('slice transaction ' + txHash + ' not found');
        }
        if (tx.status !== TransactionsStatus.TX_MEMPOOL) {
          throw new Error(`slice transaction ${txHash} already registered`);
        }
      }
    }
    if (slice.version !== '1') {
      throw new Error('invalid slice version ' + slice.version);
    }
    if (!WalletProvider.isValidAddress(slice.from)) {
      throw new Error('invalid slice from address ' + slice.from);
    }
    let hash = '';
    if (slice.transactions.length > 0) {
      slice.transactions.forEach(txHash => {
        hash += txHash;
      })
      hash = base16Encode(sha256(base16Decode(hash))).substring(2).toLowerCase();
    } else {
      hash = '0000000000000000000000000000000000000000000000000000000000000000'
    }
    if (slice.merkleRoot !== hash) {
      throw new Error(`invalid slice merkle root ${slice.merkleRoot} ${hash}`);
    }
    hash = SlicesProvider.getHashFromSlice(slice);
    if (slice.hash !== hash) {
      throw new Error(`invalid slice hash ${slice.hash} ${hash}`);
    }
    let recoveredAddress = ethers.utils.verifyMessage(Buffer.from(hash, 'hex'), slice.sign);
    let decodeAddress = WalletProvider.decodeBWSAddress(slice.from);
    if (recoveredAddress !== decodeAddress.ethAddress) {
      throw new Error('invalid slice signature');
    }
  }

  private static getHashFromSlice(slice: SliceDTO): string {
    let bytes = '';
    bytes += numberToHex(slice.height);
    bytes += numberToHex(slice.numberOfTransactions);
    bytes += Buffer.from(slice.version, 'utf-8').toString('hex');
    bytes += Buffer.from(slice.from, 'utf-8').toString('hex');
    bytes += Buffer.from(slice.created, 'utf-8').toString('hex');
    bytes += slice.merkleRoot;
    bytes += slice.lastBlockHash;
    bytes = base16Encode(sha256(base16Decode(bytes))).substring(2).toLowerCase();
    return bytes;
  }

  getMempoolSlices(): SliceDTO[] {
    return SlicesProvider.mempoolSlices.map(slice => slice);
  }

  getSlice(sliceHash: string): SliceDTO | null {
    for (let i = 0; i < SlicesProvider.mempoolSlices.length; i++) {
      if (SlicesProvider.mempoolSlices[i].hash === sliceHash) {
        return SlicesProvider.mempoolSlices[i];
      }
    }
    return null;
  }

  async addSlice(lastBlockHash: string, slice: SliceDTO): Promise<boolean> {
    for (let i = 0; i < SlicesProvider.mempoolSlices.length; i++) {
      if (SlicesProvider.mempoolSlices[i].hash === slice.hash) {
        return false;
      }
    }
    await this.validadeSlice(lastBlockHash, slice);
    SlicesProvider.mempoolSlices.push(slice);
    return true;
  }

  async consolidateSlices(slices: string[], simulate = false) {
    let walletsModels: Wallets[] = [];
    let slicesModels: SliceDTO[] = [];
    let transactionsModels: Transactions[] = [];
    for (let i = 0; i < slices.length; i++) {
      let sliceHash = slices[i];
      let slice = this.getSlice(sliceHash);
      if (!slice) {
        throw new Error('mempool slice ' + sliceHash + ' not found');
      }
      slicesModels.push(slice);
      for (let i = 0; i < slice.transactions.length; i++) {
        let txHash = slice.transactions[i];
        let tx = await this.transactionsRepository.findOne({ where: { hash: txHash } });
        if (!tx) {
          throw new Error('slice transaction ' + txHash + ' not found');
        }
        if (tx.status !== TransactionsStatus.TX_MEMPOOL) {
          throw new Error(`slice transaction ${txHash} already registered`);
        }
        tx.status = TransactionsStatus.TX_MINED;
        await this.walletProvider.executeTransaction(tx, walletsModels);
        transactionsModels.push(tx);
      }
    }
    if (!simulate) {
      SlicesProvider.mempoolSlices = [];
      for (let i = 0; i < slicesModels.length; i++) {
        await this.slicesRepository.create(slicesModels[i]);
      }
      for (let i = 0; i < transactionsModels.length; i++) {
        await this.transactionsRepository.update(transactionsModels[i]);
      }
      for (let i = 0; i < walletsModels.length; i++) {
        await this.walletsRepository.update(walletsModels[i]);
      }
    }
  }

  async createNewSlice(lastBlockHash: string, transactions: TransactionsDTO[]) {
    let account = this.contractProvider.getAccount();
    let slice = new SliceDTO();
    slice.height = 0;
    slice.isPublic = true;
    slice.numberOfTransactions = transactions.length;
    slice.transactions = transactions.map(tx => tx.hash);
    slice.version = '1';
    slice.lastBlockHash = lastBlockHash.toLowerCase();
    slice.from = WalletProvider.encodeBWSAddress(ContractProvider.isMainNet(), false, account.address);
    slice.created = (new Date()).toISOString();
    if (transactions.length > 0) {
      let hash = '';
      transactions.forEach(tx => {
        hash += tx.hash;
      })
      slice.merkleRoot = base16Encode(sha256(base16Decode(hash))).substring(2).toLowerCase();
    } else {
      slice.merkleRoot = '0000000000000000000000000000000000000000000000000000000000000000';
    }
    slice.hash = SlicesProvider.getHashFromSlice(slice);
    slice.sign = (await account.signMessage(Buffer.from(slice.hash, 'hex')));
    return slice;
  }
}
