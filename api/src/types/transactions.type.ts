
import { Model, model, property } from '@loopback/repository';
import { Variable } from '../compiler/vm/data';
import { Configs, Transactions, Wallets } from '../models';
import { ContractsEnv } from '../models/contracts-env.model';
import { ContractsVars } from '../models/contracts-vars.model';
import { getRandomString } from '../utils/helper';
import { TxType, Slice, Tx, Block } from '@bywise/web3';
import BigNumber from 'bignumber.js';

export enum TransactionsStatus {
  TX_MEMPOOL = 'mempool',
  TX_MINED = 'mined',
  TX_INVALIDATED = 'invalidated',
}

@model()
export class TxSimpleModelDTO extends Model {

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
  amount: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(TxType),
    },
    required: true,
  })
  type: TxType;

  @property({
    type: 'array',
    itemType: 'string',
  })
  foreignKeys?: string[];

  @property({
    type: 'object',
  })
  data: any;

  constructor(data?: Partial<TxSimpleModelDTO>) {
    super(data);
  }
}

@model()
export class TxModelDTO extends Model {

  @property({
    type: 'string',
    required: true,
  })
  version: string;

  @property({
    type: 'string',
  })
  validator?: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  from: string[];

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  to: string[];

  @property({
    type: 'string',
    required: true,
  })
  tag: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  amount: string[];

  @property({
    type: 'string',
    required: true,
  })
  fee: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(TxType),
    },
    required: true,
  })
  type: TxType;

  @property({
    type: 'array',
    itemType: 'string',
  })
  foreignKeys?: string[];

  @property({
    type: 'object',
  })
  data: any;

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
    type: 'array',
    itemType: 'string',
    required: true,
  })
  sign: string[];

  constructor(data?: Partial<TxModelDTO>) {
    super(data);
  }
}

@model()
export class SliceModelDTO extends Model {

  @property({
    type: 'number',
    required: true,
  })
  height: number;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
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

  constructor(data?: Partial<SliceModelDTO>) {
    super(data);
  }
}

@model()
export class BlockModelDTO extends Model {

  @property({
    type: 'number',
    required: true,
  })
  height: number;

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
  lastHash: string;

  @property({
    type: 'string',
    required: true,
  })
  from: string;

  @property({
    type: 'string',
    required: true,
  })
  nextSlice: string;

  @property({
    type: 'string',
    required: true,
  })
  nextBlock: string;

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

  constructor(data?: Partial<BlockModelDTO>) {
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
export class ValueBooleanDTO extends Model {

  @property({
    type: 'boolean',
  })
  value: boolean;

  constructor(data?: Partial<ValueBooleanDTO>) {
    super(data);
  }
}

@model()
export class SimulateSliceDTO {

  constructor() {
    this.simulateId = getRandomString();
  }

  @property()
  simulateId: string;

  @property()
  simulate: boolean = false;

  @property({
    type: 'object',
    itemType: Transactions
  })
  tx?: Transactions = undefined;

  @property.array(SliceModelDTO)
  slicesModels: Slice[] = [];

  @property.array(Transactions)
  transactionsModels: Transactions[] = [];

  @property.array(Wallets)
  walletsModels: Wallets[] = [];

  @property.array(ContractsEnv)
  contractEnvModels: ContractsEnv[] = [];

  @property.array(ContractsVars)
  contractVarsModels: ContractsVars[] = [];

  @property()
  configs: Configs[] = [];
  
  @property()
  totalFee: string = '0';
}

@model()
export class VariableDTO extends Model {

  @property({
    type: 'any',
  })
  value: any;

  constructor(data?: Partial<VariableDTO>) {
    super(data);
  }
}

@model()
export class TransactionOutputDTO extends Model {
  @property({
    type: 'number',
  })
  cost: number;

  @property({
    type: 'number',
  })
  size: number;

  @property({
    type: 'string',
  })
  fee: string;

  @property({
    type: 'array',
    itemType: 'string'
  })
  logs: string[] = [];

  @property({
    type: 'object'
  })
  output: any;

  constructor(data?: Partial<TransactionOutputDTO>) {
    super(data);
  }
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

@model()
export class SimulateAccountDTO extends Model {

  @property({
    type: 'string',
    required: true,
  })
  address: string;

  @property({
    type: 'string',
    required: true,
  })
  balance: string;

  constructor(data?: Partial<SimulateAccountDTO>) {
    super(data);
  }
}

@model()
export class CompileRequestDTO extends Model {

  @property({
    type: 'string',
    default: 'asm',
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  code: string;

  @property({
    type: 'string',
  })
  from?: string;

  @property({
    type: 'object',
    itemType: SimulateSliceDTO,
  })
  ctx?: SimulateSliceDTO;

  constructor(data?: Partial<CompileRequestDTO>) {
    super(data);
  }
}

@model()
export class TryCompileDTO extends Model {

  @property({
    type: 'string',
  })
  error?: string;

  @property({
    type: 'object',
  })
  contract?: object;

  @property.array(SimulateAccountDTO)
  simulateAccounts?: SimulateAccountDTO[];

  @property({
    type: 'object',
    itemType: TransactionOutputDTO,
  })
  output?: TransactionOutputDTO;

  @property({
    type: 'object',
    itemType: SimulateSliceDTO,
  })
  ctx?: SimulateSliceDTO;

  constructor(data?: Partial<TryCompileDTO>) {
    super(data);
  }
}

@model()
export class SimulateContractDTO extends Model {

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  from: string[];

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  to: string[];

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  amount: string[];

  @property({
    type: 'string',
  })
  tag?: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  foreignKeys?: string[];

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(TxType),
    },
  })
  type: TxType;

  @property({
    type: 'object',
  })
  data: any;

  @property({
    type: 'object',
    itemType: SimulateSliceDTO,
  })
  ctx?: SimulateSliceDTO;

  constructor(data?: Partial<SimulateContractDTO>) {
    super(data);
  }
}

@model()
export class ObjectDTO extends Model {

  constructor(data?: Partial<ObjectDTO>) {
    super(data);
  }
}