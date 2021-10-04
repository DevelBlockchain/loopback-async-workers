import { Entity } from '@loopback/repository';
import { Transactions } from './transactions.model';
export declare class Slices extends Entity {
    id: string;
    height: number;
    numberOfTransactions: number;
    version: string;
    merkleRoot: string;
    lastHash?: string;
    created: string;
    hash: string;
    blocksId?: string;
    transactions: Transactions[];
    constructor(data?: Partial<Slices>);
}
export interface SlicesRelations {
}
export declare type SlicesWithRelations = Slices & SlicesRelations;
