import { Count, Filter, Where } from '@loopback/repository';
import { Transactions } from '../models';
import { TransactionsRepository } from '../repositories';
export declare class TransactionsController {
    transactionsRepository: TransactionsRepository;
    constructor(transactionsRepository: TransactionsRepository);
    count(where?: Where<Transactions>): Promise<Count>;
    find(filter?: Filter<Transactions>): Promise<Transactions[]>;
    findById(hash: string): Promise<Transactions>;
}
