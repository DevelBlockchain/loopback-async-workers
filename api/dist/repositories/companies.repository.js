"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesRepository = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const datasources_1 = require("../datasources");
const models_1 = require("../models");
let CompaniesRepository = class CompaniesRepository extends repository_1.DefaultCrudRepository {
    constructor(dataSource, walletsRepositoryGetter) {
        super(models_1.Companies, dataSource);
        this.walletsRepositoryGetter = walletsRepositoryGetter;
        this.wallets = this.createBelongsToAccessorFor('wallets', walletsRepositoryGetter);
        this.registerInclusionResolver('wallets', this.wallets.inclusionResolver);
    }
};
CompaniesRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.blockchain')), tslib_1.__param(1, repository_1.repository.getter('WalletsRepository')),
    tslib_1.__metadata("design:paramtypes", [datasources_1.BlockchainDataSource, Function])
], CompaniesRepository);
exports.CompaniesRepository = CompaniesRepository;
//# sourceMappingURL=companies.repository.js.map