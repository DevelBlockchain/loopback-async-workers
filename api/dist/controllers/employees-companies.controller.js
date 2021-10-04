"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesCompaniesController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
let EmployeesCompaniesController = class EmployeesCompaniesController {
    constructor(employeesRepository) {
        this.employeesRepository = employeesRepository;
    }
    async getCompanies(address) {
        let item = await this.employeesRepository.findOne({
            where: {
                address: address
            }
        });
        if (!item)
            throw new rest_1.HttpErrors.NotFound();
        return this.employeesRepository.companies(item.id);
    }
};
tslib_1.__decorate([
    rest_1.get('/employees/{address}/companies', {
        responses: {
            '200': {
                description: 'Companies belonging to Employees',
                content: {
                    'application/json': {
                        schema: { type: 'array', items: rest_1.getModelSchemaRef(models_1.Companies) },
                    },
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('address')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], EmployeesCompaniesController.prototype, "getCompanies", null);
EmployeesCompaniesController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(repositories_1.EmployeesRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.EmployeesRepository])
], EmployeesCompaniesController);
exports.EmployeesCompaniesController = EmployeesCompaniesController;
//# sourceMappingURL=employees-companies.controller.js.map