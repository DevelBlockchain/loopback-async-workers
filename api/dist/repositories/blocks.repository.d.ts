import { Getter } from '@loopback/core';
import { DefaultCrudRepository, HasManyRepositoryFactory } from '@loopback/repository';
import { BlockchainDataSource } from '../datasources';
import { Blocks, BlocksRelations, Slices } from '../models';
import { SlicesRepository } from './slices.repository';
export declare class BlocksRepository extends DefaultCrudRepository<Blocks, typeof Blocks.prototype.id, BlocksRelations> {
    protected slicesRepositoryGetter: Getter<SlicesRepository>;
    readonly slices: HasManyRepositoryFactory<Slices, typeof Blocks.prototype.id>;
    constructor(dataSource: BlockchainDataSource, slicesRepositoryGetter: Getter<SlicesRepository>);
}
