import { inject, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import {
  Request,
  RestBindings,
  get,
  response,
  ResponseObject,
} from '@loopback/rest';
import { TransactionsRepository } from '../repositories';
import { ContractProvider } from '../services';
import { TransactionsProvider } from '../services/transactions.service';
import { VirtualMachineProvider } from '../services/virtual-machine.service';

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
    @service(VirtualMachineProvider) private virtualMachineProvider: VirtualMachineProvider,
    @repository(TransactionsRepository) private transactionsRepository: TransactionsRepository,
  ) { }

  @get('/api/v1/ping')
  @response(200, PING_RESPONSE)
  ping(): object {
    return {
      greeting: 'Hello World',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers)
    };
  }
}
