import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BlockchainDataSource} from '../datasources';
import {Simulations, SimulationsRelations} from '../models';

export class SimulationsRepository extends DefaultCrudRepository<
  Simulations,
  typeof Simulations.prototype.id,
  SimulationsRelations
> {
  constructor(
    @inject('datasources.blockchain') dataSource: BlockchainDataSource,
  ) {
    super(Simulations, dataSource);
  }
}
