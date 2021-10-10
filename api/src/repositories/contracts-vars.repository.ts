import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BlockchainDataSource} from '../datasources';
import {ContractsVars, ContractsVarsRelations} from '../models';

export class ContractsVarsRepository extends DefaultCrudRepository<
  ContractsVars,
  typeof ContractsVars.prototype.id,
  ContractsVarsRelations
> {
  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource,
  ) {
    super(ContractsVars, dataSource);
  }
}
