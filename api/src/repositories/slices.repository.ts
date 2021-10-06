import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BlockchainDataSource} from '../datasources';
import {Slices, SlicesRelations, Transactions} from '../models';

export class SlicesRepository extends DefaultCrudRepository<
  Slices,
  typeof Slices.prototype.id,
  SlicesRelations
> {

  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource,
  ) {
    super(Slices, dataSource);
  }
}
