"use strict";
var WalletProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletProvider = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const ts_lib_crypto_1 = require("@waves/ts-lib-crypto");
const _1 = require(".");
const repositories_1 = require("../repositories");
let WalletProvider = WalletProvider_1 = class WalletProvider {
    constructor(walletsRepository) {
        this.walletsRepository = walletsRepository;
    }
    static getAddressIdentifier() {
        return _1.ContractProvider.isMainNet() ? 'BWS1M' : 'BWS1T';
    }
    static getBywiseAddress(publicKey) {
        let hash = ts_lib_crypto_1.base58Encode(ts_lib_crypto_1.sha256(ts_lib_crypto_1.sha256(publicKey))).substring(0, 28);
        let addressWithoutSum = WalletProvider_1.getAddressIdentifier() + hash;
        let sum = ts_lib_crypto_1.base58Encode(ts_lib_crypto_1.sha256(addressWithoutSum)).substring(0, 3);
        return addressWithoutSum + sum;
    }
    static isBywiseAddress(address) {
        try {
            if (!address.startsWith(WalletProvider_1.getAddressIdentifier()))
                return false;
            let addressWithoutSum = address.substring(0, address.length - 3);
            let sum = address.substring(address.length - 3);
            let sumCalc = ts_lib_crypto_1.base58Encode(ts_lib_crypto_1.sha256(addressWithoutSum)).substring(0, 3);
            return sum == sumCalc;
        }
        catch (er) {
        }
        return false;
    }
    async verifyTransactions(transaction) {
        if (!WalletProvider_1.isBywiseAddress(transaction.from))
            throw new Error('invalid address');
        let wallet = await this.walletsRepository.findOne({
            where: {
                address: transaction.from
            }
        });
        if (!wallet)
            throw new Error('address not allowed');
        if (!transaction.sign)
            throw new Error('signature not found');
        let sign = transaction.sign;
        transaction.sign = undefined;
        let hash = WalletProvider_1.transactionToBytes(transaction);
        let isValidSign = await ts_lib_crypto_1.verifySignature(wallet.publicKey, hash, sign);
        transaction.sign = sign;
        if (!isValidSign)
            throw new Error('invalid signature');
    }
    static newWallet() {
        let seed = ts_lib_crypto_1.randomSeed();
        let pubKey = ts_lib_crypto_1.publicKey(seed);
        let priKey = ts_lib_crypto_1.privateKey(seed);
        let address = WalletProvider_1.getBywiseAddress(pubKey);
        return {
            seed,
            pubKey,
            priKey,
            address,
        };
    }
};
WalletProvider.transactionToBytes = (tx) => {
    let entries = Object.entries(tx);
    entries = entries.sort((entireA, entireB) => entireA[0].localeCompare(entireB[0]));
    tx = {};
    entries.forEach((entire) => {
        tx[entire[0]] = entire[1];
    });
    return ts_lib_crypto_1.sha256(ts_lib_crypto_1.sha256(ts_lib_crypto_1.stringToBytes(JSON.stringify(tx))));
};
WalletProvider = WalletProvider_1 = tslib_1.__decorate([
    core_1.injectable({ scope: core_1.BindingScope.TRANSIENT }),
    tslib_1.__param(0, repository_1.repository(repositories_1.WalletsRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.WalletsRepository])
], WalletProvider);
exports.WalletProvider = WalletProvider;
//# sourceMappingURL=wallet.service.js.map