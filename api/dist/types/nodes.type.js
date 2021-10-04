"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeDTO = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let NodeDTO = class NodeDTO extends repository_1.Model {
    constructor(data) {
        super(data);
    }
};
tslib_1.__decorate([
    repository_1.property({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], NodeDTO.prototype, "host", void 0);
tslib_1.__decorate([
    repository_1.property({
        type: 'boolean',
    }),
    tslib_1.__metadata("design:type", Boolean)
], NodeDTO.prototype, "fullNode", void 0);
NodeDTO = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], NodeDTO);
exports.NodeDTO = NodeDTO;
//# sourceMappingURL=nodes.type.js.map