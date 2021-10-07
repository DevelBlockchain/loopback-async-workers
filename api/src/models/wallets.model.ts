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
    default: '0',
  })
  balance: string;

  @property({
    type: 'string',
    required: true,
  })
  address: string;

  constructor(data?: Partial<Wallets>) {
    super(data);
  }
}

export interface WalletsRelations {
  // describe navigational properties here
}

export type WalletsWithRelations = Wallets & WalletsRelations;
