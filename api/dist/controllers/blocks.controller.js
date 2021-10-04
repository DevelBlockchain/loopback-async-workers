"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlocksController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
let BlocksController = class BlocksController {
    constructor(blocksRepository) {
        this.blocksRepository = blocksRepository;
    }
    async count(where) {
        return this.blocksRepository.count(where);
    }
    async find(filter) {
        return this.blocksRepository.find(filter);
    }
    async findById(hash) {
        let item = await this.blocksRepository.findOne({
            where: {
                hash: hash
            }
        });
        if (!item)
            throw new rest_1.HttpErrors.NotFound();
        return item;
    }
    async findByIndex(height) {
        let item = await this.blocksRepository.findOne({
            where: {
                height: height
            }
        });
        if (!item)
            throw new rest_1.HttpErrors.NotFound();
        return item;
    }
};
tslib_1.__decorate([
    rest_1.get('/blocks/count'),
    rest_1.response(200, {
        description: 'Blocks model count',
        content: { 'application/json': { schema: repository_1.CountSchema } },
    }),
    tslib_1.__param(0, rest_1.param.where(models_1.Blocks)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BlocksController.prototype, "count", null);
tslib_1.__decorate([
    rest_1.get('/blocks'),
    rest_1.response(200, {
        description: 'Array of Blocks model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: rest_1.getModelSchemaRef(models_1.Blocks, { includeRelations: true }),
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.filter(models_1.Blocks)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BlocksController.prototype, "find", null);
tslib_1.__decorate([
    rest_1.get('/blocks/{hash}'),
    rest_1.response(200, {
        description: 'Blocks model instance',
        content: {
            'application/json': {
                schema: rest_1.getModelSchemaRef(models_1.Blocks, { includeRelations: true }),
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('hash')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], BlocksController.prototype, "findById", null);
tslib_1.__decorate([
    rest_1.get('/blocks/{height}/by-height'),
    rest_1.response(200, {
        description: 'Blocks model instance',
        content: {
            'application/json': {
                schema: rest_1.getModelSchemaRef(models_1.Blocks, { includeRelations: true }),
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('height')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number]),
    tslib_1.__metadata("design:returntype", Promise)
], BlocksController.prototype, "findByIndex", null);
BlocksController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(repositories_1.BlocksRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.BlocksRepository])
], BlocksController);
exports.BlocksController = BlocksController;
//# sourceMappingURL=blocks.controller.js.map