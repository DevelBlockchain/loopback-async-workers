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
import {Blocks} from '../models';
import {BlocksRepository} from '../repositories';

export class BlocksController {
  constructor(
    @repository(BlocksRepository)
    public blocksRepository : BlocksRepository,
  ) {}

  @post('/blocks')
  @response(200, {
    description: 'Blocks model instance',
    content: {'application/json': {schema: getModelSchemaRef(Blocks)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Blocks, {
            title: 'NewBlocks',
            exclude: ['id'],
          }),
        },
      },
    })
    blocks: Omit<Blocks, 'id'>,
  ): Promise<Blocks> {
    return this.blocksRepository.create(blocks);
  }

  @get('/blocks/count')
  @response(200, {
    description: 'Blocks model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Blocks) where?: Where<Blocks>,
  ): Promise<Count> {
    return this.blocksRepository.count(where);
  }

  @get('/blocks')
  @response(200, {
    description: 'Array of Blocks model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Blocks, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Blocks) filter?: Filter<Blocks>,
  ): Promise<Blocks[]> {
    return this.blocksRepository.find(filter);
  }

  @patch('/blocks')
  @response(200, {
    description: 'Blocks PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Blocks, {partial: true}),
        },
      },
    })
    blocks: Blocks,
    @param.where(Blocks) where?: Where<Blocks>,
  ): Promise<Count> {
    return this.blocksRepository.updateAll(blocks, where);
  }

  @get('/blocks/{id}')
  @response(200, {
    description: 'Blocks model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Blocks, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Blocks, {exclude: 'where'}) filter?: FilterExcludingWhere<Blocks>
  ): Promise<Blocks> {
    return this.blocksRepository.findById(id, filter);
  }

  @patch('/blocks/{id}')
  @response(204, {
    description: 'Blocks PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Blocks, {partial: true}),
        },
      },
    })
    blocks: Blocks,
  ): Promise<void> {
    await this.blocksRepository.updateById(id, blocks);
  }

  @put('/blocks/{id}')
  @response(204, {
    description: 'Blocks PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() blocks: Blocks,
  ): Promise<void> {
    await this.blocksRepository.replaceById(id, blocks);
  }

  @del('/blocks/{id}')
  @response(204, {
    description: 'Blocks DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.blocksRepository.deleteById(id);
  }
}
