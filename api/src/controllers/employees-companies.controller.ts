import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
  HttpErrors,
} from '@loopback/rest';
import {
  Employees,
  Companies,
} from '../models';
import {EmployeesRepository} from '../repositories';

export class EmployeesCompaniesController {
  constructor(
    @repository(EmployeesRepository)
    public employeesRepository: EmployeesRepository,
  ) { }

  @get('/employees/{address}/companies', {
    responses: {
      '200': {
        description: 'Companies belonging to Employees',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Companies)},
          },
        },
      },
    },
  })
  async getCompanies(
    @param.path.string('address') address: string,
  ): Promise<Companies> {
    let item = await this.employeesRepository.findOne({
      where: {
        address: address
      }
    });
    if(!item) throw new HttpErrors.NotFound();
    return this.employeesRepository.companies(item.id);
  }
}
