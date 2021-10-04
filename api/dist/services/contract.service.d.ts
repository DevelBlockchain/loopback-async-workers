import { WinstonLogger } from '@loopback/logging';
import { ethers } from "ethers";
import { Interface } from 'ethers/lib/utils';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { TxDTO } from '../types';
export declare class ContractProvider {
    private logger;
    static web3: Web3;
    static contract: Contract;
    static inter: Interface;
    web3: Web3;
    contract: Contract;
    inter: Interface;
    constructor(logger: WinstonLogger);
    toWei(value: string): string;
    fromWei(value: string): string;
    sendTx(raw: string): Promise<TxDTO>;
    static isMainNet(): boolean;
    getUrlTx(txId: string): string;
    getTokenId(): string;
    getAccount(): Promise<ethers.Wallet>;
    balanceBNB(address: string): Promise<string>;
    getOwner(): Promise<string>;
    getLength(): Promise<string>;
    getBlock(index: number): Promise<string>;
    newBlock(hash: string): Promise<TxDTO>;
}
