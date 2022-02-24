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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncWorkerComponent = void 0;
const worker_threads_1 = require("worker_threads");
const fs_1 = __importDefault(require("fs"));
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
            if (!fs_1.default.existsSync(AsyncWorkerComponent.MAIN_FILE))
                throw new Error(`configuration file not found - "${AsyncWorkerComponent.MAIN_FILE}"`);
            runScript(AsyncWorkerComponent.MAIN_FILE);
        });
    }
}
exports.AsyncWorkerComponent = AsyncWorkerComponent;
AsyncWorkerComponent.MAIN_FILE = './dist/async-workers.js';
