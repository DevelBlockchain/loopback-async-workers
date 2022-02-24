import { Component, Getter, LifeCycleObserver } from '@loopback/core';
import { WorkerJob } from './types';
/**
 * The WorkerComponent manages worker jobs. It serves as an extension point for
 * worker jobs.
 */
export declare class WorkerComponent implements Component, LifeCycleObserver {
    readonly getJobs: Getter<WorkerJob[]>;
    constructor(getJobs: Getter<WorkerJob[]>);
    running: boolean;
    jobs?: WorkerJob[];
    runJobs(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
}
