import { Entity, model, property, belongsTo, hasOne} from '@loopback/repository';
import {Roles} from './roles.model';

@model()
export class Users extends Entity {
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
  username: string;

  @property({
    type: 'string',
    hidden: true,
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    hidden: true,
    default: '',
  })
  secondFactor: string;

  @property({
    type: 'boolean',
    default: false
  })
  enable2FA: boolean

  @property({
    type: "date",
    default: '$now'
  })
  created: string;

  @belongsTo(() => Roles)
  rolesId: string;

  @property({
    type: 'string',
  })
  partnersId?: string;

  constructor(data?: Partial<Users>) {
    super(data);
  }
}

export interface UsersRelations {
  // describe navigational properties here
}

export type UsersWithRelations = Users & UsersRelations;
