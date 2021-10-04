import { Model } from '@loopback/repository';
export declare class TransactionsDTO extends Model {
    from: string;
    ForeignKeys?: string[];
    type: string;
    data: string;
    hash: string;
    created: string;
    sign?: string | undefined;
    constructor(data?: Partial<TransactionsDTO>);
}
