"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Companies = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const wallets_model_1 = require("./wallets.model");
let Companies = class Companies extends repository_1.Entity {
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
], Companies.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Companies.prototype, "address", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Companies.prototype, "name", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Companies.prototype, "description", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Companies.prototype, "logo", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Companies.prototype, "url", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'object',
    }),
    tslib_1.__metadata("design:type", Object)
], Companies.prototype, "info", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "date",
        default: '$now'
    }),
    tslib_1.__metadata("design:type", String)
], Companies.prototype, "created", void 0);
tslib_1.__decorate([
    repository_1.belongsTo(() => wallets_model_1.Wallets),
    tslib_1.__metadata("design:type", String)
], Companies.prototype, "walletsId", void 0);
Companies = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], Companies);
exports.Companies = Companies;
//# sourceMappingURL=companies.model.js.map