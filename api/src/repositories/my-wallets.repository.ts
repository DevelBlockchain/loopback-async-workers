import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BlockchainDataSource} from '../datasources';
import {MyWallets, MyWalletsRelations, Users} from '../models';
import {UsersRepository} from './users.repository';

export class MyWalletsRepository extends DefaultCrudRepository<
  MyWallets,
  typeof MyWallets.prototype.id,
  MyWalletsRelations
> {

  public readonly users: BelongsToAccessor<Users, typeof MyWallets.prototype.id>;

  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource, @repository.getter('UsersRepository') protected usersRepositoryGetter: Getter<UsersRepository>,
  ) {
    super(MyWallets, dataSource);
    this.users = this.createBelongsToAccessorFor('users', usersRepositoryGetter,);
  }
}
