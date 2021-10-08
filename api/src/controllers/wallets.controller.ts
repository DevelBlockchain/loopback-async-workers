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

  @post('/wallets')
  @response(200, {
    description: 'Wallets model instance',
    content: {'application/json': {schema: getModelSchemaRef(Wallets)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Wallets, {
            title: 'NewWallets',
            exclude: ['id'],
          }),
        },
      },
    })
    wallets: Omit<Wallets, 'id'>,
  ): Promise<Wallets> {
    return this.walletsRepository.create(wallets);
  }

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

  @patch('/wallets')
  @response(200, {
    description: 'Wallets PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Wallets, {partial: true}),
        },
      },
    })
    wallets: Wallets,
    @param.where(Wallets) where?: Where<Wallets>,
  ): Promise<Count> {
    return this.walletsRepository.updateAll(wallets, where);
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

  @patch('/wallets/{id}')
  @response(204, {
    description: 'Wallets PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Wallets, {partial: true}),
        },
      },
    })
    wallets: Wallets,
  ): Promise<void> {
    await this.walletsRepository.updateById(id, wallets);
  }

  @put('/wallets/{id}')
  @response(204, {
    description: 'Wallets PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() wallets: Wallets,
  ): Promise<void> {
    await this.walletsRepository.replaceById(id, wallets);
  }

  @del('/wallets/{id}')
  @response(204, {
    description: 'Wallets DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.walletsRepository.deleteById(id);
  }
}
