import {Entity, model, property, hasMany} from '@loopback/repository';
import {Slices} from './slices.model';

@model()
export class Blocks extends Entity {
  @property({
    id: true,
    type: 'string',
    defaultFn: 'uuid',
  })
  id: string;

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
    required: true,
  })
  externalHash: string;

  @property({
    type: 'string',
    required: true,
  })
  externalURL: string;

  @hasMany(() => Slices)
  slices: Slices[];

  constructor(data?: Partial<Blocks>) {
    super(data);
  }
}

export interface BlocksRelations {
  // describe navigational properties here
}

export type BlockWithRelations = Blocks & BlocksRelations;
