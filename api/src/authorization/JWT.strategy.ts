import {
  AuthenticationBindings,
  AuthenticationMetadata,
  AuthenticationStrategy
} from '@loopback/authentication';
import { Getter, inject, service } from '@loopback/core';
import { HttpErrors } from '@loopback/rest';
import { NodesProvider } from '../services';

export class JWTStrategy implements AuthenticationStrategy {
  name: string = 'basic';

  constructor(
    @inject.getter(AuthenticationBindings.METADATA) readonly getMetaData: Getter<AuthenticationMetadata>,
    @service(NodesProvider) private nodesProvider: NodesProvider,
  ) { }

  async authenticate(request: any): Promise<any | undefined> {
    const token: string = this.extractCredentials(request);

    if (!this.nodesProvider.isValidToken(token)) {
      throw new HttpErrors.Forbidden("Don't have permission");
    }
  }

  extractCredentials(request: any): string {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }
    const authHeaderValue = request.headers.authorization;

    if (!authHeaderValue.startsWith('Bearer')) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is invalid`,
      );
    }
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2)
      throw new HttpErrors.Unauthorized(
        `Authorization header value has too many parts. It must follow the pattern: 'Bearer xxxxxxx' where xxxxxxxx is a valid token.`,
      );
    const token = parts[1];
    return token;
  }
}