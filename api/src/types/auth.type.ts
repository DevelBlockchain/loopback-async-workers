import {Model, model, property} from '@loopback/repository';
import { Permissions, Roles, Users } from '../models';

@model()
export class CredentialsDTO extends Model {
  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      pattern: '^\\w+$'
    }
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      pattern: '^.{6,}$'
    }
  })
  password: string;

  @property({
    type: 'string',
  })
  code: string;

  @property({
    type: 'string',
  })
  partnersId: string;

  constructor(data?: Partial<CredentialsDTO>) {
    super(data);
  }
}

@model()
export class SecondFactorDTO extends Model {
  @property({
    type: 'string',
    required: true,
  })
  code: string;

  constructor(data?: Partial<SecondFactorDTO>) {
    super(data);
  }
}

@model()
export class InfoJWT extends Model {

  @property({
    type: 'string',
  })
  id: string;

  @property({
    type: 'object',
    itemType: Roles,
  })
  role: Roles;

  @property({
    type: 'array',
    itemType: Permissions,
  })
  permissions: Permissions[];

  constructor(data?: Partial<InfoJWT>) {
    super(data);
  }
}

@model()
export class MeDTO extends Model {

  @property({
    type: 'object',
    itemType: InfoJWT,
  })
  infoUser: InfoJWT;

  @property({
    type: 'object',
    itemType: Users,
  })
  user: Users;

  constructor(data?: Partial<MeDTO>) {
    super(data);
  }
}

@model()
export class TokenWithUserDTO extends Model {
  @property({
    type: 'string',
    required: true,
  })
  token: string;

  @property({
    type: 'object',
    itemType: InfoJWT,
  })
  infoUser?: InfoJWT;

  constructor(data?: Partial<TokenWithUserDTO>) {
    super(data);
  }
}

@model()
export class NewPassword extends Model {
  @property({
    type: 'string',
    required: true,
  })
  password: string;

  constructor(data?: Partial<NewPassword>) {
    super(data);
  }
}
