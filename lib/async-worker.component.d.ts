import { Component, LifeCycleObserver } from '@loopback/core';
export declare class AsyncWorkerComponent implements Component, LifeCycleObserver {
    start(): Promise<void>;
}
