import { DefaultCrudRepository } from '@loopback/repository';
import { BlockchainDataSource } from '../datasources';
import { Transactions, TransactionsRelations } from '../models';
export declare class TransactionsRepository extends DefaultCrudRepository<Transactions, typeof Transactions.prototype.id, TransactionsRelations> {
    constructor(dataSource: BlockchainDataSource);
}
