import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {BlockchainDataSource} from '../datasources';
import {Partners, PartnersRelations, Users} from '../models';
import {UsersRepository} from './users.repository';

export class PartnersRepository extends DefaultCrudRepository<
  Partners,
  typeof Partners.prototype.id,
  PartnersRelations
> {

  public readonly users: HasOneRepositoryFactory<Users, typeof Partners.prototype.id>;

  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource, 
    @repository.getter('UsersRepository') protected usersRepositoryGetter: Getter<UsersRepository>,
  ) {
    super(Partners, dataSource);
    this.users = this.createHasOneRepositoryFactoryFor('users', usersRepositoryGetter);
    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}
