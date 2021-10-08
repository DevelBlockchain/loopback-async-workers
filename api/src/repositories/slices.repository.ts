import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {BlockchainDataSource} from '../datasources';
import {Slices, SlicesRelations, Transactions} from '../models';
import {TransactionsRepository} from './transactions.repository';

export class SlicesRepository extends DefaultCrudRepository<
  Slices,
  typeof Slices.prototype.id,
  SlicesRelations
> {

  public readonly transactionsArray: HasManyRepositoryFactory<Transactions, typeof Slices.prototype.id>;

  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource, @repository.getter('TransactionsRepository') protected transactionsRepositoryGetter: Getter<TransactionsRepository>,
  ) {
    super(Slices, dataSource);
    this.transactionsArray = this.createHasManyRepositoryFactoryFor('transactionsArray', transactionsRepositoryGetter,);
    this.registerInclusionResolver('transactionsArray', this.transactionsArray.inclusionResolver);
  }
}
