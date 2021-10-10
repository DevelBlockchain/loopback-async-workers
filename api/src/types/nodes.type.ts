import { Model, model, property } from '@loopback/repository';
import { Configs } from '../models';

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
    //hidden: true,
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

  @property({
    type: 'array',
    itemType: NodeDTO,
  })
  nodes: NodeDTO[];

  @property({
    type: 'array',
    itemType: Configs,
  })
  configs: Configs[];

  constructor(data?: Partial<InfoDTO>) {
    super(data);
  }
}