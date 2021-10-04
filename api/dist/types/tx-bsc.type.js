"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BscScanDTO = exports.TokenTransactionsDTO = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let TokenTransactionsDTO = class TokenTransactionsDTO extends repository_1.Model {
    constructor(data) {
        super(data);
    }
};
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "blockNumber", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "timeStamp", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "hash", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "nonce", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "blockHash", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "from", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "to", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "contractAddress", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "value", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "tokenName", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "tokenSymbol", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "tokenDecimal", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "transactionIndex", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "gas", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "gasPrice", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "gasUsed", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "cumulativeGasUsed", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "input", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: "string"
    }),
    tslib_1.__metadata("design:type", String)
], TokenTransactionsDTO.prototype, "confirmations", void 0);
TokenTransactionsDTO = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], TokenTransactionsDTO);
exports.TokenTransactionsDTO = TokenTransactionsDTO;
let BscScanDTO = class BscScanDTO extends repository_1.Model {
    constructor(data) {
        super(data);
    }
};
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], BscScanDTO.prototype, "status", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], BscScanDTO.prototype, "message", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'array',
        itemType: TokenTransactionsDTO
    }),
    tslib_1.__metadata("design:type", Array)
], BscScanDTO.prototype, "result", void 0);
BscScanDTO = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], BscScanDTO);
exports.BscScanDTO = BscScanDTO;
//# sourceMappingURL=tx-bsc.type.js.map