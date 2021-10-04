import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef, HttpErrors, param, post, requestBody,
  response
} from '@loopback/rest';
import { Blocks } from '../models';
import { BlocksRepository } from '../repositories';

export class BlocksController {
  constructor(
    @repository(BlocksRepository) public blocksRepository: BlocksRepository,
  ) { }

  @get('/blocks/count')
  @response(200, {
    description: 'Blocks model count',
    content: { 'application/json': { schema: CountSchema } },
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
          items: getModelSchemaRef(Blocks, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(Blocks) filter?: Filter<Blocks>,
  ): Promise<Blocks[]> {
    return this.blocksRepository.find(filter);
  }

  @get('/blocks/{hash}')
  @response(200, {
    description: 'Blocks model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Blocks, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string('hash') hash: string
  ): Promise<Blocks> {
    let item = await this.blocksRepository.findOne({
      where: {
        hash: hash
      }
    });
    if (!item) throw new HttpErrors.NotFound();
    return item;
  }

  @get('/blocks/{height}/by-height')
  @response(200, {
    description: 'Blocks model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Blocks, { includeRelations: true }),
      },
    },
  })
  async findByIndex(
    @param.path.string('height') height: number
  ): Promise<Blocks> {
    let item = await this.blocksRepository.findOne({
      where: {
        height: height
      }
    });
    if (!item) throw new HttpErrors.NotFound();
    return item;
  }
}
