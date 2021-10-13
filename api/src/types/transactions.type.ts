
import { Model, model, property } from '@loopback/repository';
import { Configs, Transactions, TransactionsType, Wallets } from '../models';
import { ContractsEnv } from '../models/contracts-env.model';
import { ContractsVars } from '../models/contracts-vars.model';

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
export class ValueDTO extends Model {

  @property({
    type: 'string',
  })
  value: string;

  constructor(data?: Partial<ValueDTO>) {
    super(data);
  }
}

@model()
export class SimulateSliceDTO extends Model {
  tx: Transactions | undefined;
  slicesModels: SliceDTO[] = [];
  transactionsModels: Transactions[] = [];
  walletsModels: Wallets[] = [];
  contractEnvModels: ContractsEnv[] = [];
  contractVarsModels: ContractsVars[] = [];
  configs: Configs[] = [];
}

@model()
export class CommandDTO extends Model {

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'array',
    itemType: 'string'
  })
  input: string[];

  constructor(data?: Partial<CommandDTO>) {
    super(data);
  }
}

@model()
export class WalletInfoDTO extends Model {

  @property({
    type: 'string',
    default: '',
  })
  photo: string;
  
  @property({
    type: 'string',
    default: '',
  })
  name: string;

  @property({
    type: 'string',
    default: '',
  })
  url: string;

  @property({
    type: 'string',
    default: '',
  })
  bio: string;
  
  @property({
    type: 'string',
    default: '',
  })
  publicKey: string;

  constructor(data?: Partial<WalletInfoDTO>) {
    super(data);
  }
}