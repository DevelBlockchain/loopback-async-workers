"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerComponent = void 0;
const core_1 = require("@loopback/core");
const keys_1 = require("./keys");
const types_1 = require("./types");
const asyncSleep = function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve) => {
            setTimeout(resolve, ms + 10);
        });
    });
};
/**
 * The WorkerComponent manages worker jobs. It serves as an extension point for
 * worker jobs.
 */
let WorkerComponent = class WorkerComponent {
    constructor(getJobs) {
        this.getJobs = getJobs;
        this.running = false;
    }
    runJobs() {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            while (this.running && this.jobs) {
                try {
                    for (var _b = (e_1 = void 0, __asyncValues(this.jobs)), _c; _c = yield _b.next(), !_c.done;) {
                        const job = _c.value;
                        yield job.run();
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                yield asyncSleep(1000);
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.jobs = yield this.getJobs();
            this.jobs.forEach((job) => {
                job.start();
            });
            this.running = true;
            this.runJobs();
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.running = false;
            if (this.jobs) {
                this.jobs.forEach((job) => {
                    job.stop();
                });
            }
        });
    }
};
WorkerComponent = __decorate([
    (0, core_1.extensionPoint)(types_1.WORKER_JOB_SCHEDULER, {
        tags: { [core_1.ContextTags.KEY]: keys_1.WorkerBindings.COMPONENT },
        scope: core_1.BindingScope.SINGLETON,
    }),
    __param(0, (0, core_1.extensions)()),
    __metadata("design:paramtypes", [Function])
], WorkerComponent);
exports.WorkerComponent = WorkerComponent;
