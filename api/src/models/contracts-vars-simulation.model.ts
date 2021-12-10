import {Entity, model, property} from '@loopback/repository';

@model()
export class ContractsVarsSimulation extends Entity {
  @property({
    id: true,
    type: 'string',
    required: false,
    // settings below are needed
    generated: true,
    useDefaultIdType: false,
    postgresql: {
      dataType: 'uuid',
    },
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  simulateId: string;

  @property({
    type: 'string',
    required: true,
  })
  address: string;

  @property({
    type: 'string',
    required: true,
  })
  registerId: string;

  @property({
    type: 'number',
  })
  indexKey: number;

  @property({
    type: 'string',
  })
  key: string;

  @property({
    type: 'string',
    required: true,
  })
  value: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  constructor(data?: Partial<ContractsVarsSimulation>) {
    super(data);
  }
}

export interface ContractsVarsSimulationRelations {
  // describe navigational properties here
}

export type ContractsVarsSimulationWithRelations = ContractsVarsSimulation & ContractsVarsSimulationRelations;
