import { Model } from '@loopback/repository';
export interface TxDTO {
    txId: string;
    fee: string;
}
export declare class TokenTransactionsDTO extends Model {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    from: string;
    to: string;
    contractAddress: string;
    value: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
    transactionIndex: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    cumulativeGasUsed: string;
    input: string;
    confirmations: string;
    constructor(data?: Partial<TokenTransactionsDTO>);
}
export declare class BscScanDTO extends Model {
    status: string;
    message: string;
    result: TokenTransactionsDTO[];
    constructor(data?: Partial<BscScanDTO>);
}
