import { service } from '@loopback/core';
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
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import { Transactions } from '../models';
import { TransactionsRepository } from '../repositories';
import { NodesProvider, TransactionsProvider } from '../services';
import { TransactionsDTO, ValueDTO } from '../types';
import { BywiseAPI } from '../utils/bywise-api';

export class TransactionsController {
  constructor(
    @repository(TransactionsRepository) public transactionsRepository: TransactionsRepository,
    @service(TransactionsProvider) private transactionsProvider: TransactionsProvider,
    @service(NodesProvider) private nodesProvider: NodesProvider,
  ) { }

  @post('/api/v1/transactions/fee')
  @response(200, {
    description: 'Fee of transaction',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ValueDTO),
      },
    },
  })
  async simulateFee(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TransactionsDTO),
        },
      },
    })
    tx: TransactionsDTO,
  ): Promise<ValueDTO> {
    try {
      let fee = await this.transactionsProvider.simulateFee(tx);
      return new ValueDTO({ value: fee })
    } catch (err: any) {
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @post('/api/v1/transactions')
  @response(204, {
    description: 'Accepted transaction',
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TransactionsDTO),
        },
      },
    })
    tx: TransactionsDTO,
  ): Promise<void> {
    try {
      await this.transactionsProvider.saveTransaction(tx);
      let nodes = this.nodesProvider.getNodes();
      for (let i = 0; i < nodes.length; i++) {
        BywiseAPI.publishNewTransaction(nodes[i], tx);
      }
    } catch (err: any) {
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @get('/api/v1/transactions/count')
  @response(200, {
    description: 'Transactions model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Transactions) where?: Where<Transactions>,
  ): Promise<Count> {
    return this.transactionsRepository.count(where);
  }

  @get('/api/v1/transactions')
  @response(200, {
    description: 'Array of Transactions model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Transactions),
        },
      },
    },
  })
  async find(
    @param.filter(Transactions) filter?: Filter<Transactions>,
  ): Promise<Transactions[]> {
    return this.transactionsRepository.find(filter);
  }

  @get('/api/v1/transactions/{hash}')
  @response(200, {
    description: 'Transactions model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Transactions),
      },
    },
  })
  async findById(
    @param.path.string('hash') hash: string
  ): Promise<Transactions> {
    let value = await this.transactionsRepository.findOne({ where: { hash } });
    if (!value) {
      throw new HttpErrors.NotFound();
    }
    return value;
  }
}
