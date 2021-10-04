
import {Model, model, property} from '@loopback/repository';

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
export class TransactionsDTO extends Model {
  
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
  sign?: string | undefined;

  constructor(data?: Partial<TransactionsDTO>) {
    super(data);
  }
}
