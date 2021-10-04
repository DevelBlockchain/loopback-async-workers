import {CronJob, cronJob} from '@loopback/cron';
const sleep = async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms + 10);
  });
}

@cronJob()
export class CreateSQLTask extends CronJob {

  constructor(
  ) {
    super({
      name: 'create-sql-task',
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
    console.log('end task', new Date().toISOString())
  }

}
