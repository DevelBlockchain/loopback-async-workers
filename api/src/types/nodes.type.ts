import { Model, model, property } from '@loopback/repository';

@model()
export class ConfigDTO extends Model {

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  value: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  constructor(data?: Partial<ConfigDTO>) {
    super(data);
  }
}

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
    type: 'string',
  })
  updated: string;

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
    type: 'string',
  })
  timestamp: string;
  
  @property({
    type: 'boolean',
  })
  isFullNode: boolean;

  @property({
    type: 'number',
  })
  nodesLimit: number;

  @property.array(NodeDTO)
  nodes: NodeDTO[];

  @property.array(ConfigDTO)
  configs: ConfigDTO[];

  constructor(data?: Partial<InfoDTO>) {
    super(data);
  }
}