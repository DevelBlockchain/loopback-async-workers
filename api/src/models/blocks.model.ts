import {Entity, model, property, hasMany} from '@loopback/repository';
import {Slices} from './slices.model';

@model()
export class Blocks extends Entity {
  @property({
    id: true,
    type: 'string',
    required: false,
    // settings below are needed
    generated: true,
    useDefaultIdType: false,
    postgresql: {
      dataType: 'uuid',
    },
  })
  id: string;

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
    type: 'array',
    itemType: 'string'
  })
  externalTxID?: string[];

  @hasMany(() => Slices)
  slicesArray: Slices[];

  constructor(data?: Partial<Blocks>) {
    super(data);
  }
}

export interface BlocksRelations {
  // describe navigational properties here
}

export type BlockWithRelations = Blocks & BlocksRelations;
