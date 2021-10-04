import {Entity, model, property} from '@loopback/repository';

enum TransactionsStatus {
  MEMPOOL = 'mempool',
  MINED = 'mined',
}

enum TransactionsType {
  JSON = 'json',
  COMMAND = 'command',
  FILE = 'file',
  STRING = 'string',
}

@model()
export class Transactions extends Entity {
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
  from: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  ForeignKeys?: string[];

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(TransactionsType),
    },
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  data: string;

  @property({
    type: 'string',
    required: true,
  })
  hash: string;

  @property({
    type: 'date',
    required: true,
  })
  created: string;

  @property({
    type: 'string',
    required: true,
  })
  sign: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(TransactionsStatus),
    },
    required: true,
  })
  status: string;

  @property({
    type: 'string',
  })
  slicesId?: string;

  constructor(data?: Partial<Transactions>) {
    super(data);
  }
}

export interface TransactionsRelations {
  // describe navigational properties here
}

export type TransactionsWithRelations = Transactions & TransactionsRelations;
