import { service } from '@loopback/core';
import { workerJob, WorkerJob } from 'loopback-async-workers';
import { repository } from '@loopback/repository';
import { Blocks, Slices, Transactions } from '../models';
import { BlocksRepository } from '../repositories';
import { SlicesProvider, BlocksProvider, NodesProvider, TransactionsProvider } from '../services';
import { NodeDTO } from '../types';
import { BywiseAPI } from '../utils/bywise-api';
import { Slice, Block, Tx } from '@bywise/web3';

const blockToBlockDTO = (block: Blocks) => {
  let blockDTO = new Block();
  blockDTO.created = block.created;
  blockDTO.from = block.from;
  blockDTO.hash = block.hash;
  blockDTO.height = block.height;
  blockDTO.lastHash = block.lastHash;
  blockDTO.sign = block.sign;
  blockDTO.slices = block.slices;
  blockDTO.version = block.version;
  return blockDTO;
}
const sliceToSliceDTO = (slice: Slices) => {
  let sliceDTO = new Slice();
  sliceDTO.created = slice.created;
  sliceDTO.from = slice.from;
  sliceDTO.hash = slice.hash;
  sliceDTO.height = slice.height;
  sliceDTO.lastBlockHash = slice.lastBlockHash;
  sliceDTO.sign = slice.sign;
  sliceDTO.transactions = slice.transactions;
  sliceDTO.version = slice.version;
  return sliceDTO;
}
const txToTxDTO = (tx: Transactions) => {
  let txDTO = new Tx();
  txDTO.amount = tx.amount;
  txDTO.created = tx.created;
  txDTO.data = tx.data;
  txDTO.fee = tx.fee;
  txDTO.foreignKeys = tx.foreignKeys;
  txDTO.from = tx.from;
  txDTO.hash = tx.hash;
  txDTO.sign = tx.sign;
  txDTO.tag = tx.tag;
  txDTO.to = tx.to;
  txDTO.type = tx.type;
  txDTO.validator = tx.validator;
  txDTO.validatorSign = tx.validatorSign;
  txDTO.version = tx.version;
  return txDTO;
}

@workerJob()
export class SyncBlockchain extends WorkerJob {

  constructor(
    @service(NodesProvider) private nodesProvider: NodesProvider,
    @service(SlicesProvider) private slicesProvider: SlicesProvider,
    @service(BlocksProvider) private blocksProvider: BlocksProvider,
    @service(TransactionsProvider) private transactionsProvider: TransactionsProvider,
    @repository(BlocksRepository) public blocksRepository: BlocksRepository,
  ) {
    super({
      name: 'task-sync-blockchain',
      onTick: async () => {
        await this.stop();
        try {
          if (`${process.env.CREATE_BLOCKS}`.toLowerCase() !== 'true') {
            await this.runProcess();
          }
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/5 * * * * *',
    });
  }

  runProcess = async () => {
    let nodes = this.nodesProvider.getNodes();
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      let lastBlockParams = await this.blocksProvider.getLastHashAndHeight();
      let lastBlock = await BywiseAPI.getBlocks(node, {
        filter: {
          limit: 10,
          order: "height ASC",
          where: {
            height: { gt: lastBlockParams.lastHeight }
          }
        }
      });
      if (!lastBlock.error) {
        let blocks: Blocks[] = lastBlock.data;
        for (let j = 0; j < blocks.length; j++) {
          await this.addBlock(node, blockToBlockDTO(blocks[j]));
        }
      }
    }
  }

  async addBlock(node: NodeDTO, block: Block) {
    let lastHash = (await this.blocksProvider.getLastHashAndHeight()).lastHash;
    let slices: Slice[] = [];
    for (let i = 0; i < block.slices.length; i++) {
      let sliceHash = block.slices[i];
      let req = await BywiseAPI.getSlice(node, sliceHash);
      if (req.error) {
        throw new Error(`cant sync slice ${sliceHash}`);
      }
      let slice: Slice = sliceToSliceDTO(req.data);
      slices.push(slice);
      req = await BywiseAPI.getTransactionFromSlice(node, sliceHash);
      if (req.error) {
        throw new Error(`cant sync slice ${sliceHash}`);
      }
      let txs: Transactions[] = req.data;
      for (let j = 0; j < txs.length; j++) {
        let tx = txToTxDTO(txs[j]);
        await this.transactionsProvider.saveTransaction(tx);
      }
      await this.slicesProvider.addSlice(lastHash, slice);
    }
    await this.blocksProvider.addNewBLock(block);
  }
}