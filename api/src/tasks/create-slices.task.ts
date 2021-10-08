import { service } from '@loopback/core';
import { CronJob, cronJob } from '@loopback/cron';
import { repository } from '@loopback/repository';
import { TransactionsStatus } from '../models';
import { TransactionsRepository } from '../repositories';
import { BlocksProvider, SlicesProvider } from '../services';
import { SimulateSliceDTO } from '../types';

@cronJob()
export class CreateSlices extends CronJob {

  constructor(
    @service(SlicesProvider) private slicesProvider: SlicesProvider,
    @service(BlocksProvider) private blocksProvider: BlocksProvider,
    @repository(TransactionsRepository) private transactionsRepository: TransactionsRepository,
  ) {
    super({
      name: 'create-slices',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
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
        try {
          await this.slicesProvider.simulateTransaction(transactionsOnMempool[i].hash, ctx);
        } catch (err: any) {
          console.log('new slice - invalid transaction - ' + err.message, transactionsOnMempool[i])
        }
      }
      if (ctx.transactionsModels.length > 0) {
        let slice = await this.slicesProvider.createNewSlice(lastHash, ctx.transactionsModels);
        await this.slicesProvider.addSlice(lastHash, slice);
      }
    }
  }

}
