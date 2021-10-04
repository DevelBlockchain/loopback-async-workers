"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockineNodeApplication = void 0;
const tslib_1 = require("tslib");
const boot_1 = require("@loopback/boot");
const core_1 = require("@loopback/core");
const cron_1 = require("@loopback/cron");
const logging_1 = require("@loopback/logging");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const rest_explorer_1 = require("@loopback/rest-explorer");
const service_proxy_1 = require("@loopback/service-proxy");
const path_1 = tslib_1.__importDefault(require("path"));
const sequence_1 = require("./sequence");
const tasks = tslib_1.__importStar(require("./tasks"));
require('dotenv').config();
const winston = require('winston');
require('winston-daily-rotate-file');
class BlockineNodeApplication extends boot_1.BootMixin(service_proxy_1.ServiceMixin(repository_1.RepositoryMixin(rest_1.RestApplication))) {
    constructor(options = {}) {
        super(options);
        // Logger
        this.configure(logging_1.LoggingBindings.COMPONENT).to({
            enableFluent: false,
            enableHttpAccessLog: true,
        });
        this.configure(logging_1.LoggingBindings.WINSTON_LOGGER).to({
            transports: [
                new (winston.transports.DailyRotateFile)({
                    filename: './logs/node-%DATE%.log',
                    datePattern: 'YYYY-MM-DD-HH',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.json()),
                }),
                new (winston.transports.DailyRotateFile)({
                    filename: './logs/node-error-%DATE%.log',
                    datePattern: 'YYYY-MM-DD-HH',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    level: 'error',
                    format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.json()),
                }),
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
                }),
            ]
        });
        this.component(logging_1.LoggingComponent);
        // Set up the custom sequence
        this.sequence(sequence_1.MySequence);
        // CronJobs
        this.component(cron_1.CronComponent);
        Object.entries(tasks).forEach((task) => {
            this.add(core_1.createBindingFromClass(task[1]));
        });
        // Set up default home page
        this.static('/', path_1.default.join(__dirname, '../public'));
        // Customize @loopback/rest-explorer configuration here
        this.configure(rest_explorer_1.RestExplorerBindings.COMPONENT).to({
            path: '/explorer',
        });
        this.component(rest_explorer_1.RestExplorerComponent);
        this.projectRoot = __dirname;
        // Customize @loopback/boot Booter Conventions here
        this.bootOptions = {
            controllers: {
                // Customize ControllerBooter Conventions here
                dirs: ['controllers'],
                extensions: ['.controller.js'],
                nested: true,
            },
        };
    }
}
exports.BlockineNodeApplication = BlockineNodeApplication;
//# sourceMappingURL=application.js.map