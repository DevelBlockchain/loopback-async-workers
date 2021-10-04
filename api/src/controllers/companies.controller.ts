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
import {Companies} from '../models';
import {CompaniesRepository} from '../repositories';

export class CompaniesController {
  constructor(
    @repository(CompaniesRepository)
    public companiesRepository : CompaniesRepository,
  ) {}

  @get('/companies/count')
  @response(200, {
    description: 'Companies model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Companies) where?: Where<Companies>,
  ): Promise<Count> {
    return this.companiesRepository.count(where);
  }

  @get('/companies')
  @response(200, {
    description: 'Array of Companies model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Companies, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Companies) filter?: Filter<Companies>,
  ): Promise<Companies[]> {
    return this.companiesRepository.find(filter);
  }

  @get('/companies/{address}')
  @response(200, {
    description: 'Companies model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Companies, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('address') address: string,
  ): Promise<Companies> {
    let item = await this.companiesRepository.findOne({
      where: {
        address: address
      }
    });
    if(!item) throw new HttpErrors.NotFound();
    return item;
  }

}
