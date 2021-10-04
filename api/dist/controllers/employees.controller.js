"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
let EmployeesController = class EmployeesController {
    constructor(employeesRepository) {
        this.employeesRepository = employeesRepository;
    }
    async count(where) {
        return this.employeesRepository.count(where);
    }
    async find(filter) {
        return this.employeesRepository.find(filter);
    }
    async findById(address) {
        let item = await this.employeesRepository.findOne({
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
    rest_1.get('/employees/count'),
    rest_1.response(200, {
        description: 'Employees model count',
        content: { 'application/json': { schema: repository_1.CountSchema } },
    }),
    tslib_1.__param(0, rest_1.param.where(models_1.Employees)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], EmployeesController.prototype, "count", null);
tslib_1.__decorate([
    rest_1.get('/employees'),
    rest_1.response(200, {
        description: 'Array of Employees model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: rest_1.getModelSchemaRef(models_1.Employees, { includeRelations: true }),
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.filter(models_1.Employees)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], EmployeesController.prototype, "find", null);
tslib_1.__decorate([
    rest_1.get('/employees/{address}'),
    rest_1.response(200, {
        description: 'Employees model instance',
        content: {
            'application/json': {
                schema: rest_1.getModelSchemaRef(models_1.Employees, { includeRelations: true }),
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('address')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], EmployeesController.prototype, "findById", null);
EmployeesController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(repositories_1.EmployeesRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.EmployeesRepository])
], EmployeesController);
exports.EmployeesController = EmployeesController;
//# sourceMappingURL=employees.controller.js.map