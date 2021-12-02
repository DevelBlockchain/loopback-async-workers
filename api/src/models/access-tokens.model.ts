import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Users} from './users.model';
import {MyWallets} from './my-wallets.model';
import {Roles} from './roles.model';

@model()
export class AccessTokens extends Entity {
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
  name: string;

  @property({
    type: 'string',
    hidden: true,
    required: true,
  })
  token: string;

  @property({
    type: "date",
    dataType: "timestamp",
    default: '$now'
  })
  created: string;

  @belongsTo(() => Users)
  usersId: string;

  @belongsTo(() => Roles)
  rolesId: string;

  constructor(data?: Partial<AccessTokens>) {
    super(data);
  }
}

export interface AccessTokensRelations {
  // describe navigational properties here
}

export type AccessTokensWithRelations = AccessTokens & AccessTokensRelations;
