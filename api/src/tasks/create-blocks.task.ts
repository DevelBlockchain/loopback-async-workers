import { service } from '@loopback/core';
import { CronJob, cronJob } from '@loopback/cron';
import { repository } from '@loopback/repository';
import { BlocksRepository } from '../repositories';
import { SlicesProvider, BlocksProvider } from '../services';
import { SimulateSliceDTO } from '../types';
import { Slice } from '@bywise/web3';

@cronJob()
export class CreateBlocks extends CronJob {

  constructor(
    @service(SlicesProvider) private slicesProvider: SlicesProvider,
    @service(BlocksProvider) private blocksProvider: BlocksProvider,
    @repository(BlocksRepository) public blocksRepository: BlocksRepository,
  ) {
    super({
      name: 'task-create-blocks',
      onTick: async () => {
        await this.stop();
        try {
          if(`${process.env.CREATE_BLOCKS}`.toLowerCase() === 'true') {
            await this.runProcess();
          }
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

    let selectedSlices: Slice[] = []
    if (slices.length > 0) {
      slices = slices.sort((a, b) => b.transactions.length - a.transactions.length);
      for (let i = 0; i < slices.length && selectedSlices.length === 0; i++) {
        let slice = slices[i];
        try {
          let ctx = new SimulateSliceDTO();
          await this.slicesProvider.validadeSlice(lastBlockParams.lastHash, slice);
          await this.slicesProvider.simulateBlock([slice.hash], ctx);
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
