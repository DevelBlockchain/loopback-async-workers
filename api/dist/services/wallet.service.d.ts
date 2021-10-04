import { WalletsRepository } from '../repositories';
import { TransactionsDTO } from '../types/transactions.type';
export declare class WalletProvider {
    walletsRepository: WalletsRepository;
    constructor(walletsRepository: WalletsRepository);
    static transactionToBytes: (tx: any) => Uint8Array;
    static getAddressIdentifier(): string;
    static getBywiseAddress(publicKey: string): string;
    static isBywiseAddress(address: string): boolean;
    verifyTransactions(transaction: TransactionsDTO): Promise<void>;
    static newWallet(): {
        seed: string;
        pubKey: string;
        priKey: string;
        address: string;
    };
}
