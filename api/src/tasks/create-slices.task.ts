import { service } from '@loopback/core';
import { CronJob, cronJob } from '@loopback/cron';
import { repository } from '@loopback/repository';
import { TransactionsRepository } from '../repositories';
import { BlocksProvider, NodesProvider, SlicesProvider } from '../services';
import { SimulateSliceDTO, TransactionsStatus } from '../types';
import { BywiseAPI } from '../utils/bywise-api';
import { getRandomString } from '../utils/helper';

@cronJob()
export class CreateSlices extends CronJob {

  constructor(
    @service(SlicesProvider) private slicesProvider: SlicesProvider,
    @service(BlocksProvider) private blocksProvider: BlocksProvider,
    @service(NodesProvider) private nodesProvider: NodesProvider,
    @repository(TransactionsRepository) private transactionsRepository: TransactionsRepository,
  ) {
    super({
      name: 'task-create-slices',
      onTick: async () => {
        await this.stop();
        try {
          if (`${process.env.CREATE_SLICES}`.toLowerCase() === 'true') {
            await this.runProcess();
          }
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/10 * * * * *',
    });
  }

  runProcess = async () => {
    let transactionsOnMempool = await this.transactionsRepository.find({
      where: {
        status: TransactionsStatus.TX_MEMPOOL
      }
    });
    if (transactionsOnMempool.length > 0) {
      let lastBlockParams = await this.blocksProvider.getLastHashAndHeight();
      let lastHash = lastBlockParams.lastHash;
      let ctx = new SimulateSliceDTO();

      for (let i = 0; i < transactionsOnMempool.length; i++) {
        let tx = transactionsOnMempool[i];
        try {
          await this.slicesProvider.simulateTransaction(tx.hash, ctx);
        } catch (err: any) {
          tx.status = TransactionsStatus.TX_INVALIDATED;
          console.log('new slice - invalid transaction - ' + err.message, tx)
          await this.transactionsRepository.update(tx);
        }
      }
      if (ctx.transactionsModels.length > 0) {
        let slice = await this.slicesProvider.createNewSlice(lastHash, ctx.transactionsModels);
        let added = await this.slicesProvider.addSlice(lastHash, slice);
        if (added) {
          let nodes = this.nodesProvider.getNodes();
          for (let i = 0; i < nodes.length; i++) {
            BywiseAPI.publishNewSlice(nodes[i], slice);
          }
        }
      }
    }
  }

}
