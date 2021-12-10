import {Entity, model, property} from '@loopback/repository';

@model()
export class Permissions extends Entity {
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
    required: true,
  })
  name: string;

  @property({
    type: 'boolean',
    required: true,
  })
  write: boolean;

  @property({
    type: 'string',
  })
  rolesId?: string;

  constructor(data?: Partial<Permissions>) {
    super(data);
  }
}

export interface PermissionsRelations {
  // describe navigational properties here
}

export type PermissionsWithRelations = Permissions & PermissionsRelations;
