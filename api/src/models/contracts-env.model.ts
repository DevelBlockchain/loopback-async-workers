import {Entity, model, property} from '@loopback/repository';

@model()
export class ContractsEnv extends Entity {
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
  address: string;

  @property({
    type: 'string',
  })
  env: string;

  constructor(data?: Partial<ContractsEnv>) {
    super(data);
  }
}

export interface ContractsEnvRelations {
  // describe navigational properties here
}

export type ContractsEnvWithRelations = ContractsEnv & ContractsEnvRelations;
