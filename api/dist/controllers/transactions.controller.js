"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
let TransactionsController = class TransactionsController {
    constructor(transactionsRepository) {
        this.transactionsRepository = transactionsRepository;
    }
    async count(where) {
        return this.transactionsRepository.count(where);
    }
    async find(filter) {
        return this.transactionsRepository.find(filter);
    }
    async findById(hash) {
        let item = await this.transactionsRepository.findOne({
            where: {
                hash: hash
            }
        });
        if (!item)
            throw new rest_1.HttpErrors.NotFound();
        return item;
    }
};
tslib_1.__decorate([
    rest_1.get('/transactions/count'),
    rest_1.response(200, {
        description: 'Transactions model count',
        content: { 'application/json': { schema: repository_1.CountSchema } },
    }),
    tslib_1.__param(0, rest_1.param.where(models_1.Transactions)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TransactionsController.prototype, "count", null);
tslib_1.__decorate([
    rest_1.get('/transactions'),
    rest_1.response(200, {
        description: 'Array of Transactions model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: rest_1.getModelSchemaRef(models_1.Transactions, { includeRelations: true }),
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.filter(models_1.Transactions)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TransactionsController.prototype, "find", null);
tslib_1.__decorate([
    rest_1.get('/transactions/{hash}'),
    rest_1.response(200, {
        description: 'Transactions model instance',
        content: {
            'application/json': {
                schema: rest_1.getModelSchemaRef(models_1.Transactions, { includeRelations: true }),
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('hash')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], TransactionsController.prototype, "findById", null);
TransactionsController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(repositories_1.TransactionsRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.TransactionsRepository])
], TransactionsController);
exports.TransactionsController = TransactionsController;
//# sourceMappingURL=transactions.controller.js.map