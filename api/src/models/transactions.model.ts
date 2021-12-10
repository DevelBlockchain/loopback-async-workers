import { Entity, model, property } from '@loopback/repository';
import { TransactionOutputDTO, TransactionsStatus, TransactionsType } from '../types';

@model()
export class Transactions extends Entity {
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
  version: string;

  @property({
    type: 'string',
    required: true,
  })
  validator: string;

  @property({
    type: 'string',
    required: true,
  })
  from: string;

  @property({
    type: 'string',
    required: true,
  })
  to: string;

  @property({
    type: 'string',
    default: ''
  })
  tag: string;

  @property({
    type: 'string',
    required: true,
  })
  amount: string;

  @property({
    type: 'string',
    required: true,
  })
  fee: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(TransactionsType),
    },
    required: true,
  })
  type: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  foreignKeys?: string[];

  @property({
    type: 'string',
    default: '',
  })
  data: string;

  @property({
    type: 'date',
    required: true,
  })
  created: string;

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
  validatorSign?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(TransactionsStatus),
    },
    required: true,
  })
  status: string;

  @property({
    type: 'object',
    itemType: TransactionOutputDTO
  })
  output: TransactionOutputDTO;

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
