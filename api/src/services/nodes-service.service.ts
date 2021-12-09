import { injectable, BindingScope, Provider, service } from '@loopback/core';
import { ContractProvider, WalletProvider } from '.';
import { RoleTypes } from '../authorization/PermissionsTypes';
import { Roles } from '../models';
import { InfoJWT, NodeDTO } from '../types';
import { BywiseAPI } from '../utils/bywise-api';
import { getRandomString } from '../utils/helper';

@injectable({ scope: BindingScope.TRANSIENT })
export class NodesProvider {

  static nodes: NodeDTO[] = [];
  static tempToken: string | undefined;
  constructor(
    @service(ContractProvider) private contractProvider: ContractProvider
  ) { }

  static getRandomToken() {
    return getRandomString();
  }

  createMyNode() {
    let token = NodesProvider.getRandomToken();
    let account = this.contractProvider.getAccount();
    let myNode = new NodeDTO({
      address: WalletProvider.encodeBWSAddress(ContractProvider.isMainNet(), false, account.address),
      isFullNode: true,
      host: process.env.MY_HOST,
      version: '1',
      updated: (new Date()).toISOString(),
      token,
    });
    return myNode;
  }

  isValidToken(token: string): InfoJWT | null {
    if (token === NodesProvider.tempToken) {
      return new InfoJWT({
        id: 'tempToken',
        role: new Roles({
          id: RoleTypes.NODE,
          name: 'node'
        }),
        permissions: [],
      });
    } else {
      for (let i = 0; i < NodesProvider.nodes.length; i++) {
        if (NodesProvider.nodes[i].token === token) {
          return new InfoJWT({
            id: NodesProvider.nodes[i].host,
            role: new Roles({
              id: RoleTypes.NODE,
              name: 'node'
            }),
            permissions: [],
          });
        }
      }
    }
    return null;
  }

  getNodeLimit() {
    if (process.env.NODES_SIZE && parseInt(process.env.NODES_SIZE) > 0 && parseInt(process.env.NODES_SIZE) < 1000) {
      return parseInt(process.env.NODES_SIZE)
    } else {
      return 20;
    }
  }


  getNodes() {
    return NodesProvider.nodes.filter(node => node.isFullNode);
  }

  async tryConnectNode(host: string) {
    let myNode = this.createMyNode();
    NodesProvider.tempToken = myNode.token;
    let req = await BywiseAPI.tryHandshake(host, myNode);
    NodesProvider.tempToken = undefined;
    if (req.error) {
      throw new Error(req.error);
    } else {
      let newNode = new NodeDTO(req.data);
      if (newNode.host === host) {
        NodesProvider.nodes.push(newNode);
      } else {
        throw new Error(`invalid node reponse ${host}`);
      }
    }
  }

  removeNode(node: NodeDTO) {
    NodesProvider.nodes = NodesProvider.nodes.filter(n => n.host !== node.host);
  }

  async addNode(node: NodeDTO): Promise<NodeDTO> {
    if (node.isFullNode) {
      let remoteInfo = await BywiseAPI.tryToken(node);
      if (remoteInfo.error) {
        throw new Error(`could not connect to node - ${remoteInfo.error}`);
      }
    }
    if (this.getNodes().length < this.getNodeLimit()) {
      NodesProvider.nodes.push(node);
      let myNode = await this.createMyNode();
      myNode.token = node.token;
      return myNode;
    } else {
      throw new Error(`full server`);
    }
  }
}
