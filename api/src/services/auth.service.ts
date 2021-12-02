import {injectable,BindingScope} from '@loopback/core';
import { promisify } from 'util';
import { InfoJWT, TokenWithUserDTO } from '../types';

const jwt = require('jsonwebtoken');
const twofactor = require("node-2fa");
const bcryptjs = require('bcryptjs');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);
const TIME_LIMIT = { expiresIn: 3600000 };
const sleep = async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms + 10);
  });
}

@injectable({scope: BindingScope.TRANSIENT})
export class AuthProvider {
  constructor() {}

  async createToken(user: any): Promise<TokenWithUserDTO> {
    let infoJWT = new InfoJWT({
      id: user.id,
      role: user.roles,
      permissions: user.roles.permissions ? user.roles.permissions : [],
    });
    infoJWT.role.permissions = [];
    let jwt = await signAsync({ ...infoJWT }, process.env.JWT_SECRET_VALUE, TIME_LIMIT);
    return new TokenWithUserDTO({
      token: jwt,
      infoUser: infoJWT,
    });
  }

  async checkToken(jwt: string): Promise<InfoJWT> {
    let infoJWT: InfoJWT = await verifyAsync(jwt, process.env.JWT_SECRET_VALUE);
    return infoJWT;
  }

  cryptPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, 4);
  }

  checkPassword(password: string, userPassword: string): Promise<boolean> {
    return bcryptjs.compare(password, userPassword);
  }

  generateTwoFactorSecret(username: string) {
    return twofactor.generateSecret({ name: "Bywise Node", account: username }).secret;
  }

  verifyTwoFactor(secret: string, code: string) {
    let timeframe = twofactor.verifyToken(secret, code);
    return timeframe !== null && timeframe.delta === 0;
  }

}
