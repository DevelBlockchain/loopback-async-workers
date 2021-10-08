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
import {Slices} from '../models';
import {SlicesRepository} from '../repositories';

export class SlicesController {
  constructor(
    @repository(SlicesRepository)
    public slicesRepository : SlicesRepository,
  ) {}

  @post('/slices')
  @response(200, {
    description: 'Slices model instance',
    content: {'application/json': {schema: getModelSchemaRef(Slices)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Slices, {
            title: 'NewSlices',
            exclude: ['id'],
          }),
        },
      },
    })
    slices: Omit<Slices, 'id'>,
  ): Promise<Slices> {
    return this.slicesRepository.create(slices);
  }

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
          items: getModelSchemaRef(Slices, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Slices) filter?: Filter<Slices>,
  ): Promise<Slices[]> {
    return this.slicesRepository.find(filter);
  }

  @patch('/slices')
  @response(200, {
    description: 'Slices PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Slices, {partial: true}),
        },
      },
    })
    slices: Slices,
    @param.where(Slices) where?: Where<Slices>,
  ): Promise<Count> {
    return this.slicesRepository.updateAll(slices, where);
  }

  @get('/slices/{id}')
  @response(200, {
    description: 'Slices model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Slices, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Slices, {exclude: 'where'}) filter?: FilterExcludingWhere<Slices>
  ): Promise<Slices> {
    return this.slicesRepository.findById(id, filter);
  }

  @patch('/slices/{id}')
  @response(204, {
    description: 'Slices PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Slices, {partial: true}),
        },
      },
    })
    slices: Slices,
  ): Promise<void> {
    await this.slicesRepository.updateById(id, slices);
  }

  @put('/slices/{id}')
  @response(204, {
    description: 'Slices PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() slices: Slices,
  ): Promise<void> {
    await this.slicesRepository.replaceById(id, slices);
  }

  @del('/slices/{id}')
  @response(204, {
    description: 'Slices DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.slicesRepository.deleteById(id);
  }
}
