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
  HttpErrors,
} from '@loopback/rest';
import { Blocks } from '../models';
import { BlocksRepository } from '../repositories';
import { BlockDTO, PackageDTO } from '../types';

export class BlocksController {
  constructor(
    @repository(BlocksRepository)
    public blocksRepository: BlocksRepository,
  ) { }

  @post('/blocks')
  @response(204, {
    description: 'Created block',
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PackageDTO),
        },
      },
    })
    packageDTO: PackageDTO,
  ): Promise<void> {
    //return this.blocksRepository.create(blocks);
  }

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
          items: getModelSchemaRef(Blocks),
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
        schema: getModelSchemaRef(Blocks),
      },
    },
  })
  async findById(
    @param.path.string('hash') hash: string,
  ): Promise<Blocks> {
    let value = await this.blocksRepository.findOne({ where: { hash } });
    if (!value) {
      throw new HttpErrors.NotFound();
    }
    return value;
  }
}
