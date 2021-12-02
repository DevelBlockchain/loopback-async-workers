import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {BlockchainDataSource} from '../datasources';
import {Roles, RolesRelations, Permissions} from '../models';
import {PermissionsRepository} from './permissions.repository';

export class RolesRepository extends DefaultCrudRepository<
  Roles,
  typeof Roles.prototype.id,
  RolesRelations
> {

  public readonly permissions: HasManyRepositoryFactory<Permissions, typeof Roles.prototype.id>;

  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource, @repository.getter('PermissionsRepository') protected permissionsRepositoryGetter: Getter<PermissionsRepository>,
  ) {
    super(Roles, dataSource);
    this.permissions = this.createHasManyRepositoryFactoryFor('permissions', permissionsRepositoryGetter,);
    this.registerInclusionResolver('permissions', this.permissions.inclusionResolver);
  }
}
