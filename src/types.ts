import { Binding, BindingScope, extensionFor } from '@loopback/core';
import { CronJob } from 'cron';
import { WorkerBindings } from './keys';

/**
 * Name of the worker job extension point
 */
export const WORKER_JOB_SCHEDULER = 'worker.jobScheduler';

/**
 * A `BindingTemplate` function to configure the binding as a worker job.
 *
 * @param binding - Binding object
 */
export function asWorkerJob<T = unknown>(binding: Binding<T>) {
  return binding
    .apply(extensionFor(WORKER_JOB_SCHEDULER))
    .tag({ namespace: WorkerBindings.WORKER_JOB_NAMESPACE })
    .inScope(BindingScope.SINGLETON);
}

/**
 * Worker job settings interface
 */
export interface WorkerJobConfig {
  name: string;
  onTick: () => Promise<void>;
  onError: (message: string) => void;
  limitTime?: number;
  cronTime?: string;
  waitRun?: boolean;
}

/**
 * Worker job with an optional name
 */
export class WorkerJob {
  name: string;
  onTick: () => Promise<void>;
  limitTime: number;
  cronTime?: string;
  waitRun: boolean = true;
  private cron?: CronJob;

  constructor(config: WorkerJobConfig) {
    this.name = config.name;
    this.limitTime = config.limitTime !== undefined ? config.limitTime : 30000;
    this.waitRun = config.waitRun !== undefined ? config.waitRun : true;
    this.onTick = async () => {
      try {
        const timeout = setTimeout(() => {
          config.onError(`timeout worker ${this.name}`);
        }, this.limitTime);
        if (this.cron && this.waitRun) this.cron.stop();

        await config.onTick();

        if (this.cron && this.waitRun) this.cron.start();
        clearTimeout(timeout);
      } catch (err: any) {
        console.error('ERROR [loopback-async-workers]', err);
        config.onError(err.message);
      }
    };
    this.cronTime = config.cronTime;
    if (this.cronTime) {
      this.cron = new CronJob(this.cronTime, this.onTick);
    }
  }

  async run() {
    if (!this.cron) {
      await this.onTick();
    }
  }

  start() {
    if (this.cron) {
      this.cron.start();
    }
  }

  stop() {
    if (this.cron) {
      this.cron.stop();
    }
  }
}
