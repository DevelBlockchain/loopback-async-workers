"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BscScanProvider = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const logging_1 = require("@loopback/logging");
const abort_controller_1 = tslib_1.__importDefault(require("abort-controller"));
const contract_service_1 = require("./contract.service");
const fetch = require("node-fetch");
let BscScanProvider = class BscScanProvider {
    constructor(logger) {
        this.logger = logger;
    }
    async getLastTransactions(address) {
        const controller = new abort_controller_1.default();
        const timeout = setTimeout(() => { controller.abort(); }, 30000);
        try {
            let url = ``;
            if (contract_service_1.ContractProvider.isMainNet()) {
                url += `https://api.bscscan.com/api?module=account&action=tokentx`;
            }
            else {
                url += `https://api-testnet.bscscan.com/api?module=account&action=tokentx`;
            }
            url += `&sort=desc&page=1&offset=100`;
            url += `&address=${address}`;
            url += `&contractaddress=${process.env.CONTRACT_ID}`;
            url += `&apikey=${process.env.BSCSCAN_API}`;
            const req = await fetch(url, {
                signal: controller.signal,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }).finally(() => {
                clearTimeout(timeout);
            });
            if (!req.ok) {
                let jsonError = await req.json();
                throw 'api error: ' + jsonError.msg;
            }
            let json = await req.json();
            return json;
        }
        catch (err) {
            throw new Error('api error: ' + err.message);
        }
    }
};
BscScanProvider = tslib_1.__decorate([
    core_1.injectable({ scope: core_1.BindingScope.TRANSIENT }),
    tslib_1.__param(0, core_1.inject(logging_1.LoggingBindings.WINSTON_LOGGER)),
    tslib_1.__metadata("design:paramtypes", [Object])
], BscScanProvider);
exports.BscScanProvider = BscScanProvider;
//# sourceMappingURL=bscscan.service.js.map