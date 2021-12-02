import {
  AuthenticationBindings,
  AuthenticationMetadata,
  AuthenticationStrategy
} from '@loopback/authentication';
import { Getter, inject, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { Permissions } from '../models';
import { AccessTokensRepository } from '../repositories';
import { AuthProvider, NodesProvider } from '../services';
import { InfoJWT } from '../types';

export class JWTStrategy implements AuthenticationStrategy {
  name: string = 'basic';

  constructor(
    @inject.getter(AuthenticationBindings.METADATA) readonly getMetaData: Getter<AuthenticationMetadata>,
    @service(NodesProvider) private nodesProvider: NodesProvider,
    @service(AuthProvider) private authProvider: AuthProvider,
    @repository(AccessTokensRepository) public accessTokensRepository: AccessTokensRepository,
  ) { }

  async authenticate(request: any): Promise<any | undefined> {
    const credential = this.extractCredentials(request);
    let userInfo: InfoJWT;
    if (credential.type === 'Bearer') {
      try {
        userInfo = await this.authProvider.checkToken(credential.token);
      } catch (err) {
        throw new HttpErrors.Unauthorized('Make sign in');
      }
    } else if (credential.type === 'Basic') {
      try {
        let token: any = await this.accessTokensRepository.findOne({
          where: {
            token: credential.token
          },
          include: [{
            relation: 'roles',
            scope: {
              include: ['permissions']
            }
          }]
        });
        if (!token) {
          throw new HttpErrors.Unauthorized('Basic token not found');
        } else {
          userInfo = new InfoJWT({
            id: token.usersId,
            role: token.roles,
            permissions: token.roles.permissions ? token.roles.permissions : [],
          });
          userInfo.role.permissions = [];
        }
      } catch (err) {
        throw new HttpErrors.Unauthorized('Invalid basic token');
      }
    } else if (credential.type === 'Node') {
      let userInfoTmp = await this.nodesProvider.isValidToken(credential.token);
      if (userInfoTmp === null) {
        throw new HttpErrors.Forbidden("Don't have permission");
      } else {
        userInfo = userInfoTmp;
      }
    } else {
      throw new HttpErrors.Forbidden(`Authorization header is invalid "${credential.type}"`);
    }
    let metaData: any = await this.getMetaData();
    for (let i = 0; i < metaData.length; i++) {
      const data = metaData[i];
      if (data.strategy === this.name && data.options) {
        if (data.options.length === 2) {
          let isAllow = false;
          let [name, write] = data.options;
          userInfo.permissions.forEach(perm => {
            if ((name === perm.name || perm.name === 'admin') && (write && perm.write || write !== true)) {
              isAllow = true;
            }
          });
          if (!isAllow) {
            throw new HttpErrors.Forbidden("Don't have permission");
          }
        } else {
          throw new HttpErrors.InternalServerError('Invalid metadata');
        }
      }
    }
    return userInfo;
  }

  extractCredentials(request: any): { type: string, token: string } {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }
    const authHeaderValue = request.headers.authorization;

    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2) {
      throw new HttpErrors.Unauthorized(
        `Authorization header value has too many parts. It must follow the pattern: 'Bearer xxxxxxx' where xxxxxxxx is a valid token.`,
      );
    }
    const type = parts[0];
    const token = parts[1];
    if (type !== 'Bearer' && type !== 'Basic' && type !== 'Node') {
      throw new HttpErrors.Unauthorized(
        `Authorization header is invalid`,
      );
    }
    return { type, token };
  }
}