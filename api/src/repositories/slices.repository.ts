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

  public readonly transactions: HasManyRepositoryFactory<Transactions, typeof Slices.prototype.id>;

  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource, @repository.getter('TransactionsRepository') protected transactionsRepositoryGetter: Getter<TransactionsRepository>,
  ) {
    super(Slices, dataSource);
    this.transactions = this.createHasManyRepositoryFactoryFor('transactions', transactionsRepositoryGetter,);
    this.registerInclusionResolver('transactions', this.transactions.inclusionResolver);
  }
}
