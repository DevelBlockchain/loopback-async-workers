import {Model, model, property} from '@loopback/repository';

export interface TxDTO {
  txId: string;
  fee: string;
}

@model()
export class TokenTransactionsDTO extends Model {

  @property({
    type: "string"
  })
  blockNumber: string;

  @property({
    type: "string"
  })
  timeStamp: string;

  @property({
    type: "string"
  })
  hash: string;

  @property({
    type: "string"
  })
  nonce: string;

  @property({
    type: "string"
  })
  blockHash: string;

  @property({
    type: "string"
  })
  from: string;

  @property({
    type: "string"
  })
  to: string;

  @property({
    type: "string"
  })
  contractAddress: string;

  @property({
    type: "string"
  })
  value: string;

  @property({
    type: "string"
  })
  tokenName: string;

  @property({
    type: "string"
  })
  tokenSymbol: string;

  @property({
    type: "string"
  })
  tokenDecimal: string;

  @property({
    type: "string"
  })
  transactionIndex: string;

  @property({
    type: "string"
  })
  gas: string;

  @property({
    type: "string"
  })
  gasPrice: string;

  @property({
    type: "string"
  })
  gasUsed: string;

  @property({
    type: "string"
  })
  cumulativeGasUsed: string;

  @property({
    type: "string"
  })
  input: string;

  @property({
    type: "string"
  })
  confirmations: string;


  constructor(data?: Partial<TokenTransactionsDTO>) {
    super(data);
  }
}

@model()
export class BscScanDTO extends Model {

  @property({
    type: 'string',
  })
  status: string;

  @property({
    type: 'string',
  })
  message: string;

  @property({
    type: 'array',
    itemType: TokenTransactionsDTO
  })
  result: TokenTransactionsDTO[];

  constructor(data?: Partial<BscScanDTO>) {
    super(data);
  }
}
