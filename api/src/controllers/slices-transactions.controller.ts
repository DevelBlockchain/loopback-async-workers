import {
  repository,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
} from '@loopback/rest';
import {
  Transactions,
} from '../models';
import {SlicesRepository} from '../repositories';

export class SlicesTransactionsController {
  constructor(
    @repository(SlicesRepository) protected slicesRepository: SlicesRepository,
  ) { }

  @get('/api/v1/slices/{hash}/transactions', {
    responses: {
      '200': {
        description: 'Array of Slices has many Transactions',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Transactions)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('hash') hash: string
  ): Promise<Transactions[]> {
    let value = await this.slicesRepository.findOne({ where: { hash } });
    if (!value) {
      throw new HttpErrors.NotFound();
    }
    return this.slicesRepository.transactionsArray(value.id).find();
  }
}