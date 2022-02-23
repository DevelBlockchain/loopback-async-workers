import { BindingKey } from '@loopback/core';
import { WorkerComponent } from './worker.component';

/**
 * Binding keys used by this component.
 */
export namespace WorkerBindings {
/**
 * Binding key for `WorkerComponent`
 */
export const COMPONENT = BindingKey.create<WorkerComponent>(
  'components.WorkerComponent',
);
/**
 * Namespace for cron jobs
 */
export const WORKER_JOB_NAMESPACE = 'worker.jobs';
}
