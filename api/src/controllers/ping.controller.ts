import { inject, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import {
  Request,
  RestBindings,
  get,
  response,
  ResponseObject,
  post,
  requestBody,
  getModelSchemaRef,
} from '@loopback/rest';
import Compiler from '../compiler/vm/compiler';
import BywiseVirtualMachine from '../compiler/vm/virtual-machine';
import { TransactionsRepository } from '../repositories';
import { ContractProvider, WalletProvider } from '../services';
import { TransactionsProvider } from '../services/transactions.service';
import { VirtualMachineProvider } from '../services/virtual-machine.service';
import { TransactionsDTO, ValueDTO } from '../types';

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

  @post('/api/v1/compiler')
  async compiler(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ValueDTO),
        },
      },
    })
    valueDTO: ValueDTO,
  ): Promise<ValueDTO> {
    let compiler = new Compiler(BywiseVirtualMachine.getDictionary());
    let isMainnet = ContractProvider.isMainNet();
    return new ValueDTO({
      value: JSON.stringify(compiler.compilerASM(isMainnet, valueDTO.value).toJSON())
    });
  }

  @post('/api/v1/debug-transaction')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TransactionsDTO, {
            exclude: ['created', 'from', 'hash', 'sign', 'validator', 'validatorSign', 'version']
          }),
        },
      },
    })
    txInput: TransactionsDTO,
  ): Promise<any> {
    let account = this.contractProvider.getAccount();
    let address = WalletProvider.encodeBWSAddress(ContractProvider.isMainNet(), false, account.address);
    let tx = await this.transactionsProvider.createNewTransaction(txInput.to, txInput.amount, txInput.fee, txInput.type, txInput.data);
    await this.transactionsProvider.saveTransaction(tx);
    return tx;
  }
}
