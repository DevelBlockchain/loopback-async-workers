import { injectable, BindingScope, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { base16Decode, base16Encode, sha256 } from '@waves/ts-lib-crypto';
import { ethers } from 'ethers';
import { WalletProvider } from '.';
import { Types, Variable } from '../compiler/vm/data';
import { Configs } from '../models';
import { ConfigsRepository } from '../repositories';
import { BlockDTO, SliceDTO } from '../types/transactions.type';
import { numberToHex } from '../utils/helper';
import { ContractProvider } from './contract.service';

const defaultConfigs: Configs[] = [
  new Configs({ name: 'executeLimit', value: '100000', type: 'number' }),
  new Configs({ name: 'adminAddress', value: '', type: 'address' }),
  new Configs({ name: 'fee', value: '0', type: 'string' }),
]

@injectable({ scope: BindingScope.TRANSIENT })
export class ConfigProvider {

  constructor(
    @repository(ConfigsRepository) public configsRepository: ConfigsRepository,
  ) {
  }

  async getAll(): Promise<Configs[]> {
    let configs: Configs[] = await this.configsRepository.find();
    defaultConfigs.forEach(cfg => {
      let found = false;
      configs.forEach(savedCfg => {
        if (savedCfg.name === cfg.name) {
          found = true;
        }
      })
      if (!found) {
        configs.push(cfg);
      }
    })
    return configs;
  }

  async getByName(name: string): Promise<Variable> {
    let configs = await this.getAll();
    for (let i = 0; i < configs.length; i++) {
      let cfg = configs[i];
      if (cfg.name === name) {
        let type = Types.getType(cfg.type);
        if(!type) {
          throw new Error(`invalid type of ${name} - ${cfg.type}`);
        }
        return new Variable(type, cfg.value);
      }
    }
    throw new Error(`config ${name} not found`);
  }
}