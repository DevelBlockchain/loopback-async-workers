import { Entity } from '@loopback/repository';
export declare class Transactions extends Entity {
    id: string;
    from: string;
    ForeignKeys?: string[];
    type: string;
    data: string;
    hash: string;
    created: string;
    sign: string;
    status: string;
    slicesId?: string;
    constructor(data?: Partial<Transactions>);
}
export interface TransactionsRelations {
}
export declare type TransactionsWithRelations = Transactions & TransactionsRelations;
