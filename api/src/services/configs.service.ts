import { injectable, BindingScope, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { Types, Variable } from '../compiler/vm/data';
import { Configs } from '../models';
import { ConfigsRepository } from '../repositories';
import { WalletProvider } from './wallet.service';

const defaultConfigs: Configs[] = [
  new Configs({ name: 'executeLimit', value: '100000', type: 'number' }),
  new Configs({ name: 'adminAddress', value: WalletProvider.ZERO_ADDRESS, type: 'address' }),
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