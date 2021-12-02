import { authenticate } from '@loopback/authentication';
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import { PermissionsTypes } from '../authorization/PermissionsTypes';
import {
  MyWallets,
  Users,
} from '../models';
import {MyWalletsRepository} from '../repositories';

export class MyWalletsUsersController {
  constructor(
    @repository(MyWalletsRepository)
    public myWalletsRepository: MyWalletsRepository,
  ) { }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.ADMIN, false] })
  @get('/api/v1/my-wallets/{id}/users', {
    responses: {
      '200': {
        description: 'Users belonging to MyWallets',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Users)},
          },
        },
      },
    },
  })
  async getUsers(
    @param.path.string('id') id: typeof MyWallets.prototype.id,
  ): Promise<Users> {
    return this.myWalletsRepository.users(id);
  }
}
