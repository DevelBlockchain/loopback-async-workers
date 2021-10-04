"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employees = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const wallets_model_1 = require("./wallets.model");
const companies_model_1 = require("./companies.model");
let Employees = class Employees extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
tslib_1.__decorate([
    repository_1.property({
        id: true,
        type: 'string',
        defaultFn: 'uuid',
    }),
    tslib_1.__metadata("design:type", String)
], Employees.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Employees.prototype, "address", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Employees.prototype, "name", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Employees.prototype, "description", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Employees.prototype, "logo", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Employees.prototype, "url", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'object',
    }),
    tslib_1.__metadata("design:type", Object)
], Employees.prototype, "info", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "date",
        default: '$now'
    }),
    tslib_1.__metadata("design:type", String)
], Employees.prototype, "created", void 0);
tslib_1.__decorate([
    repository_1.belongsTo(() => wallets_model_1.Wallets),
    tslib_1.__metadata("design:type", String)
], Employees.prototype, "walletsId", void 0);
tslib_1.__decorate([
    repository_1.belongsTo(() => companies_model_1.Companies),
    tslib_1.__metadata("design:type", String)
], Employees.prototype, "companiesId", void 0);
Employees = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], Employees);
exports.Employees = Employees;
//# sourceMappingURL=employees.model.js.map