import { Model, model, property } from '@loopback/repository';

@model()
export class NodeDTO extends Model {

  @property({
    type: 'string',
  })
  address: string;

  @property({
    type: 'boolean',
  })
  isFullNode: boolean;

  @property({
    type: 'string',
  })
  host: string;

  @property({
    type: 'string',
  })
  version: string;

  @property({
    type: 'number',
  })
  updated: number;

  @property({
    type: 'string',
    hidden: true,
  })
  token: string;

  constructor(data?: Partial<NodeDTO>) {
    super(data);
  }
}

@model()
export class InfoDTO extends Model {

  @property({
    type: 'string',
  })
  address: string;

  @property({
    type: 'string',
  })
  host?: string;

  @property({
    type: 'string',
  })
  version: string;

  @property({
    type: 'number',
  })
  timestamp: number;
  
  @property({
    type: 'boolean',
  })
  isFullNode: boolean;

  @property({
    type: 'number',
  })
  nodesLimit: number;

  @property({
    type: 'array',
    itemType: NodeDTO,
  })
  nodes: NodeDTO[];

  constructor(data?: Partial<InfoDTO>) {
    super(data);
  }
}

@model()
export class TokenDTO extends Model {

  @property({
    type: 'string',
  })
  token: string;

  constructor(data?: Partial<TokenDTO>) {
    super(data);
  }
}