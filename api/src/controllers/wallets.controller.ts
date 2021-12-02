import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Wallets} from '../models';
import {WalletsRepository} from '../repositories';

export class WalletsController {
  constructor(
    @repository(WalletsRepository)
    public walletsRepository : WalletsRepository,
  ) {}

  @get('/api/v1/wallets/count')
  @response(200, {
    description: 'Wallets model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Wallets) where?: Where<Wallets>,
  ): Promise<Count> {
    return this.walletsRepository.count(where);
  }

  @get('/api/v1/wallets')
  @response(200, {
    description: 'Array of Wallets model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Wallets),
        },
      },
    },
  })
  async find(
    @param.filter(Wallets) filter?: Filter<Wallets>,
  ): Promise<Wallets[]> {
    return this.walletsRepository.find(filter);
  }

  @get('/api/v1/wallets/{address}')
  @response(200, {
    description: 'Wallets model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Wallets),
      },
    },
  })
  async findById(
    @param.path.string('address') address: string
  ): Promise<Wallets> {
    let value = await this.walletsRepository.findOne({ where: { address } });
    if (!value) {
      throw new HttpErrors.NotFound();
    }
    return value;
  }
}
