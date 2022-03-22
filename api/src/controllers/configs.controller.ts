import { service } from '@loopback/core';
import {
  get,
  getModelSchemaRef,
  response,
} from '@loopback/rest';
import { Configs } from '../models';
import { ConfigProvider } from '../services/configs.service';

export class ConfigsController {
  constructor(
    @service(ConfigProvider) private configProvider: ConfigProvider
  ) { }

  @get('/api/v1/configs')
  @response(200, {
    description: 'Array of Configs model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Configs, { exclude: ['id'] }),
        },
      },
    },
  })
  async find(): Promise<Configs[]> {
    return this.configProvider.getAll();
  }
}