"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallets = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let Wallets = class Wallets extends repository_1.Entity {
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
], Wallets.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Wallets.prototype, "publicKey", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'number',
        default: 0,
    }),
    tslib_1.__metadata("design:type", Number)
], Wallets.prototype, "balance", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Wallets.prototype, "address", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'boolean',
        default: false,
    }),
    tslib_1.__metadata("design:type", Boolean)
], Wallets.prototype, "createCompanies", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'boolean',
        default: false,
    }),
    tslib_1.__metadata("design:type", Boolean)
], Wallets.prototype, "createEmployees", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'boolean',
        default: false,
    }),
    tslib_1.__metadata("design:type", Boolean)
], Wallets.prototype, "createTransactions", void 0);
Wallets = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], Wallets);
exports.Wallets = Wallets;
//# sourceMappingURL=wallets.model.js.map