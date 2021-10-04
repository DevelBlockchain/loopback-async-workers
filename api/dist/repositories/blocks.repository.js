"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlocksRepository = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const datasources_1 = require("../datasources");
const models_1 = require("../models");
let BlocksRepository = class BlocksRepository extends repository_1.DefaultCrudRepository {
    constructor(dataSource, slicesRepositoryGetter) {
        super(models_1.Blocks, dataSource);
        this.slicesRepositoryGetter = slicesRepositoryGetter;
        this.slices = this.createHasManyRepositoryFactoryFor('slices', slicesRepositoryGetter);
        this.registerInclusionResolver('slices', this.slices.inclusionResolver);
    }
};
BlocksRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.blockchain')), tslib_1.__param(1, repository_1.repository.getter('SlicesRepository')),
    tslib_1.__metadata("design:paramtypes", [datasources_1.BlockchainDataSource, Function])
], BlocksRepository);
exports.BlocksRepository = BlocksRepository;
//# sourceMappingURL=blocks.repository.js.map