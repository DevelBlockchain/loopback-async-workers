"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerBindings = void 0;
const core_1 = require("@loopback/core");
/**
 * Binding keys used by this component.
 */
class WorkerBindings {
}
exports.WorkerBindings = WorkerBindings;
/**
 * Binding key for `WorkerComponent`
 */
WorkerBindings.COMPONENT = core_1.BindingKey.create('components.WorkerComponent');
/**
 * Namespace for cron jobs
 */
WorkerBindings.WORKER_JOB_NAMESPACE = 'worker.jobs';
