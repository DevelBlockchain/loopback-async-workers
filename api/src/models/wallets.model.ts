import { Entity, model, property } from '@loopback/repository';

@model()
export class Wallets extends Entity {
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
    default: '0',
  })
  balance: string;
  
  @property({
    type: 'string',
    required: true,
  })
  address: string;

  @property({
    type: 'string',
    default: '',
  })
  name?: string;

  @property({
    type: 'string',
    default: '',
  })
  photo?: string;
  
  @property({
    type: 'string',
    default: '',
  })
  url?: string;

  @property({
    type: 'string',
    default: '',
  })
  bio?: string;
  
  @property({
    type: 'string',
    default: '',
  })
  publicKey?: string;

  constructor(data?: Partial<Wallets>) {
    super(data);
  }
}

export interface WalletsRelations {
  // describe navigational properties here
}

export type WalletsWithRelations = Wallets & WalletsRelations;
