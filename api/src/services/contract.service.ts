import {BindingScope, inject, injectable} from '@loopback/core';
import {LoggingBindings, WinstonLogger} from '@loopback/logging';
import {ethers} from "ethers";
import {Interface} from 'ethers/lib/utils';
import Web3 from 'web3';
import {Contract} from 'web3-eth-contract';
import {AbiItem} from 'web3-utils';
import {TxDTO} from '../types';

const contractMAINNET = "0xe34A186Dbc9Ceb8fFEdB728A415b04ED2bF573EF";
const contractTESTNET = "0x2A04f9D6A73A854464D8774D1B2b2038970608dE";
const contractABI: AbiItem[] = require(`../../assets/contractABI.json`);
const gasPrice = process.env.GAS_PRICE ? process.env.GAS_PRICE : '10000000000';
const gasLimit = process.env.GAS_LIMIT ? process.env.GAS_LIMIT : 8000000;

@injectable({scope: BindingScope.TRANSIENT})
export class ContractProvider {
  static web3: Web3;
  static contract: Contract;
  static inter: Interface;
  web3: Web3;
  contract: Contract;
  inter: Interface;

  constructor(
    @inject(LoggingBindings.WINSTON_LOGGER) private logger: WinstonLogger,
  ) {
    if (!ContractProvider.web3) {
      let apiRPC: string;
      if (process.env.API_RPC) {
        apiRPC = process.env.API_RPC;
      } else {
        if (ContractProvider.isMainNet()) {
          apiRPC = 'https://bsc-dataseed1.ninicoin.io';
        } else {
          apiRPC = 'https://data-seed-prebsc-1-s1.binance.org:8545';
        }
      }
      this.logger.info(`starting web3 at ${apiRPC}`);
      ContractProvider.web3 = new Web3(apiRPC);
      ContractProvider.contract = new ContractProvider.web3.eth.Contract(contractABI, this.getTokenId());
      ContractProvider.inter = new Interface(JSON.stringify(contractABI));
    }
    this.web3 = ContractProvider.web3;
    this.contract = ContractProvider.contract;
    this.inter = ContractProvider.inter;
  }

  toWei(value: string): string {
    return Web3.utils.toWei(value, 'ether');
  }

  fromWei(value: string): string {
    return Web3.utils.fromWei(value, 'ether');
  }

  async sendTx(raw: string): Promise<TxDTO> {
    let tx = await this.web3.eth.sendSignedTransaction(raw);
    let fee = (tx.gasUsed * parseInt(gasPrice)).toString();
    let txId = tx.transactionHash;
    return {txId, fee: this.fromWei(fee)};
  }

  static isMainNet(): boolean {
    let isMainNet = false;
    if (process.env.IS_MAINNET !== undefined) {
      if (process.env.IS_MAINNET.toLocaleLowerCase() == 'true') {
        isMainNet = true
      }
    }
    return isMainNet;
  }

  getUrlTx(txId: string): string {
    if (ContractProvider.isMainNet()) {
      return `https://bscscan.com/tx/${txId}`;
    } else {
      return `https://testnet.bscscan.com/tx/${txId}`;
    }
  }

  getTokenId(): string {
    if (ContractProvider.isMainNet()) {
      return contractMAINNET;
    } else {
      return contractTESTNET;
    }
  }

  getAccount(): ethers.Wallet {
    let seed = process.env.SEED;
    if (!seed) {
      let newSeed = ethers.Wallet.createRandom().mnemonic.phrase;
      throw new Error(`SEED not found - suggestion "${newSeed}"`);
    }
    return ethers.Wallet.fromMnemonic(seed);
  }

  async balanceBNB(address: string): Promise<string> {
    let balance = await this.web3.eth.getBalance(address);
    balance = this.fromWei(balance);
    return balance;
  }

  async getOwner(): Promise<string> {
    return await this.contract.methods.getOwner().call();
  }

  async getLength(): Promise<string> {
    return await this.contract.methods.getLength().call();
  }

  async getBlock(index: number): Promise<string> {
    return await this.contract.methods.getBlock(`${index}`).call();
  }

  async newBlock(hash: string): Promise<TxDTO> {
    let account = await this.getAccount();
    try {
      await this.contract.methods.newBlock(hash).call({from: account.address});
    } catch (err: any) {
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
    }
    let raw = await account.signTransaction(rawTransaction);
    let txDTO = await this.sendTx(raw);
    return txDTO;
  }
}
