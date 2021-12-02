import { authenticate } from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import { PermissionsTypes } from '../authorization/PermissionsTypes';
import {Partners} from '../models';
import {PartnersRepository} from '../repositories';

export class PartnersController {
  constructor(
    @repository(PartnersRepository)
    public partnersRepository : PartnersRepository,
  ) {}

  @authenticate({strategy: 'basic', options: [PermissionsTypes.ADMIN, true]})
  @post('/api/v1/partners')
  @response(200, {
    description: 'Partners model instance',
    content: {'application/json': {schema: getModelSchemaRef(Partners)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Partners, {
            title: 'NewPartners',
            exclude: ['id', 'created'],
          }),
        },
      },
    })
    partners: Omit<Partners, 'id'>,
  ): Promise<Partners> {
    return this.partnersRepository.create(partners);
  }

  @authenticate({strategy: 'basic', options: [PermissionsTypes.ADMIN, false]})
  @get('/api/v1/partners/count')
  @response(200, {
    description: 'Partners model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Partners) where?: Where<Partners>,
  ): Promise<Count> {
    return this.partnersRepository.count(where);
  }

  @authenticate({strategy: 'basic', options: [PermissionsTypes.ADMIN, false]})
  @get('/api/v1/partners')
  @response(200, {
    description: 'Array of Partners model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Partners, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Partners) filter?: Filter<Partners>,
  ): Promise<Partners[]> {
    return this.partnersRepository.find(filter);
  }

  @authenticate({strategy: 'basic', options: [PermissionsTypes.ADMIN, false]})
  @get('/api/v1/partners/{id}')
  @response(200, {
    description: 'Partners model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Partners, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Partners, {exclude: 'where'}) filter?: FilterExcludingWhere<Partners>
  ): Promise<Partners> {
    return this.partnersRepository.findById(id, filter);
  }

  @authenticate({strategy: 'basic', options: [PermissionsTypes.ADMIN, true]})
  @patch('/api/v1/partners/{id}')
  @response(204, {
    description: 'Partners PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Partners, {partial: true}),
        },
      },
    })
    partners: Partners,
  ): Promise<void> {
    await this.partnersRepository.updateById(id, partners);
  }

  @authenticate({strategy: 'basic', options: [PermissionsTypes.ADMIN, true]})
  @del('/api/v1/partners/{id}')
  @response(204, {
    description: 'Partners DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.partnersRepository.deleteById(id);
  }
}
