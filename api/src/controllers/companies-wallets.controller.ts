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
  Companies,
  Wallets,
} from '../models';
import {CompaniesRepository} from '../repositories';

export class CompaniesWalletsController {
  constructor(
    @repository(CompaniesRepository)
    public companiesRepository: CompaniesRepository,
  ) { }

  @get('/companies/{address}/wallets', {
    responses: {
      '200': {
        description: 'Wallets belonging to Companies',
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
    let item = await this.companiesRepository.findOne({
      where: {
        address: address
      }
    });
    if(!item) throw new HttpErrors.NotFound();
    return this.companiesRepository.wallets(item.id);
  }
}
