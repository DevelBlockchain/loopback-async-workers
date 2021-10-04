"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transactions = void 0;
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
let Transactions = class Transactions extends repository_1.Entity {
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
], Transactions.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Transactions.prototype, "from", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'array',
        itemType: 'string',
    }),
    tslib_1.__metadata("design:type", Array)
], Transactions.prototype, "ForeignKeys", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        jsonSchema: {
            enum: Object.values(TransactionsType),
        },
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Transactions.prototype, "type", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Transactions.prototype, "data", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Transactions.prototype, "hash", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'date',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Transactions.prototype, "created", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Transactions.prototype, "sign", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
        jsonSchema: {
            enum: Object.values(TransactionsStatus),
        },
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Transactions.prototype, "status", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Transactions.prototype, "slicesId", void 0);
Transactions = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], Transactions);
exports.Transactions = Transactions;
//# sourceMappingURL=transactions.model.js.map