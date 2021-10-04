"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodesProvider = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
let NodesProvider = class NodesProvider {
    constructor() { }
};
NodesProvider.nodes = [];
NodesProvider = tslib_1.__decorate([
    core_1.injectable({ scope: core_1.BindingScope.TRANSIENT }),
    tslib_1.__metadata("design:paramtypes", [])
], NodesProvider);
exports.NodesProvider = NodesProvider;
//# sourceMappingURL=nodes-service.service.js.map