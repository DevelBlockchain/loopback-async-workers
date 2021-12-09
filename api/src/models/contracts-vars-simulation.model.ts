import {Entity, model, property} from '@loopback/repository';

@model()
export class ContractsVarsSimulation extends Entity {
  @property({
    id: true,
    type: 'string',
    defaultFn: 'uuid',
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
    type: 'string',
    required: true,
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

  @property({
    type: 'boolean',
    required: true,
  })
  del: boolean;

  @property({
    type: "date",
    default: '$now'
  })
  created: string;

  constructor(data?: Partial<ContractsVarsSimulation>) {
    super(data);
  }
}

export interface ContractsVarsSimulationRelations {
  // describe navigational properties here
}

export type ContractsVarsSimulationWithRelations = ContractsVarsSimulation & ContractsVarsSimulationRelations;
