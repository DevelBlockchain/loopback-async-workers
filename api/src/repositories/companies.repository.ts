import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BlockchainDataSource} from '../datasources';
import {Companies, CompaniesRelations, Wallets} from '../models';
import {WalletsRepository} from './wallets.repository';

export class CompaniesRepository extends DefaultCrudRepository<
  Companies,
  typeof Companies.prototype.id,
  CompaniesRelations
> {

  public readonly wallets: BelongsToAccessor<Wallets, typeof Companies.prototype.id>;

  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource, @repository.getter('WalletsRepository') protected walletsRepositoryGetter: Getter<WalletsRepository>,
  ) {
    super(Companies, dataSource);
    this.wallets = this.createBelongsToAccessorFor('wallets', walletsRepositoryGetter,);
    this.registerInclusionResolver('wallets', this.wallets.inclusionResolver);
  }
}
