import { Getter } from '@loopback/core';
import { DefaultCrudRepository, HasManyRepositoryFactory } from '@loopback/repository';
import { BlockchainDataSource } from '../datasources';
import { Slices, SlicesRelations, Transactions } from '../models';
import { TransactionsRepository } from './transactions.repository';
export declare class SlicesRepository extends DefaultCrudRepository<Slices, typeof Slices.prototype.id, SlicesRelations> {
    protected transactionsRepositoryGetter: Getter<TransactionsRepository>;
    readonly transactions: HasManyRepositoryFactory<Transactions, typeof Slices.prototype.id>;
    constructor(dataSource: BlockchainDataSource, transactionsRepositoryGetter: Getter<TransactionsRepository>);
}
