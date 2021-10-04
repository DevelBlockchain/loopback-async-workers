import { Getter } from '@loopback/core';
import { DefaultCrudRepository, BelongsToAccessor } from '@loopback/repository';
import { BlockchainDataSource } from '../datasources';
import { Employees, EmployeesRelations, Wallets, Companies } from '../models';
import { WalletsRepository } from './wallets.repository';
import { CompaniesRepository } from './companies.repository';
export declare class EmployeesRepository extends DefaultCrudRepository<Employees, typeof Employees.prototype.id, EmployeesRelations> {
    protected walletsRepositoryGetter: Getter<WalletsRepository>;
    protected companiesRepositoryGetter: Getter<CompaniesRepository>;
    readonly wallets: BelongsToAccessor<Wallets, typeof Employees.prototype.id>;
    readonly companies: BelongsToAccessor<Companies, typeof Employees.prototype.id>;
    constructor(dataSource: BlockchainDataSource, walletsRepositoryGetter: Getter<WalletsRepository>, companiesRepositoryGetter: Getter<CompaniesRepository>);
}
