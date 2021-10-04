import { CronJob } from '@loopback/cron';
export declare class CreateSQLTask extends CronJob {
    constructor();
    runProcess: () => Promise<void>;
}
