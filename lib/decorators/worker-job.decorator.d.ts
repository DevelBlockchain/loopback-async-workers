import { BindingSpec } from '@loopback/core';
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
export declare function workerJob(...specs: BindingSpec[]): ClassDecorator;
