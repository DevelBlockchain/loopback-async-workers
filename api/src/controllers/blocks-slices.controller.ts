import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Blocks,
  Slices,
} from '../models';
import {BlocksRepository} from '../repositories';

export class BlocksSlicesController {
  constructor(
    @repository(BlocksRepository) protected blocksRepository: BlocksRepository,
  ) { }

  @get('/blocks/{id}/slices', {
    responses: {
      '200': {
        description: 'Array of Blocks has many Slices',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Slices)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Slices>,
  ): Promise<Slices[]> {
    return this.blocksRepository.slicesArray(id).find(filter);
  }

  @post('/blocks/{id}/slices', {
    responses: {
      '200': {
        description: 'Blocks model instance',
        content: {'application/json': {schema: getModelSchemaRef(Slices)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Blocks.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Slices, {
            title: 'NewSlicesInBlocks',
            exclude: ['id'],
            optional: ['blocksId']
          }),
        },
      },
    }) slices: Omit<Slices, 'id'>,
  ): Promise<Slices> {
    return this.blocksRepository.slicesArray(id).create(slices);
  }

  @patch('/blocks/{id}/slices', {
    responses: {
      '200': {
        description: 'Blocks.Slices PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Slices, {partial: true}),
        },
      },
    })
    slices: Partial<Slices>,
    @param.query.object('where', getWhereSchemaFor(Slices)) where?: Where<Slices>,
  ): Promise<Count> {
    return this.blocksRepository.slicesArray(id).patch(slices, where);
  }

  @del('/blocks/{id}/slices', {
    responses: {
      '200': {
        description: 'Blocks.Slices DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Slices)) where?: Where<Slices>,
  ): Promise<Count> {
    return this.blocksRepository.slicesArray(id).delete(where);
  }
}
