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
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Transactions>,
  ): Promise<Transactions[]> {
    return this.slicesRepository.transactionsArray(id).find(filter);
  }

  @post('/slices/{id}/transactions', {
    responses: {
      '200': {
        description: 'Slices model instance',
        content: {'application/json': {schema: getModelSchemaRef(Transactions)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Slices.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transactions, {
            title: 'NewTransactionsInSlices',
            exclude: ['id'],
            optional: ['slicesId']
          }),
        },
      },
    }) transactions: Omit<Transactions, 'id'>,
  ): Promise<Transactions> {
    return this.slicesRepository.transactionsArray(id).create(transactions);
  }

  @patch('/slices/{id}/transactions', {
    responses: {
      '200': {
        description: 'Slices.Transactions PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transactions, {partial: true}),
        },
      },
    })
    transactions: Partial<Transactions>,
    @param.query.object('where', getWhereSchemaFor(Transactions)) where?: Where<Transactions>,
  ): Promise<Count> {
    return this.slicesRepository.transactionsArray(id).patch(transactions, where);
  }

  @del('/slices/{id}/transactions', {
    responses: {
      '200': {
        description: 'Slices.Transactions DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Transactions)) where?: Where<Transactions>,
  ): Promise<Count> {
    return this.slicesRepository.transactionsArray(id).delete(where);
  }
}
