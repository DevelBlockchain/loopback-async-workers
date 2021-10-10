import { service } from '@loopback/core';
import { CronJob, cronJob } from '@loopback/cron';
import { repository } from '@loopback/repository';
import { BlocksRepository } from '../repositories';
import { SlicesProvider, BlocksProvider, NodesProvider, TransactionsProvider } from '../services';
import { BlockDTO, NodeDTO, SimulateSliceDTO, SliceDTO, TransactionsDTO } from '../types';
import { BywiseAPI } from '../utils/bywise-api';

@cronJob()
export class SyncBlockchain extends CronJob {

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
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/5 * * * * *',
    });
  }

  runProcess = async () => {
    console.log('init sync task')
    let nodes = this.nodesProvider.getNodes();
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      console.log('try sync node', node.host)
      let lastBlockParams = await this.blocksProvider.getLastHashAndHeight();
      let lastBlock = await BywiseAPI.getBlocks(node, {
        filter: {
          order: "height ASC",
          limit: 10,
          where: {
            gt: lastBlockParams.lastHeight
          }
        }
      });
      if (!lastBlock.error) {
        let blocks: BlockDTO[] = lastBlock.data;
        console.log('try sync blocks', blocks.length)
        for (let j = 0; j < blocks.length; j++) {
          await this.addBlock(node, blocks[j]);
        }
      }
    }
  }

  async addBlock(node: NodeDTO, block: BlockDTO) {
    let lastHash = (await this.blocksProvider.getLastHashAndHeight()).lastHash;
    let slices: SliceDTO[] = [];
    for (let i = 0; i < block.slices.length; i++) {
      let sliceHash = block.slices[i];
      let req = await BywiseAPI.getSlice(node, sliceHash);
      if (req.error) {
        throw new Error(`cant sync slice ${sliceHash}`);
      }
      let slice: SliceDTO = req.data;
      slices.push(slice);
      req = await BywiseAPI.getTransactionFromSlice(node, sliceHash);
      if (req.error) {
        throw new Error(`cant sync slice ${sliceHash}`);
      }
      let txs: TransactionsDTO[] = req.data;
      for (let j = 0; j < txs.length; j++) {
        let tx = txs[j];
        await this.transactionsProvider.saveTransaction(tx);
      }
      await this.slicesProvider.addSlice(lastHash, slice);
    }
    await this.blocksProvider.addNewBLock(block);
  }
}
