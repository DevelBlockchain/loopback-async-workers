"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSQLTask = void 0;
const tslib_1 = require("tslib");
const cron_1 = require("@loopback/cron");
const sleep = async function sleep(ms) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms + 10);
    });
};
let CreateSQLTask = class CreateSQLTask extends cron_1.CronJob {
    constructor() {
        super({
            name: 'create-sql-task',
            onTick: async () => {
                await this.stop();
                try {
                    await this.runProcess();
                }
                catch (err) {
                    console.error(`${this.name} ${JSON.stringify(err)}`, err);
                }
                await this.start();
            },
            cronTime: '*/10 * * * * *',
        });
        this.runProcess = async () => {
            console.log('end task', new Date().toISOString());
        };
    }
};
CreateSQLTask = tslib_1.__decorate([
    cron_1.cronJob(),
    tslib_1.__metadata("design:paramtypes", [])
], CreateSQLTask);
exports.CreateSQLTask = CreateSQLTask;
//# sourceMappingURL=create-sql.task.js.map