
import { Model, model, property } from '@loopback/repository';
import { Variable } from '../compiler/vm/data';
import { Configs, Transactions, Wallets } from '../models';
import { ContractsEnv } from '../models/contracts-env.model';
import { ContractsVars } from '../models/contracts-vars.model';

export enum TransactionsStatus {
  TX_MEMPOOL = 'mempool',
  TX_MINED = 'mined',
  TX_INVALIDATED = 'invalidated',
}

export enum TransactionsType {
  TX_NONE = 'none',
  TX_JSON = 'json',
  TX_COMMAND = 'command',
  TX_CONTRACT = 'contract',
  TX_CONTRACT_EXE = 'contract-exe',
  TX_FILE = 'file',
  TX_STRING = 'string',
  TX_EN_JSON = 'json-encrypt',
  TX_EN_COMMAND = 'command-encrypt',
  TX_EN_CONTRACT = 'contract-encrypt',
  TX_EN_CONTRACT_EXE = 'contract-exe-encrypt',
  TX_EN_FILE = 'file-encrypt',
  TX_EN_STRING = 'string-encrypt',
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
export class SimulateSliceDTO extends Model {
  @property({
    type: 'string',
  })
  simulate: boolean;

  @property({
    type: 'object',
    itemType: Transactions
  })
  tx?: Transactions;

  @property.array(SliceDTO)
  slicesModels: SliceDTO[] = [];

  @property.array(Transactions)
  transactionsModels: Transactions[] = [];

  @property.array(Wallets)
  walletsModels: Wallets[] = [];

  @property.array(ContractsEnv)
  contractEnvModels: ContractsEnv[] = [];

  @property.array(ContractsVars)
  contractVarsModels: ContractsVars[] = [];

  @property({
    type: 'object',
    itemType: Configs
  })
  configs: Configs[] = [];
}

@model()
export class VariableDTO extends Model {
  @property({
    type: 'string',
  })
  type: string;

  @property({
    type: 'string',
  })
  value: string;

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
    type: 'array',
    itemType: VariableDTO
  })
  output: VariableDTO[] = [];

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
    default: '',
  })
  data: string;

  @property({
    type: 'object',
    itemType: SimulateSliceDTO,
  })
  ctx?: SimulateSliceDTO;

  constructor(data?: Partial<SimulateContractDTO>) {
    super(data);
  }
}