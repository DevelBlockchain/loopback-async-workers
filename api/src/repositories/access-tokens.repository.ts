import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BlockchainDataSource} from '../datasources';
import {AccessTokens, AccessTokensRelations, Users, MyWallets, Roles} from '../models';
import {UsersRepository} from './users.repository';
import {MyWalletsRepository} from './my-wallets.repository';
import {RolesRepository} from './roles.repository';

export class AccessTokensRepository extends DefaultCrudRepository<
  AccessTokens,
  typeof AccessTokens.prototype.id,
  AccessTokensRelations
> {

  public readonly users: BelongsToAccessor<Users, typeof AccessTokens.prototype.id>;

  public readonly roles: BelongsToAccessor<Roles, typeof AccessTokens.prototype.id>;

  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource, @repository.getter('UsersRepository') protected usersRepositoryGetter: Getter<UsersRepository>, @repository.getter('MyWalletsRepository') protected myWalletsRepositoryGetter: Getter<MyWalletsRepository>, @repository.getter('RolesRepository') protected rolesRepositoryGetter: Getter<RolesRepository>,
  ) {
    super(AccessTokens, dataSource);
    this.roles = this.createBelongsToAccessorFor('roles', rolesRepositoryGetter,);
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
    this.users = this.createBelongsToAccessorFor('users', usersRepositoryGetter,);
    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}
