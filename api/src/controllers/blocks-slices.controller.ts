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
  HttpErrors,
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

  @get('/blocks/{hash}/slices', {
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
    @param.path.string('hash') hash: string,
  ): Promise<Slices[]> {
    let value = await this.blocksRepository.findOne({ where: { hash } });
    if (!value) {
      throw new HttpErrors.NotFound();
    }
    return this.blocksRepository.slicesArray(value.id).find();
  }
}
