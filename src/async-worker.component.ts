import {
  Component,
  LifeCycleObserver
} from '@loopback/core';
import {Worker} from 'worker_threads';

const runScript = (script: string) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(script);
    worker.on('error', reject);
    worker.on('exit', resolve);
  });
}

export class AsyncWorkerComponent implements Component, LifeCycleObserver {
  constructor() { }

  async start() {
    runScript('./dist/async-workers.js');
  }

  async stop() {
  }
}
