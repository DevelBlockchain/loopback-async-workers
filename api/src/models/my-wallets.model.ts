import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Users} from './users.model';

@model()
export class MyWallets extends Entity {
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
    type: 'string',
    hidden: true,
    required: true,
  })
  seed: string;
  
  @property({
    type: 'string',
    required: true,
  })
  name: string;
  
  @property({
    type: 'string',
    required: true,
  })
  address: string;
  
  @property({
    type: "date",
    default: '$now'
  })
  created: string;

  @belongsTo(() => Users)
  usersId: string;

  constructor(data?: Partial<MyWallets>) {
    super(data);
  }
}

export interface MyWalletsRelations {
  // describe navigational properties here
}

export type MyWalletsWithRelations = MyWallets & MyWalletsRelations;
