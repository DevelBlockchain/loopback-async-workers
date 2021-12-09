import {Entity, model, property} from '@loopback/repository';

@model()
export class Simulations extends Entity {
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
    type: "date",
    default: '$now'
  })
  created: string;

  constructor(data?: Partial<Simulations>) {
    super(data);
  }
}

export interface SimulationsRelations {
  // describe navigational properties here
}

export type SimulationsWithRelations = Simulations & SimulationsRelations;
