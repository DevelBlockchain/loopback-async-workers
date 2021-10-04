import { DefaultCrudRepository } from '@loopback/repository';
import { BlockchainDataSource } from '../datasources';
import { Wallets, WalletsRelations } from '../models';
export declare class WalletsRepository extends DefaultCrudRepository<Wallets, typeof Wallets.prototype.id, WalletsRelations> {
    constructor(dataSource: BlockchainDataSource);
}
