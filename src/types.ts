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
 * Worker job with an optional name
 */
export class WorkerJob {
  name: string;
  onTick: () => Promise<void>;
  cronTime: string | undefined;
  private cron: CronJob;
  constructor(config: { name: string, onTick: () => Promise<void>, cronTime: string | undefined }) {
    this.name = config.name;
    this.onTick = config.onTick;
    this.cronTime = config.cronTime;
    if (this.cronTime) {
      this.cron = new CronJob(this.cronTime, this.onTick);
    }
  }

  start() {
    this.cron.start();
  }

  stop() {
    this.cron.stop();
  }
}
