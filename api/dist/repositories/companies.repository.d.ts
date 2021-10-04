import { Getter } from '@loopback/core';
import { DefaultCrudRepository, BelongsToAccessor } from '@loopback/repository';
import { BlockchainDataSource } from '../datasources';
import { Companies, CompaniesRelations, Wallets } from '../models';
import { WalletsRepository } from './wallets.repository';
export declare class CompaniesRepository extends DefaultCrudRepository<Companies, typeof Companies.prototype.id, CompaniesRelations> {
    protected walletsRepositoryGetter: Getter<WalletsRepository>;
    readonly wallets: BelongsToAccessor<Wallets, typeof Companies.prototype.id>;
    constructor(dataSource: BlockchainDataSource, walletsRepositoryGetter: Getter<WalletsRepository>);
}
