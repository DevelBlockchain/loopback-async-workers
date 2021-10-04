"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsDTO = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
var TransactionsStatus;
(function (TransactionsStatus) {
    TransactionsStatus["MEMPOOL"] = "mempool";
    TransactionsStatus["MINED"] = "mined";
})(TransactionsStatus || (TransactionsStatus = {}));
var TransactionsType;
(function (TransactionsType) {
    TransactionsType["JSON"] = "json";
    TransactionsType["COMMAND"] = "command";
    TransactionsType["FILE"] = "file";
    TransactionsType["STRING"] = "string";
})(TransactionsType || (TransactionsType = {}));
let TransactionsDTO = class TransactionsDTO extends repository_1.Model {
    constructor(data) {
        super(data);
    }
};
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], TransactionsDTO.prototype, "from", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'array',
        itemType: 'string',
    }),
    tslib_1.__metadata("design:type", Array)
], TransactionsDTO.prototype, "ForeignKeys", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        jsonSchema: {
            enum: Object.values(TransactionsType),
        },
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], TransactionsDTO.prototype, "type", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], TransactionsDTO.prototype, "data", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], TransactionsDTO.prototype, "hash", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'date',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], TransactionsDTO.prototype, "created", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", Object)
], TransactionsDTO.prototype, "sign", void 0);
TransactionsDTO = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], TransactionsDTO);
exports.TransactionsDTO = TransactionsDTO;
//# sourceMappingURL=transactions.type.js.map