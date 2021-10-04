import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BlockchainDataSource} from '../datasources';
import {Employees, EmployeesRelations, Wallets, Companies} from '../models';
import {WalletsRepository} from './wallets.repository';
import {CompaniesRepository} from './companies.repository';

export class EmployeesRepository extends DefaultCrudRepository<
  Employees,
  typeof Employees.prototype.id,
  EmployeesRelations
> {

  public readonly wallets: BelongsToAccessor<Wallets, typeof Employees.prototype.id>;

  public readonly companies: BelongsToAccessor<Companies, typeof Employees.prototype.id>;

  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource, @repository.getter('WalletsRepository') protected walletsRepositoryGetter: Getter<WalletsRepository>, @repository.getter('CompaniesRepository') protected companiesRepositoryGetter: Getter<CompaniesRepository>,
  ) {
    super(Employees, dataSource);
    this.companies = this.createBelongsToAccessorFor('companies', companiesRepositoryGetter,);
    this.registerInclusionResolver('companies', this.companies.inclusionResolver);
    this.wallets = this.createBelongsToAccessorFor('wallets', walletsRepositoryGetter,);
    this.registerInclusionResolver('wallets', this.wallets.inclusionResolver);
  }
}
