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

/**
 * The WorkerComponent manages worker jobs. It serves as an extension point for
 * worker jobs.
 */
@extensionPoint(WORKER_JOB_SCHEDULER, {
  tags: { [ContextTags.KEY]: WorkerBindings.COMPONENT },
  scope: BindingScope.SINGLETON,
})
export class WorkerComponent implements Component, LifeCycleObserver {
  constructor(@extensions() public readonly getJobs: Getter<WorkerJob[]>) { }

  jobs?: WorkerJob[];

  async start() {
    this.jobs = await this.getJobs();
    this.jobs.forEach(job => {
      job.start();
    });
  }

  async stop() {
    if(this.jobs) {
      this.jobs.forEach(job => {
        job.stop();
      })
    }
  }
}
