
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
    required: true,
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
    required: true,
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
  })
  validatorSign?: string;

  @property({
    type: 'string',
    required: true,
  })
  sign: string;

  constructor(data?: Partial<TransactionsDTO>) {
    super(data);
  }
}

@model()
export class SliceDTO extends Model {
  
  @property({
    type: 'number',
    required: true,
  })
  height: number;

  @property({
    type: 'boolean',
    required: true,
  })
  isPublic: boolean;

  @property({
    type: 'array',
    itemType: 'string'
  })
  transactions: string[];

  @property({
    type: 'number',
    required: true,
  })
  numberOfTransactions: number;

  @property({
    type: 'string',
    required: true,
  })
  version: string;
  
  @property({
    type: 'string',
    required: true,
  })
  merkleRoot: string;
  
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
  hash: string;

  @property({
    type: 'string',
    required: true,
  })
  sign: string;

  constructor(data?: Partial<SliceDTO>) {
    super(data);
  }
}

@model()
export class BlockDTO extends Model {
  
  @property({
    type: 'number',
    required: true,
  })
  height: number;

  @property({
    type: 'number',
    required: true,
  })
  numberOfTransactions: number;

  @property({
    type: 'array',
    itemType: 'string'
  })
  slices: string[];

  @property({
    type: 'string',
    required: true,
  })
  version: string;
  
  @property({
    type: 'string',
    required: true,
  })
  merkleRoot: string;

  @property({
    type: 'string',
    required: true,
  })
  lastHash: string;

  @property({
    type: 'string',
    required: true,
  })
  from: string;

  @property({
    type: "date",
    default: '$now'
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
  externalTxID?: string;

  constructor(data?: Partial<BlockDTO>) {
    super(data);
  }
}

@model()
export class PackageDTO extends Model {
  
  @property({
    type: 'array',
    itemType: TransactionsDTO
  })
  transactions: TransactionsDTO[];

  @property({
    type: 'array',
    itemType: SliceDTO
  })
  slices: SliceDTO[];

  @property({
    type: 'array',
    itemType: BlockDTO
  })
  blocks: BlockDTO[];

  constructor(data?: Partial<PackageDTO>) {
    super(data);
  }
}
