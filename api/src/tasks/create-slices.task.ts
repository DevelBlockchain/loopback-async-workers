import { service } from '@loopback/core';
import { CronJob, cronJob } from '@loopback/cron';
import { repository } from '@loopback/repository';
import { TransactionsStatus } from '../models';
import { TransactionsRepository } from '../repositories';
import { BlocksProvider, SlicesProvider } from '../services';

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
      let slice = await this.slicesProvider.createNewSlice(lastHash, transactionsOnMempool);
      await this.slicesProvider.addSlice(lastHash, slice);
    }
  }

}
