"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blocks = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const slices_model_1 = require("./slices.model");
let Blocks = class Blocks extends repository_1.Entity {
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
], Blocks.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'number',
        required: true,
    }),
    tslib_1.__metadata("design:type", Number)
], Blocks.prototype, "height", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'number',
        required: true,
    }),
    tslib_1.__metadata("design:type", Number)
], Blocks.prototype, "numberOfTransactions", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Blocks.prototype, "version", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Blocks.prototype, "merkleRoot", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Blocks.prototype, "lastHash", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "date",
        default: '$now'
    }),
    tslib_1.__metadata("design:type", String)
], Blocks.prototype, "created", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Blocks.prototype, "hash", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Blocks.prototype, "sign", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Blocks.prototype, "externalHash", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Blocks.prototype, "externalURL", void 0);
tslib_1.__decorate([
    repository_1.hasMany(() => slices_model_1.Slices),
    tslib_1.__metadata("design:type", Array)
], Blocks.prototype, "slices", void 0);
Blocks = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], Blocks);
exports.Blocks = Blocks;
//# sourceMappingURL=blocks.model.js.map