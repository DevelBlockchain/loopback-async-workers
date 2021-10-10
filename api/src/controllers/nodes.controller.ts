import { authenticate } from "@loopback/authentication";
import { service } from '@loopback/core';
import {
  post,
  get,
  getModelSchemaRef,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import { ContractProvider, NodesProvider, WalletProvider } from '../services';
import { InfoDTO, NodeDTO } from '../types';

export class NodesController {
  constructor(
    @service(NodesProvider) private nodesProvider: NodesProvider,
    @service(ContractProvider) private contractProvider: ContractProvider,
  ) { }

  @get('/nodes/debug')
  async debug(): Promise<any> {
    try {
      return await this.nodesProvider.tryConnectNode('http://localhost:8080');
    } catch (err: any) {
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @post('/nodes/handshake', {
    security: [],
    responses: {
      '200': {
        description: 'My node',
        content: {
          'application/json': {
            schema: getModelSchemaRef(NodeDTO),
          }
        },
      },
    },
  })
  async handshake(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NodeDTO),
        },
      },
    })
    node: NodeDTO,
  ): Promise<NodeDTO> {
    try {
      return await this.nodesProvider.addNode(node);
    } catch (err: any) {
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @authenticate('basic')
  @get('/nodes/try-token')
  @response(204, {
    description: 'Token is valid',
  })
  async tryToken(): Promise<void> {
  }

  @get('/nodes/info', {
    security: [],
    responses: {
      '200': {
        description: 'Info of Node',
        content: {
          'application/json': {
            schema: getModelSchemaRef(InfoDTO),
          }
        },
      },
    },
  })
  async info(): Promise<InfoDTO> {
    let account = this.contractProvider.getAccount();
    let address = WalletProvider.encodeBWSAddress(ContractProvider.isMainNet(), false, account.address);
    return new InfoDTO({
      address,
      host: process.env.MY_HOST,
      version: '1',
      timestamp: (new Date()).toISOString(),
      isFullNode: true,
      nodesLimit: this.nodesProvider.getNodeLimit(),
      nodes: this.nodesProvider.getNodes(),
    });
  }
}
