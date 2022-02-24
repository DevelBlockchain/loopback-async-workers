"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerJob = void 0;
const core_1 = require("@loopback/core");
const types_1 = require("../types");
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
function workerJob(...specs) {
    return (0, core_1.injectable)(types_1.asWorkerJob, ...specs);
}
exports.workerJob = workerJob;
