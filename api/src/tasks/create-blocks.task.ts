import { service } from '@loopback/core';
import { CronJob, cronJob } from '@loopback/cron';
import { repository } from '@loopback/repository';
import { TransactionsType } from '../models';
import { BlocksRepository, SlicesRepository, TransactionsRepository } from '../repositories';
import { SlicesProvider, BlocksProvider } from '../services';
import { SliceDTO } from '../types';

@cronJob()
export class CreateBlocks extends CronJob {

  constructor(
    @service(SlicesProvider) private slicesProvider: SlicesProvider,
    @service(BlocksProvider) private blocksProvider: BlocksProvider,
    @repository(BlocksRepository) public blocksRepository: BlocksRepository,
  ) {
    super({
      name: 'create-blocks',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/1 * * * *',
    });
  }

  runProcess = async () => {
    let lastBlockParams = await this.blocksProvider.getLastHashAndHeight();
    let slices = await this.slicesProvider.getMempoolSlices();

    let selectedSlices: SliceDTO[] = []
    if (slices.length > 0) {
      slices = slices.sort((a, b) => b.numberOfTransactions - a.numberOfTransactions);
      for (let i = 0; i < slices.length && selectedSlices.length === 0; i++) {
        let slice = slices[i];
        try {
          await this.slicesProvider.validadeSlice(lastBlockParams.lastHash, slice);
          await this.slicesProvider.consolidateSlices([slice.hash], true);
          selectedSlices.push(slice);
        } catch (err: any) {
          console.log('create new blocks task - ' + err.message)
        }
      }
    }
    let block = await this.blocksProvider.createNewBlock(selectedSlices);
    await this.blocksProvider.addNewBLock(block);
    console.log('created block', block.height);
  }

}
