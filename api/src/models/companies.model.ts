import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Wallets} from './wallets.model';

@model()
export class Companies extends Entity {
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
  name?: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
  })
  logo?: string;

  @property({
    type: 'string',
  })
  url?: string;

  @property({
    type: 'object',
  })
  info?: object;

  @property({
    type: "date",
    default: '$now'
  })
  created: string;

  @belongsTo(() => Wallets)
  walletsId: string;

  constructor(data?: Partial<Companies>) {
    super(data);
  }
}

export interface CompaniesRelations {
  // describe navigational properties here
}

export type CompaniesWithRelations = Companies & CompaniesRelations;
