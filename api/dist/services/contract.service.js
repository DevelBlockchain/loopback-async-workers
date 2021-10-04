"use strict";
var ContractProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractProvider = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const logging_1 = require("@loopback/logging");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const web3_1 = tslib_1.__importDefault(require("web3"));
const contractMAINNET = "0xe34A186Dbc9Ceb8fFEdB728A415b04ED2bF573EF";
const contractTESTNET = "0x2A04f9D6A73A854464D8774D1B2b2038970608dE";
const contractABI = require(`../../assets/contractABI.json`);
const gasPrice = process.env.GAS_PRICE ? process.env.GAS_PRICE : '10000000000';
const gasLimit = process.env.GAS_LIMIT ? process.env.GAS_LIMIT : 8000000;
let ContractProvider = ContractProvider_1 = class ContractProvider {
    constructor(logger) {
        this.logger = logger;
        if (!ContractProvider_1.web3) {
            let apiRPC;
            if (process.env.API_RPC) {
                apiRPC = process.env.API_RPC;
            }
            else {
                if (ContractProvider_1.isMainNet()) {
                    apiRPC = 'https://bsc-dataseed1.ninicoin.io';
                }
                else {
                    apiRPC = 'https://data-seed-prebsc-1-s1.binance.org:8545';
                }
            }
            this.logger.info(`starting web3 at ${apiRPC}`);
            ContractProvider_1.web3 = new web3_1.default(apiRPC);
            ContractProvider_1.contract = new ContractProvider_1.web3.eth.Contract(contractABI, this.getTokenId());
            ContractProvider_1.inter = new utils_1.Interface(JSON.stringify(contractABI));
        }
        this.web3 = ContractProvider_1.web3;
        this.contract = ContractProvider_1.contract;
        this.inter = ContractProvider_1.inter;
    }
    toWei(value) {
        return web3_1.default.utils.toWei(value, 'ether');
    }
    fromWei(value) {
        return web3_1.default.utils.fromWei(value, 'ether');
    }
    async sendTx(raw) {
        let tx = await this.web3.eth.sendSignedTransaction(raw);
        let fee = (tx.gasUsed * parseInt(gasPrice)).toString();
        let txId = tx.transactionHash;
        return { txId, fee: this.fromWei(fee) };
    }
    static isMainNet() {
        let isMainNet = false;
        if (process.env.IS_MAINNET !== undefined) {
            if (process.env.IS_MAINNET.toLocaleLowerCase() == 'true') {
                isMainNet = true;
            }
        }
        return isMainNet;
    }
    getUrlTx(txId) {
        if (ContractProvider_1.isMainNet()) {
            return `https://bscscan.com/tx/${txId}`;
        }
        else {
            return `https://testnet.bscscan.com/tx/${txId}`;
        }
    }
    getTokenId() {
        if (ContractProvider_1.isMainNet()) {
            return contractMAINNET;
        }
        else {
            return contractTESTNET;
        }
    }
    async getAccount() {
        let seed = '';
        if (ContractProvider_1.isMainNet()) {
            seed = process.env.MAINNET_SEED;
        }
        else {
            seed = process.env.TESTNET_SEED;
        }
        if (!seed)
            throw new Error('SEED not found');
        return await ethers_1.ethers.Wallet.fromMnemonic(seed);
    }
    async balanceBNB(address) {
        let balance = await this.web3.eth.getBalance(address);
        balance = this.fromWei(balance);
        return balance;
    }
    async getOwner() {
        return await this.contract.methods.getOwner().call();
    }
    async getLength() {
        return await this.contract.methods.getLength().call();
    }
    async getBlock(index) {
        return await this.contract.methods.getBlock(`${index}`).call();
    }
    async newBlock(hash) {
        let account = await this.getAccount();
        try {
            await this.contract.methods.newBlock(hash).call({ from: account.address });
        }
        catch (err) {
            throw new Error(err.message);
        }
        let data = this.contract.methods.newBlock(hash).encodeABI();
        let txCount = await this.web3.eth.getTransactionCount(account.address);
        let rawTransaction = {
            nonce: this.web3.utils.toHex(txCount),
            gasLimit: this.web3.utils.toHex(gasLimit),
            gasPrice: this.web3.utils.toHex(gasPrice),
            to: this.getTokenId(),
            data: data,
        };
        let raw = await account.signTransaction(rawTransaction);
        let txDTO = await this.sendTx(raw);
        return txDTO;
    }
};
ContractProvider = ContractProvider_1 = tslib_1.__decorate([
    core_1.injectable({ scope: core_1.BindingScope.TRANSIENT }),
    tslib_1.__param(0, core_1.inject(logging_1.LoggingBindings.WINSTON_LOGGER)),
    tslib_1.__metadata("design:paramtypes", [Object])
], ContractProvider);
exports.ContractProvider = ContractProvider;
//# sourceMappingURL=contract.service.js.map