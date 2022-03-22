import { injectable, BindingScope, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { SlicesProvider } from '.';
import { BlocksRepository } from '../repositories';
import { ContractProvider } from './contract.service';
import { Block, Slice } from '@bywise/web3';

@injectable({ scope: BindingScope.TRANSIENT })
export class BlocksProvider {

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

  async addNewBLock(block: Block) {
    await this.validadeBlock(block);
    await this.slicesProvider.consolidateSlices(block);
    console.log('add new block');
  }

  async validadeBlock(block: Block) {
    block.isValid();
    let lastBlockParams = await this.getLastHashAndHeight();
    if (block.height !== lastBlockParams.lastHeight + 1) {
      throw new Error('invalid block height ' + block.height);
    }
    if (block.lastHash !== lastBlockParams.lastHash) {
      throw new Error(`invalid block lastHash ${block.lastHash} ${lastBlockParams.lastHash}`);
    }
  }

  async createNewBlock(slices: Slice[]) {
    let lastBlockParams = await this.getLastHashAndHeight();
    let wallet = this.contractProvider.getWallet();
    let block = new Block();
    block.height = lastBlockParams.lastHeight + 1;
    slices = slices.sort((a, b) => a.height - b.height);
    block.slices = slices.map(tx => tx.hash);
    block.version = '1';
    block.from = wallet.address;
    block.nextBlock = wallet.address;
    block.nextSlice = wallet.address;
    block.created = (new Date()).toISOString();
    block.lastHash = lastBlockParams.lastHash;
    block.hash = block.toHash();
    block.sign = await wallet.signHash(block.hash);
    block.externalTxID = [];
    return block;
  }
}
