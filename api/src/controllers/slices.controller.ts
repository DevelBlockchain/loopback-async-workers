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
import {Slices} from '../models';
import {SlicesRepository} from '../repositories';

export class SlicesController {
  constructor(
    @repository(SlicesRepository)
    public slicesRepository : SlicesRepository,
  ) {}

  @get('/slices/count')
  @response(200, {
    description: 'Slices model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Slices) where?: Where<Slices>,
  ): Promise<Count> {
    return this.slicesRepository.count(where);
  }

  @get('/slices')
  @response(200, {
    description: 'Array of Slices model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Slices),
        },
      },
    },
  })
  async find(
    @param.filter(Slices) filter?: Filter<Slices>,
  ): Promise<Slices[]> {
    return this.slicesRepository.find(filter);
  }

  @get('/slices/{hash}')
  @response(200, {
    description: 'Slices model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Slices),
      },
    },
  })
  async findById(
    @param.path.string('hash') hash: string,
  ): Promise<Slices> {
    let value = await this.slicesRepository.findOne({ where: { hash } });
    if (!value) {
      throw new HttpErrors.NotFound();
    }
    return value;
  }
}
