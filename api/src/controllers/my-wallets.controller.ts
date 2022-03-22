import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { Getter, inject } from '@loopback/core';
import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import { PermissionsTypes } from '../authorization/PermissionsTypes';
import { MyWallets } from '../models';
import { MyWalletsRepository } from '../repositories';
import { InfoJWT, ValueDTO } from '../types';
import { ContractProvider } from '../services';
import { Wallet } from '@bywise/web3';

export class MyWalletsController {
  constructor(
    @repository(MyWalletsRepository) public myWalletsRepository: MyWalletsRepository,
    @inject.getter(AuthenticationBindings.CURRENT_USER) public getCurrentUser: Getter<InfoJWT>,
  ) { }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.WALLET, true] })
  @post('/api/v1/my-wallets')
  @response(200, {
    description: 'MyWallets model instance',
    content: { 'application/json': { schema: getModelSchemaRef(MyWallets) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MyWallets, {
            title: 'NewMyWallets',
            exclude: ['id', 'usersId', 'address', 'created'],
            optional: ['seed']
          }),
        },
      },
    })
    myWallets: Omit<MyWallets, 'id'>,
  ): Promise<MyWallets> {
    let info = await this.getCurrentUser();
    myWallets.usersId = info.id;
    let wallet;
    if (!myWallets.seed) {
      wallet = new Wallet({ isMainnet: ContractProvider.isMainNet() });
    } else {
      wallet = new Wallet({ isMainnet: ContractProvider.isMainNet(), seed: myWallets.seed });
    }
    myWallets.seed = wallet.seed;
    myWallets.address = wallet.address;
    return this.myWalletsRepository.create(myWallets);
  }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.WALLET, false] })
  @get('/api/v1/my-wallets')
  @response(200, {
    description: 'Array of MyWallets model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(MyWallets),
        },
      },
    },
  })
  async find(): Promise<MyWallets[]> {
    let info = await this.getCurrentUser();
    try {
      return await this.myWalletsRepository.find({
        where: {
          usersId: info.id
        }
      });
    } catch (err: any) {
      console.log(err);
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.WALLET, false] })
  @get('/api/v1/my-wallets/{id}/seed')
  @response(200, {
    description: 'Seed of wallet',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ValueDTO),
      },
    },
  })
  async seed(@param.path.string('id') id: string): Promise<ValueDTO> {
    let info = await this.getCurrentUser();
    try {
      let wallet = await this.myWalletsRepository.findOne({
        where: {
          id: id,
          usersId: info.id
        }
      });
      if (!wallet) throw new Error("Wallet not found");
      return new ValueDTO({ value: wallet.seed });
    } catch (err: any) {
      console.log(err);
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.WALLET, true] })
  @del('/api/v1/my-wallets/{id}')
  @response(204, {
    description: 'MyWallets DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    let info = await this.getCurrentUser();
    let token = await this.myWalletsRepository.findOne({
      where: {
        usersId: info.id,
        id: id,
      }
    });
    if (token) {
      await this.myWalletsRepository.delete(token);
    }
  }
}
