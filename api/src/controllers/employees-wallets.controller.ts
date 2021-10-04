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
  Wallets,
} from '../models';
import {EmployeesRepository} from '../repositories';

export class EmployeesWalletsController {
  constructor(
    @repository(EmployeesRepository)
    public employeesRepository: EmployeesRepository,
  ) { }

  @get('/employees/{address}/wallets', {
    responses: {
      '200': {
        description: 'Wallets belonging to Employees',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Wallets)},
          },
        },
      },
    },
  })
  async getWallets(
    @param.path.string('address') address: string,
  ): Promise<Wallets> {
    let item = await this.employeesRepository.findOne({
      where: {
        address: address
      }
    });
    if(!item) throw new HttpErrors.NotFound();
    return this.employeesRepository.wallets(item.id);
  }
}
