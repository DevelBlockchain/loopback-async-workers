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

  public readonly slicesArray: HasManyRepositoryFactory<Slices, typeof Blocks.prototype.id>;

  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource, @repository.getter('SlicesRepository') protected slicesRepositoryGetter: Getter<SlicesRepository>,
  ) {
    super(Blocks, dataSource);
    this.slicesArray = this.createHasManyRepositoryFactoryFor('slicesArray', slicesRepositoryGetter,);
    this.registerInclusionResolver('slicesArray', this.slicesArray.inclusionResolver);
  }
}
