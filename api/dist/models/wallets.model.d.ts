import { Entity } from '@loopback/repository';
export declare class Wallets extends Entity {
    id: string;
    publicKey: string;
    balance: number;
    address: string;
    createCompanies: boolean;
    createEmployees: boolean;
    createTransactions: boolean;
    constructor(data?: Partial<Wallets>);
}
export interface WalletsRelations {
}
export declare type WalletsWithRelations = Wallets & WalletsRelations;
