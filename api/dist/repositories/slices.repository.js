"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlicesRepository = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const datasources_1 = require("../datasources");
const models_1 = require("../models");
let SlicesRepository = class SlicesRepository extends repository_1.DefaultCrudRepository {
    constructor(dataSource, transactionsRepositoryGetter) {
        super(models_1.Slices, dataSource);
        this.transactionsRepositoryGetter = transactionsRepositoryGetter;
        this.transactions = this.createHasManyRepositoryFactoryFor('transactions', transactionsRepositoryGetter);
        this.registerInclusionResolver('transactions', this.transactions.inclusionResolver);
    }
};
SlicesRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.blockchain')), tslib_1.__param(1, repository_1.repository.getter('TransactionsRepository')),
    tslib_1.__metadata("design:paramtypes", [datasources_1.BlockchainDataSource, Function])
], SlicesRepository);
exports.SlicesRepository = SlicesRepository;
//# sourceMappingURL=slices.repository.js.map