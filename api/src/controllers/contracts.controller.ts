import { service } from '@loopback/core';
import { repository } from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  response,
} from '@loopback/rest';
import { Environment } from '../compiler/vm/data';
import { ContractsEnvRepository } from '../repositories';

export class ContractsController {
  constructor(
    @repository(ContractsEnvRepository) public contractsEnvRepository: ContractsEnvRepository,
  ) { }

  @get('/api/v1/contracts/{address}/abi')
  @response(200, {
    description: 'Contract ABI',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Environment),
      },
    },
  })
  async getABI(
    @param.path.string('address') address: string,
  ): Promise<Environment> {
    let contractEnv = await this.contractsEnvRepository.findOne({ where: { address } });
    if (!contractEnv) {
      throw new HttpErrors.NotFound();
    }
    return Environment.fromJSON(JSON.parse(contractEnv.env));
  }
}
