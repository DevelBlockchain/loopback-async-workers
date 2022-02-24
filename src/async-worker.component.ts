import { Component, LifeCycleObserver } from '@loopback/core';
import { Worker } from 'worker_threads';
import fs from 'fs';

const runScript = (script: string) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(script);
    worker.on('error', reject);
    worker.on('exit', resolve);
  });
};

export class AsyncWorkerComponent implements Component, LifeCycleObserver {
  static MAIN_FILE = './dist/async-workers.js';

  async start() {
    if (!fs.existsSync(AsyncWorkerComponent.MAIN_FILE)) throw new Error(`configuration file not found - "${AsyncWorkerComponent.MAIN_FILE}"`)
    runScript(AsyncWorkerComponent.MAIN_FILE);
  }
}
