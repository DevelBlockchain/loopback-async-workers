import { injectable, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { Types, Variable } from '../compiler/vm/data';
import { Configs } from '../models';
import { ConfigsRepository } from '../repositories';

@injectable({ scope: BindingScope.TRANSIENT })
export class ConfigProvider {

  constructor(
    @repository(ConfigsRepository) public configsRepository: ConfigsRepository,
  ) {
  }

  async getAll(): Promise<Configs[]> {
    let configs: Configs[] = await this.configsRepository.find();
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