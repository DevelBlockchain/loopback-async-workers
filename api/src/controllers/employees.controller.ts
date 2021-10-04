import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Employees} from '../models';
import {EmployeesRepository} from '../repositories';

export class EmployeesController {
  constructor(
    @repository(EmployeesRepository)
    public employeesRepository : EmployeesRepository,
  ) {}

  @get('/employees/count')
  @response(200, {
    description: 'Employees model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Employees) where?: Where<Employees>,
  ): Promise<Count> {
    return this.employeesRepository.count(where);
  }

  @get('/employees')
  @response(200, {
    description: 'Array of Employees model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Employees, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Employees) filter?: Filter<Employees>,
  ): Promise<Employees[]> {
    return this.employeesRepository.find(filter);
  }

  @get('/employees/{address}')
  @response(200, {
    description: 'Employees model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Employees, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('address') address: string,
  ): Promise<Employees> {
    let item = await this.employeesRepository.findOne({
      where: {
        address: address
      }
    });
    if(!item) throw new HttpErrors.NotFound();
    return item;
  }
}
