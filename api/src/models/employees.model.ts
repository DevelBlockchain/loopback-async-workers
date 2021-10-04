import { Entity, model, property, belongsTo} from '@loopback/repository';
import {Wallets} from './wallets.model';
import {Companies} from './companies.model';

@model()
export class Employees extends Entity {
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

  @belongsTo(() => Companies)
  companiesId: string;

  constructor(data?: Partial<Employees>) {
    super(data);
  }
}

export interface EmployeesRelations {
  // describe navigational properties here
}

export type EmployeesWithRelations = Employees & EmployeesRelations;
