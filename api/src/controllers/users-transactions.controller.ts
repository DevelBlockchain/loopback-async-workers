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
import { InfoJWT, SimulateSliceDTO, TxModelDTO, TxSimpleModelDTO } from '../types';
import { NodesProvider, TransactionsProvider } from '../services';
import { ConfigProvider } from '../services/configs.service';
import { BywiseAPI } from '../utils/bywise-api';
import { Tx, Wallet } from '@bywise/web3';

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
          schema: getModelSchemaRef(TxSimpleModelDTO),
        },
      },
    })
    txSimpleModelDTO: TxSimpleModelDTO,
  ): Promise<Transactions> {
    let info = await this.getCurrentUser();
    try {
      let tx = new Tx({
        from: [txSimpleModelDTO.from],
        to: [txSimpleModelDTO.to],
        amount: [txSimpleModelDTO.amount],
        foreignKeys: txSimpleModelDTO.foreignKeys,
        type: txSimpleModelDTO.type,
        data: txSimpleModelDTO.data,
      });
      let myWallets = [];
      for await (const from of tx.from) {
        let wallet = await this.myWalletsRepository.findOne({
          limit: 1,
          where: {
            usersId: info.id,
            address: from,
          }
        });
        if (!wallet) throw new Error(`Account ${tx.from} not found`);
        myWallets.push(wallet);
      }
      tx.version = '1';
      tx.created = new Date().toISOString();
      let ctx = new SimulateSliceDTO();
      ctx.simulate = true;
      tx.fee = (await this.transactionsProvider.simulateTransaction(tx, ctx)).fee;
      tx.hash = tx.toHash();
      tx.sign = [];
      for await (const myWallet of myWallets) {
        let wallet = new Wallet({ seed: myWallet.seed });
        let sign = await wallet.signHash(tx.hash);
        tx.sign.push(sign);
      }
      console.log(tx)
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
