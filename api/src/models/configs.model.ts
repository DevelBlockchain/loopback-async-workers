import {Entity, model, property} from '@loopback/repository';

@model()
export class Configs extends Entity {
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
  name: string;

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

  constructor(data?: Partial<Configs>) {
    super(data);
  }
}

export interface ConfigsRelations {
  // describe navigational properties here
}

export type ConfigsWithRelations = Configs & ConfigsRelations;
