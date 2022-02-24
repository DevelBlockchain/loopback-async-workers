import { Component, LifeCycleObserver } from '@loopback/core';
export declare class AsyncWorkerComponent implements Component, LifeCycleObserver {
    static MAIN_FILE: string;
    start(): Promise<void>;
}
