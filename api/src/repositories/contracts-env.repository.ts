import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BlockchainDataSource} from '../datasources';
import {ContractsEnv, ContractsEnvRelations} from '../models';

export class ContractsEnvRepository extends DefaultCrudRepository<
  ContractsEnv,
  typeof ContractsEnv.prototype.id,
  ContractsEnvRelations
> {
  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource,
  ) {
    super(ContractsEnv, dataSource);
  }
}
