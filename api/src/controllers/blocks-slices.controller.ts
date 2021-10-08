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
  ): Promise<Slices[]> {
    return this.blocksRepository.slicesArray(id).find();
  }
}
