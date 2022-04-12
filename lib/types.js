"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerJob = exports.asWorkerJob = exports.WORKER_JOB_SCHEDULER = void 0;
const core_1 = require("@loopback/core");
const cron_1 = require("cron");
const keys_1 = require("./keys");
/**
 * Name of the worker job extension point
 */
exports.WORKER_JOB_SCHEDULER = 'worker.jobScheduler';
/**
 * A `BindingTemplate` function to configure the binding as a worker job.
 *
 * @param binding - Binding object
 */
function asWorkerJob(binding) {
    return binding
        .apply((0, core_1.extensionFor)(exports.WORKER_JOB_SCHEDULER))
        .tag({ namespace: keys_1.WorkerBindings.WORKER_JOB_NAMESPACE })
        .inScope(core_1.BindingScope.SINGLETON);
}
exports.asWorkerJob = asWorkerJob;
/**
 * Worker job with an optional name
 */
class WorkerJob {
    constructor(config) {
        this.waitRun = true;
        this.name = config.name;
        this.limitTime = config.limitTime !== undefined ? config.limitTime : 30000;
        this.waitRun = config.waitRun !== undefined ? config.waitRun : true;
        this.onTick = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const timeout = setTimeout(() => {
                    config.onError(`WORKER-JOB [ ${this.name} ] - timeout`);
                }, this.limitTime);
                if (this.cron && this.waitRun)
                    this.cron.stop();
                yield config.onTick();
                if (this.cron && this.waitRun)
                    this.cron.start();
                clearTimeout(timeout);
            }
            catch (err) {
                console.error('ERROR [loopback-async-workers]', err);
                config.onError(`WORKER-JOB [ ${this.name} ] - ${err.message}`);
            }
        });
        this.cronTime = config.cronTime;
        if (this.cronTime) {
            this.cron = new cron_1.CronJob(this.cronTime, this.onTick);
        }
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cron) {
                yield this.onTick();
            }
        });
    }
    start() {
        if (this.cron) {
            this.cron.start();
        }
    }
    stop() {
        if (this.cron) {
            this.cron.stop();
        }
    }
}
exports.WorkerJob = WorkerJob;
