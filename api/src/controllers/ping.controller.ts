import { inject, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import {
  Request,
  RestBindings,
  get,
  response,
  ResponseObject,
  post,
} from '@loopback/rest';
import { TransactionsType } from '../models';
import { TransactionsRepository } from '../repositories';
import { ContractProvider, WalletProvider } from '../services';
import { TransactionsProvider } from '../services/transactions.service';

const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: { type: 'string' },
          date: { type: 'string' },
          url: { type: 'string' },
          headers: {
            type: 'object',
            properties: {
              'Content-Type': { type: 'string' },
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

export class PingController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @service(ContractProvider) private contractProvider: ContractProvider,
    @service(TransactionsProvider) private transactionsProvider: TransactionsProvider,
    @repository(TransactionsRepository) private transactionsRepository: TransactionsRepository,
  ) { }

  @get('/ping')
  @response(200, PING_RESPONSE)
  ping(): object {
    return {
      greeting: 'Hello World',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers)
    };
  }

  @post('/debug-transaction')
  async create(): Promise<any> {
    let account = this.contractProvider.getAccount();
    let address = WalletProvider.encodeBWSAddress(ContractProvider.isMainNet(), false, account.address);
    let tx = await this.transactionsProvider.createNewTransaction(address, '0', '0', TransactionsType.TX_STRING, 'Think outside the block');
    return tx;
  }
}
