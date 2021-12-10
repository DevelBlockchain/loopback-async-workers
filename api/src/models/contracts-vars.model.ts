import {Entity, model, property} from '@loopback/repository';

@model()
export class ContractsVars extends Entity {
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

  constructor(data?: Partial<ContractsVars>) {
    super(data);
  }
}

export interface ContractsVarsRelations {
  // describe navigational properties here
}

export type ContractsVarsWithRelations = ContractsVars & ContractsVarsRelations;
