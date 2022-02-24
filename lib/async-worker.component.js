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
exports.AsyncWorkerComponent = void 0;
const worker_threads_1 = require("worker_threads");
const runScript = (script) => {
    return new Promise((resolve, reject) => {
        const worker = new worker_threads_1.Worker(script);
        worker.on('error', reject);
        worker.on('exit', resolve);
    });
};
class AsyncWorkerComponent {
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            runScript('./dist/async-workers.js');
        });
    }
}
exports.AsyncWorkerComponent = AsyncWorkerComponent;
