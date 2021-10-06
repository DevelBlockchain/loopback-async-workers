import { service } from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import { BlockchainProvider } from '../services';
const sleep = async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms + 10);
  });
}

@cronJob()
export class CreateBlocks extends CronJob {

  constructor(
    @service(BlockchainProvider) private blockchainProvider: BlockchainProvider
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
      cronTime: '*/30 * * * * *',
    });
  }

  runProcess = async () => {
    console.log('end task', new Date().toISOString(), await this.blockchainProvider.createNewBlock([], undefined))
  }

}
