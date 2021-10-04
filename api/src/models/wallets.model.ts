import { Entity, model, property } from '@loopback/repository';

@model()
export class Wallets extends Entity {
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
  publicKey: string;

  @property({
    type: 'number',
    default: 0,
  })
  balance: number;

  @property({
    type: 'string',
    required: true,
  })
  address: string;

  @property({
    type: 'boolean',
    default: false,
  })
  createCompanies: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  createEmployees: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  createTransactions: boolean;

  constructor(data?: Partial<Wallets>) {
    super(data);
  }
}

export interface WalletsRelations {
  // describe navigational properties here
}

export type WalletsWithRelations = Wallets & WalletsRelations;
