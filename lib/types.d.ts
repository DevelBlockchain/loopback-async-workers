import { Binding } from '@loopback/core';
/**
 * Name of the worker job extension point
 */
export declare const WORKER_JOB_SCHEDULER = "worker.jobScheduler";
/**
 * A `BindingTemplate` function to configure the binding as a worker job.
 *
 * @param binding - Binding object
 */
export declare function asWorkerJob<T = unknown>(binding: Binding<T>): Binding<T>;
/**
 * Worker job settings interface
 */
export interface WorkerJobConfig {
    name: string;
    onTick: () => Promise<void>;
    limitTime?: number;
    cronTime?: string;
    waitRun?: boolean;
}
/**
 * Worker job with an optional name
 */
export declare class WorkerJob {
    name: string;
    onTick: () => Promise<void>;
    limitTime: number;
    cronTime?: string;
    waitRun: boolean;
    private cron?;
    constructor(config: WorkerJobConfig);
    run(): Promise<void>;
    start(): void;
    stop(): void;
}
