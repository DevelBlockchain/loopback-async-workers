"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlicesTransactionsController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
let SlicesTransactionsController = class SlicesTransactionsController {
    constructor(slicesRepository) {
        this.slicesRepository = slicesRepository;
    }
    async find(hash) {
        let item = await this.slicesRepository.findOne({
            where: {
                hash: hash
            }
        });
        if (!item)
            throw new rest_1.HttpErrors.NotFound();
        return this.slicesRepository.transactions(item.id).find();
    }
};
tslib_1.__decorate([
    rest_1.get('/slices/{hash}/transactions', {
        responses: {
            '200': {
                description: 'Array of Slices has many Transactions',
                content: {
                    'application/json': {
                        schema: { type: 'array', items: rest_1.getModelSchemaRef(models_1.Transactions) },
                    },
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('hash')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], SlicesTransactionsController.prototype, "find", null);
SlicesTransactionsController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(repositories_1.SlicesRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.SlicesRepository])
], SlicesTransactionsController);
exports.SlicesTransactionsController = SlicesTransactionsController;
//# sourceMappingURL=slices-transactions.controller.js.map