"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainDataSource = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
require('dotenv/config');
const config = {
    name: 'db',
    connector: 'postgresql',
    url: '',
    host: 'blockine-db',
    port: '5432',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
};
// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
let BlockchainDataSource = class BlockchainDataSource extends repository_1.juggler.DataSource {
    constructor(dsConfig = config) {
        super(dsConfig);
    }
};
BlockchainDataSource.dataSourceName = 'blockchain';
BlockchainDataSource.defaultConfig = config;
BlockchainDataSource = tslib_1.__decorate([
    core_1.lifeCycleObserver('datasource'),
    tslib_1.__param(0, core_1.inject('datasources.config.blockchain', { optional: true })),
    tslib_1.__metadata("design:paramtypes", [Object])
], BlockchainDataSource);
exports.BlockchainDataSource = BlockchainDataSource;
//# sourceMappingURL=blockchain.datasource.js.map