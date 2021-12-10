import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { Getter, inject, service } from '@loopback/core';
import {
  repository,
} from '@loopback/repository';
import {
  post,
  getModelSchemaRef,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import { PermissionsTypes } from '../authorization/PermissionsTypes';
import { Transactions } from '../models';
import { MyWalletsRepository, TransactionsRepository } from '../repositories';
import { InfoJWT, SimulateSliceDTO, TransactionsDTO } from '../types';
import { NodesProvider, TransactionsProvider } from '../services';
import { ConfigProvider } from '../services/configs.service';
import { BywiseAPI } from '../utils/bywise-api';
import { signTransaction } from '../utils/helper';

export class UsersTransactionsController {
  constructor(
    @repository(MyWalletsRepository) public myWalletsRepository: MyWalletsRepository,
    @repository(TransactionsRepository) public transactionsRepository: TransactionsRepository,
    @service(TransactionsProvider) private transactionsProvider: TransactionsProvider,
    @service(NodesProvider) private nodesProvider: NodesProvider,
    @service(ConfigProvider) private configProvider: ConfigProvider,
    @inject.getter(AuthenticationBindings.CURRENT_USER) public getCurrentUser: Getter<InfoJWT>,
  ) { }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.WALLET, true] })
  @post('/api/v1/users-transactions')
  @response(200, {
    description: 'Accepted transaction',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Transactions),
      },
    },
  })
  async publish(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TransactionsDTO, {
            exclude: ['created', 'fee', 'hash', 'tag', 'validator', 'validatorSign', 'version', 'sign']
          }),
        },
      },
    })
    tx: TransactionsDTO,
  ): Promise<Transactions> {
    let info = await this.getCurrentUser();
    try {
      let wallet = await this.myWalletsRepository.findOne({
        limit: 1,
        where: {
          usersId: info.id,
          address: tx.from,
        }
      });
      if (!wallet) throw new Error(`Account ${tx.from} not found`);
      (await this.configProvider.getAll()).forEach(config => {
        if (config.name == 'validator') {
          tx.validator = config.value
        }
      })
      tx.version = '1';
      tx.created = new Date().toISOString();
      let ctx = new SimulateSliceDTO();
      ctx.simulate = true;
      tx.fee = (await this.transactionsProvider.simulateTransaction(tx, ctx)).fee;
      tx.sign = await signTransaction(wallet.seed, tx);

      let newTx = await this.transactionsProvider.saveTransaction(tx);
      let nodes = this.nodesProvider.getNodes();
      for (let i = 0; i < nodes.length; i++) {
        BywiseAPI.publishNewTransaction(nodes[i], tx);
      }
      return newTx;
    } catch (err: any) {
      console.error(err);
      throw new HttpErrors.BadRequest(err.message);
    }
  }
}
