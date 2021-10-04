import {BindingScope, inject, injectable} from '@loopback/core';
import {LoggingBindings, WinstonLogger} from '@loopback/logging';
import AbortController from 'abort-controller';
import {BscScanDTO} from '../types';
import {ContractProvider} from './contract.service';

const fetch = require("node-fetch");

@injectable({scope: BindingScope.TRANSIENT})
export class BscScanProvider {

  constructor(
    @inject(LoggingBindings.WINSTON_LOGGER) private logger: WinstonLogger,
  ) { }

  async getLastTransactions(address: string): Promise<BscScanDTO> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => {controller.abort();},
      30000,
    );
    try {
      let url = ``;
      if (ContractProvider.isMainNet()) {
        url += `https://api.bscscan.com/api?module=account&action=tokentx`;
      } else {
        url += `https://api-testnet.bscscan.com/api?module=account&action=tokentx`;
      }
      url += `&sort=desc&page=1&offset=100`;
      url += `&address=${address}`;
      url += `&contractaddress=${process.env.CONTRACT_ID}`;
      url += `&apikey=${process.env.BSCSCAN_API}`;
      const req = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }).finally(() => {
        clearTimeout(timeout);
      });
      if (!req.ok) {
        let jsonError = await req.json();
        throw 'api error: ' + jsonError.msg;
      }
      let json = await req.json();
      return json;
    } catch (err: any) {
      throw new Error('api error: ' + err.message);
    }
  }
}
