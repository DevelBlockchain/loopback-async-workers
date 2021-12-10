import {Entity, model, property, hasOne} from '@loopback/repository';
import {Users} from './users.model';

@model()
export class Partners extends Entity {
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
    type: "date",
    dataType: "timestamp",
    default: '$now'
  })
  created: string;

  @hasOne(() => Users)
  users: Users;

  constructor(data?: Partial<Partners>) {
    super(data);
  }
}

export interface PartnersRelations {
  // describe navigational properties here
}

export type PartnersWithRelations = Partners & PartnersRelations;
