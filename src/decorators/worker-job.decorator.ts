import { BindingSpec, injectable } from '@loopback/core';
import { asWorkerJob } from '../types';

/**
 * `@workerJob` decorates a worker job provider class
 *
 * @example
 * ```ts
 * @workerJob()
 * class WorkerJobProvider implements Provider<WorkerJob> {
 *   constructor(@config() private jobConfig: WorkerJobConfig = {}) {}
 *   value() {
 *     // ...
 *   }
 * }
 * ```
 * @param specs - Extra binding specs
 */
export function workerJob(...specs: BindingSpec[]) {
  return injectable(asWorkerJob, ...specs);
}
