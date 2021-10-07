import { inject, Getter } from '@loopback/core';
import { DefaultCrudRepository, repository, HasManyRepositoryFactory } from '@loopback/repository';
import { BlockchainDataSource } from '../datasources';
import { Blocks, BlocksRelations, Slices } from '../models';
import { SlicesRepository } from './slices.repository';

export class BlocksRepository extends DefaultCrudRepository<
  Blocks,
  typeof Blocks.prototype.id,
  BlocksRelations
> {

  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource,
  ) {
    super(Blocks, dataSource);
  }
}
