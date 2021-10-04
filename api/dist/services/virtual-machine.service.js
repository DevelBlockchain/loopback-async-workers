"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualMachineProvider = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const repositories_1 = require("../repositories");
let VirtualMachineProvider = class VirtualMachineProvider {
    constructor(walletsRepository) {
        this.walletsRepository = walletsRepository;
    }
    async executeTransaction(transaction) {
        /*if (!WalletProvider.isBywiseAddress(transaction.from)) throw new Error('invalid address');
        let wallet = await this.walletsRepository.findOne({
          where: {
            address: transaction.from
          }
        });
        if (!wallet) throw new Error('address not allowed');
        if (!transaction.sign) throw new Error('signature not found');
        let sign = transaction.sign;
        transaction.sign = undefined;
        let hash = WalletProvider.transactionToBytes(transaction);
        let isValidSign = await verifySignature(wallet.publicKey, hash, sign);
        transaction.sign = sign;
        if (!isValidSign) throw new Error('invalid signature');*/
    }
};
VirtualMachineProvider = tslib_1.__decorate([
    core_1.injectable({ scope: core_1.BindingScope.TRANSIENT }),
    tslib_1.__param(0, repository_1.repository(repositories_1.WalletsRepository)),
    tslib_1.__metadata("design:paramtypes", [VirtualMachineProvider])
], VirtualMachineProvider);
exports.VirtualMachineProvider = VirtualMachineProvider;
//# sourceMappingURL=virtual-machine.service.js.map