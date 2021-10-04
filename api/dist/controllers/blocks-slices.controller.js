"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlocksSlicesController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
let BlocksSlicesController = class BlocksSlicesController {
    constructor(blocksRepository) {
        this.blocksRepository = blocksRepository;
    }
    async find(hash) {
        let item = await this.blocksRepository.findOne({
            where: {
                hash: hash
            }
        });
        if (!item)
            throw new rest_1.HttpErrors.NotFound();
        return this.blocksRepository.slices(item.id).find();
    }
};
tslib_1.__decorate([
    rest_1.get('/blocks/{hash}/slices', {
        responses: {
            '200': {
                description: 'Array of Blocks has many Slices',
                content: {
                    'application/json': {
                        schema: { type: 'array', items: rest_1.getModelSchemaRef(models_1.Slices) },
                    },
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('hash')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], BlocksSlicesController.prototype, "find", null);
BlocksSlicesController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(repositories_1.BlocksRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.BlocksRepository])
], BlocksSlicesController);
exports.BlocksSlicesController = BlocksSlicesController;
//# sourceMappingURL=blocks-slices.controller.js.map