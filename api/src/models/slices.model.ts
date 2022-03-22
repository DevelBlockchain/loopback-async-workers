import {Entity, model, property, hasMany} from '@loopback/repository';
import {Transactions} from './transactions.model';

@model()
export class Slices extends Entity {
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
    type: 'number',
    required: true,
  })
  height: number;

  @property({
    type: 'array',
    itemType: 'string'
  })
  transactions: string[];

  @property({
    type: 'string',
    required: true,
  })
  version: string;

  @property({
    type: 'string',
    required: true,
  })
  lastBlockHash: string;

  @property({
    type: "date",
    default: '$now'
  })
  created: string;

  @property({
    type: 'string',
    required: true,
  })
  from: string;
  
  @property({
    type: 'string',
    required: true,
  })
  next: string;

  @property({
    type: 'string',
    required: true,
  })
  hash: string;

  @property({
    type: 'string',
    required: true,
  })
  sign: string;

  @property({
    type: 'string',
  })
  blocksId?: string;

  @hasMany(() => Transactions)
  transactionsArray: Transactions[];

  constructor(data?: Partial<Slices>) {
    super(data);
  }
}

export interface SlicesRelations {
  // describe navigational properties here
}

export type SlicesWithRelations = Slices & SlicesRelations;
