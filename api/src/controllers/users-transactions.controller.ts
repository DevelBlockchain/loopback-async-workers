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
import { MyWallets, Transactions, Wallets } from '../models';
import { MyWalletsRepository, TransactionsRepository } from '../repositories';
import { InfoJWT, TransactionsDTO, ValueDTO } from '../types';
import { ethers } from "ethers";
import { ContractProvider, NodesProvider, TransactionsProvider, WalletProvider } from '../services';
import { ConfigProvider } from '../services/configs.service';
import { BywiseAPI } from '../utils/bywise-api';
import { sha256, base16Decode, base16Encode } from '@waves/ts-lib-crypto';

const getHashFromTransaction = (tx: TransactionsDTO) => {
  let version = '1';
  let bytes = '';
  bytes += Buffer.from(version, 'utf-8').toString('hex');
  bytes += Buffer.from(tx.from, 'utf-8').toString('hex');
  bytes += Buffer.from(tx.to, 'utf-8').toString('hex');
  bytes += Buffer.from(tx.amount, 'utf-8').toString('hex');
  bytes += Buffer.from(tx.fee, 'utf-8').toString('hex');
  bytes += Buffer.from(tx.type, 'utf-8').toString('hex');
  bytes += Buffer.from(tx.data, 'utf-8').toString('hex');
  if (tx.foreignKeys) {
    tx.foreignKeys.forEach(key => {
      bytes += key;
    })
  }
  bytes += Buffer.from(tx.created, 'utf-8').toString('hex');
  bytes = base16Encode(sha256(base16Decode(bytes))).substring(2).toLowerCase();
  return bytes;
}
const signTransaction = async (seed: string, tx: TransactionsDTO) => {
  tx.hash = getHashFromTransaction(tx);
  let account = ethers.Wallet.fromMnemonic(seed);
  return (await account.signMessage(Buffer.from(tx.hash, 'hex')));
}

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
  async simulateFee(
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
      tx.fee = await this.transactionsProvider.simulateFee(tx);
      tx.sign = await signTransaction(wallet.seed, tx);

      let newTx = await this.transactionsProvider.saveTransaction(tx);
      let nodes = this.nodesProvider.getNodes();
      for (let i = 0; i < nodes.length; i++) {
        BywiseAPI.publishNewTransaction(nodes[i], tx);
      }
      return newTx;
    } catch (err: any) {
      throw new HttpErrors.BadRequest(err.message);
    }
  }
}
