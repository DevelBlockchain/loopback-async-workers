import { BindingKey } from '@loopback/core';
import { WorkerComponent } from './worker.component';
/**
 * Binding keys used by this component.
 */
export declare class WorkerBindings {
    /**
     * Binding key for `WorkerComponent`
     */
    static readonly COMPONENT: BindingKey<WorkerComponent>;
    /**
     * Namespace for cron jobs
     */
    static readonly WORKER_JOB_NAMESPACE = "worker.jobs";
}
