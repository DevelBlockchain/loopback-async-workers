"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
let CompaniesController = class CompaniesController {
    constructor(companiesRepository) {
        this.companiesRepository = companiesRepository;
    }
    async count(where) {
        return this.companiesRepository.count(where);
    }
    async find(filter) {
        return this.companiesRepository.find(filter);
    }
    async findById(address) {
        let item = await this.companiesRepository.findOne({
            where: {
                address: address
            }
        });
        if (!item)
            throw new rest_1.HttpErrors.NotFound();
        return item;
    }
};
tslib_1.__decorate([
    rest_1.get('/companies/count'),
    rest_1.response(200, {
        description: 'Companies model count',
        content: { 'application/json': { schema: repository_1.CountSchema } },
    }),
    tslib_1.__param(0, rest_1.param.where(models_1.Companies)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CompaniesController.prototype, "count", null);
tslib_1.__decorate([
    rest_1.get('/companies'),
    rest_1.response(200, {
        description: 'Array of Companies model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: rest_1.getModelSchemaRef(models_1.Companies, { includeRelations: true }),
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.filter(models_1.Companies)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CompaniesController.prototype, "find", null);
tslib_1.__decorate([
    rest_1.get('/companies/{address}'),
    rest_1.response(200, {
        description: 'Companies model instance',
        content: {
            'application/json': {
                schema: rest_1.getModelSchemaRef(models_1.Companies, { includeRelations: true }),
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('address')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], CompaniesController.prototype, "findById", null);
CompaniesController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(repositories_1.CompaniesRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.CompaniesRepository])
], CompaniesController);
exports.CompaniesController = CompaniesController;
//# sourceMappingURL=companies.controller.js.map