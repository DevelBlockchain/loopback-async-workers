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
import {Wallets} from '../models';
import {WalletsRepository} from '../repositories';

export class WalletsController {
  constructor(
    @repository(WalletsRepository)
    public walletsRepository : WalletsRepository,
  ) {}

  @get('/wallets/count')
  @response(200, {
    description: 'Wallets model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Wallets) where?: Where<Wallets>,
  ): Promise<Count> {
    return this.walletsRepository.count(where);
  }

  @get('/wallets')
  @response(200, {
    description: 'Array of Wallets model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Wallets, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Wallets) filter?: Filter<Wallets>,
  ): Promise<Wallets[]> {
    return this.walletsRepository.find(filter);
  }

  @get('/wallets/{id}')
  @response(200, {
    description: 'Wallets model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Wallets, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Wallets, {exclude: 'where'}) filter?: FilterExcludingWhere<Wallets>
  ): Promise<Wallets> {
    return this.walletsRepository.findById(id, filter);
  }
}
