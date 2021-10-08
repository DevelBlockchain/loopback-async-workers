import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Slices,
  Transactions,
} from '../models';
import {SlicesRepository} from '../repositories';

export class SlicesTransactionsController {
  constructor(
    @repository(SlicesRepository) protected slicesRepository: SlicesRepository,
  ) { }

  @get('/slices/{id}/transactions', {
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
    @param.path.string('id') id: string
  ): Promise<Transactions[]> {
    return this.slicesRepository.transactionsArray(id).find();
  }
}
