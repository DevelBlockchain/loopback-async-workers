import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { Getter, inject } from '@loopback/core';
import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import { PermissionsTypes } from '../authorization/PermissionsTypes';
import { AccessTokens } from '../models';
import { AccessTokensRepository } from '../repositories';
import { NodesProvider } from '../services';
import { InfoJWT, ValueDTO } from '../types';

export class AccessTokensController {
  constructor(
    @repository(AccessTokensRepository) public accessTokensRepository: AccessTokensRepository,
    @inject.getter(AuthenticationBindings.CURRENT_USER) public getCurrentUser: Getter<InfoJWT>,
  ) { }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.TOKENS, true] })
  @post('/api/v1/access-tokens')
  @response(200, {
    description: 'AccessTokens model instance',
    content: { 'application/json': { schema: getModelSchemaRef(AccessTokens) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccessTokens, {
            exclude:['created', 'id', 'usersId', 'rolesId', 'token']
          }),
        },
      },
    }) accessTokens: AccessTokens
  ): Promise<ValueDTO> {
    let info = await this.getCurrentUser();
    accessTokens.rolesId = info.role.id;
    accessTokens.usersId = info.id;
    accessTokens.token = NodesProvider.getRandomToken();
    this.accessTokensRepository.create(accessTokens);
    return new ValueDTO({ value: accessTokens.token });
  }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.TOKENS, false] })
  @get('/api/v1/access-tokens')
  @response(200, {
    description: 'Array of AccessTokens model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(AccessTokens, { includeRelations: true }),
        },
      },
    },
  })
  async find(): Promise<AccessTokens[]> {
    let info = await this.getCurrentUser();
    return this.accessTokensRepository.find({
      where: {
        usersId: info.id,
      }
    });
  }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.TOKENS, true] })
  @del('/api/v1/access-tokens/{id}')
  @response(204, {
    description: 'AccessTokens DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string
  ): Promise<void> {
    let info = await this.getCurrentUser();
    let token = await this.accessTokensRepository.findOne({
      where: {
        usersId: info.id,
        id: id,
      }
    });
    if (token) {
      await this.accessTokensRepository.delete(token);
    }
  }
}
