"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slices = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const transactions_model_1 = require("./transactions.model");
let Slices = class Slices extends repository_1.Entity {
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
], Slices.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'number',
        required: true,
    }),
    tslib_1.__metadata("design:type", Number)
], Slices.prototype, "height", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'number',
        required: true,
    }),
    tslib_1.__metadata("design:type", Number)
], Slices.prototype, "numberOfTransactions", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Slices.prototype, "version", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Slices.prototype, "merkleRoot", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Slices.prototype, "lastHash", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "date",
        default: '$now'
    }),
    tslib_1.__metadata("design:type", String)
], Slices.prototype, "created", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Slices.prototype, "hash", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Slices.prototype, "blocksId", void 0);
tslib_1.__decorate([
    repository_1.hasMany(() => transactions_model_1.Transactions),
    tslib_1.__metadata("design:type", Array)
], Slices.prototype, "transactions", void 0);
Slices = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], Slices);
exports.Slices = Slices;
//# sourceMappingURL=slices.model.js.map