import { injectable, BindingScope, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { base16Decode, base16Encode, sha256 } from '@waves/ts-lib-crypto';
import { ethers } from 'ethers';
import { SlicesProvider, WalletProvider } from '.';
import { BlocksRepository } from '../repositories';
import { BlockDTO, SliceDTO, TransactionsDTO } from '../types/transactions.type';
import { numberToHex } from '../utils/helper';
import { ContractProvider } from './contract.service';

@injectable({ scope: BindingScope.TRANSIENT })
export class BlocksProvider {

  //static lastHash: string = '0000000000000000000000000000000000000000000000000000000000000000';
  //static lastHeight: number = -1;

  constructor(
    @service(ContractProvider) private contractProvider: ContractProvider,
    @service(SlicesProvider) private slicesProvider: SlicesProvider,
    @repository(BlocksRepository) public blocksRepository: BlocksRepository,
  ) {
  }

  async getLastHashAndHeight() {
    let lastBlockParams = {
      lastHash: '0000000000000000000000000000000000000000000000000000000000000000',
      lastHeight: -1,
    }
    let lastBlock = await this.blocksRepository.findOne({
      order: ['height DESC']
    })
    if (lastBlock) {
      lastBlockParams.lastHash = lastBlock.hash;
      lastBlockParams.lastHeight = lastBlock.height;
    }
    return lastBlockParams;
  }

  async addNewBLock(block: BlockDTO) {
    await this.validadeBlock(block);
    await this.slicesProvider.consolidateSlices(block);
    console.log('add new block');
  }

  async validadeBlock(block: BlockDTO) {
    let lastBlockParams = await this.getLastHashAndHeight();
    if (block.height !== lastBlockParams.lastHeight + 1) {
      throw new Error('invalid block height ' + block.height);
    }
    if (block.lastHash !== lastBlockParams.lastHash) {
      throw new Error(`invalid block lastHash ${block.lastHash} ${lastBlockParams.lastHash}`);
    }
    if (!/^[0-9a-f]{64}$/.test(block.hash)) {
      throw new Error('invalid block hash ' + block.hash);
    }
    let numberOfTransactions = 0;
    for (let i = 0; i < block.slices.length; i++) {
      let sliceHash = block.slices[i];
      let slice = this.slicesProvider.getSlice(sliceHash);
      if (!slice) {
        throw new Error('block slice ' + sliceHash + ' not found');
      }
      numberOfTransactions += slice.numberOfTransactions
    }
    if (numberOfTransactions !== block.numberOfTransactions) {
      throw new Error('invalid block numberOfTransactions ' + numberOfTransactions + ' ' + block.numberOfTransactions);
    }
    if (block.version !== '1') {
      throw new Error('invalid block version ' + block.version);
    }
    if (!WalletProvider.isValidAddress(block.from)) {
      throw new Error('invalid block from address ' + block.from);
    }
    let hash = '';
    if (block.slices.length > 0) {
      block.slices.forEach(sliceHash => {
        hash += sliceHash;
      })
      hash = base16Encode(sha256(base16Decode(hash))).substring(2).toLowerCase();
    } else {
      hash = '0000000000000000000000000000000000000000000000000000000000000000'
    }
    if (block.merkleRoot !== hash) {
      throw new Error(`invalid block merkle root ${block.merkleRoot} ${hash}`);
    }
    hash = BlocksProvider.getHashFromBlock(block);
    if (block.hash !== hash) {
      throw new Error(`invalid block hash ${block.hash} ${hash}`);
    }
    let recoveredAddress = ethers.utils.verifyMessage(Buffer.from(hash, 'hex'), block.sign);
    let decodeAddress = WalletProvider.decodeBWSAddress(block.from);
    if (recoveredAddress !== decodeAddress.ethAddress) {
      throw new Error('invalid block signature');
    }
  }

  private static getHashFromBlock(block: BlockDTO): string {
    let bytes = '';
    bytes += numberToHex(block.height);
    bytes += numberToHex(block.numberOfTransactions);
    bytes += Buffer.from(block.version, 'utf-8').toString('hex');
    bytes += Buffer.from(block.from, 'utf-8').toString('hex');
    bytes += Buffer.from(block.created, 'utf-8').toString('hex');
    bytes += block.merkleRoot;
    bytes += block.lastHash;
    bytes = base16Encode(sha256(base16Decode(bytes))).toLowerCase();
    return bytes;
  }

  async createNewBlock(slices: SliceDTO[]) {
    let lastBlockParams = await this.getLastHashAndHeight();
    let account = this.contractProvider.getAccount();
    let block = new BlockDTO();
    block.height = lastBlockParams.lastHeight + 1;
    slices = slices.sort((a, b) => a.height - b.height);
    block.numberOfTransactions = 0;
    block.slices = slices.map(tx => tx.hash);
    slices.forEach(slice => {
      block.numberOfTransactions += slice.numberOfTransactions;
    })
    block.version = '1';
    block.from = WalletProvider.encodeBWSAddress(ContractProvider.isMainNet(), false, account.address);
    block.created = (new Date()).toISOString();
    if (slices.length > 0) {
      let hash = '';
      slices.forEach(slice => {
        hash += slice.hash;
      })
      block.merkleRoot = base16Encode(sha256(base16Decode(hash))).substring(2);
    } else {
      block.merkleRoot = '0000000000000000000000000000000000000000000000000000000000000000';
    }
    block.lastHash = lastBlockParams.lastHash;
    block.hash = BlocksProvider.getHashFromBlock(block);
    block.sign = (await account.signMessage(Buffer.from(block.hash, 'hex')));
    block.externalTxID = '';
    return block;
  }
}
