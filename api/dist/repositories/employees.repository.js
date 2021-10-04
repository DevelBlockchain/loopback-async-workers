"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesRepository = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const datasources_1 = require("../datasources");
const models_1 = require("../models");
let EmployeesRepository = class EmployeesRepository extends repository_1.DefaultCrudRepository {
    constructor(dataSource, walletsRepositoryGetter, companiesRepositoryGetter) {
        super(models_1.Employees, dataSource);
        this.walletsRepositoryGetter = walletsRepositoryGetter;
        this.companiesRepositoryGetter = companiesRepositoryGetter;
        this.companies = this.createBelongsToAccessorFor('companies', companiesRepositoryGetter);
        this.registerInclusionResolver('companies', this.companies.inclusionResolver);
        this.wallets = this.createBelongsToAccessorFor('wallets', walletsRepositoryGetter);
        this.registerInclusionResolver('wallets', this.wallets.inclusionResolver);
    }
};
EmployeesRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.blockchain')), tslib_1.__param(1, repository_1.repository.getter('WalletsRepository')), tslib_1.__param(2, repository_1.repository.getter('CompaniesRepository')),
    tslib_1.__metadata("design:paramtypes", [datasources_1.BlockchainDataSource, Function, Function])
], EmployeesRepository);
exports.EmployeesRepository = EmployeesRepository;
//# sourceMappingURL=employees.repository.js.map