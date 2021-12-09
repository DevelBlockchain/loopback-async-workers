import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BlockchainDataSource} from '../datasources';
import {ContractsVarsSimulation, ContractsVarsSimulationRelations} from '../models';

export class ContractsVarsSimulationRepository extends DefaultCrudRepository<
  ContractsVarsSimulation,
  typeof ContractsVarsSimulation.prototype.id,
  ContractsVarsSimulationRelations
> {
  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource,
  ) {
    super(ContractsVarsSimulation, dataSource);
  }
}
