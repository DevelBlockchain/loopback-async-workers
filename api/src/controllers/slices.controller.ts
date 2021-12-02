import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import { Slices } from '../models';
import { SlicesRepository } from '../repositories';
import { BlocksProvider, NodesProvider, SlicesProvider } from '../services';
import { SliceDTO } from '../types';
import { BywiseAPI } from '../utils/bywise-api';

export class SlicesController {
  constructor(
    @repository(SlicesRepository) public slicesRepository: SlicesRepository,
    @service(BlocksProvider) private blocksProvider: BlocksProvider,
    @service(SlicesProvider) private slicesProvider: SlicesProvider,
    @service(NodesProvider) private nodesProvider: NodesProvider,
  ) { }

  @post('/api/v1/slices')
  @response(204, {
    description: 'Accepted Slices',
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SliceDTO),
        },
      },
    })
    slice: SliceDTO,
  ): Promise<void> {
    let lastHash = (await this.blocksProvider.getLastHashAndHeight()).lastHash;
    let added = await this.slicesProvider.addSlice(lastHash, slice);
    if (added) {
      let nodes = this.nodesProvider.getNodes();
      for (let i = 0; i < nodes.length; i++) {
        BywiseAPI.publishNewSlice(nodes[i], slice);
      }
    }
  }

  @get('/api/v1/slices/count')
  @response(200, {
    description: 'Slices model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Slices) where?: Where<Slices>,
  ): Promise<Count> {
    return this.slicesRepository.count(where);
  }

  @get('/api/v1/slices')
  @response(200, {
    description: 'Array of Slices model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Slices),
        },
      },
    },
  })
  async find(
    @param.filter(Slices) filter?: Filter<Slices>,
  ): Promise<Slices[]> {
    return this.slicesRepository.find(filter);
  }

  @get('/api/v1/slices/{hash}')
  @response(200, {
    description: 'Slices model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Slices),
      },
    },
  })
  async findById(
    @param.path.string('hash') hash: string,
  ): Promise<Slices> {
    let value = await this.slicesRepository.findOne({ where: { hash } });
    if (!value) {
      throw new HttpErrors.NotFound();
    }
    return value;
  }
}
