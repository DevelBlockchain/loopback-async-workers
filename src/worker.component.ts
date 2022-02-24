import {
  BindingScope,
  Component,
  ContextTags,
  extensionPoint,
  extensions,
  Getter,
  LifeCycleObserver,
} from '@loopback/core';
import { WorkerBindings } from './keys';
import { WorkerJob, WORKER_JOB_SCHEDULER } from './types';

const asyncSleep = async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms + 10);
  });
};

/**
 * The WorkerComponent manages worker jobs. It serves as an extension point for
 * worker jobs.
 */
@extensionPoint(WORKER_JOB_SCHEDULER, {
  tags: { [ContextTags.KEY]: WorkerBindings.COMPONENT },
  scope: BindingScope.SINGLETON,
})
export class WorkerComponent implements Component, LifeCycleObserver {
  constructor(@extensions() public readonly getJobs: Getter<WorkerJob[]>) {}

  running = false;
  jobs?: WorkerJob[];

  async runJobs() {
    while (this.running && this.jobs) {
      for await (const job of this.jobs) {
        await job.run();
      }
      await asyncSleep(1000);
    }
  }

  async start() {
    this.jobs = await this.getJobs();
    this.jobs.forEach((job) => {
      job.start();
    });
    this.running = true;
    this.runJobs();
  }

  async stop() {
    this.running = false;
    if (this.jobs) {
      this.jobs.forEach((job) => {
        job.stop();
      });
    }
  }
}
