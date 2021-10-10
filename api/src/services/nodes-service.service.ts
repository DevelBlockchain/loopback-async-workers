import { injectable, BindingScope, Provider, service } from '@loopback/core';
import { ContractProvider, WalletProvider } from '.';
import { NodeDTO } from '../types';
import { BywiseAPI } from '../utils/bywise-api';

const randomstring = require('randomstring');

@injectable({ scope: BindingScope.TRANSIENT })
export class NodesProvider {

  static nodes: NodeDTO[] = [];
  static tempToken: string | undefined;
  constructor(
    @service(ContractProvider) private contractProvider: ContractProvider
  ) { }

  private getRandomToken() {
    return randomstring.generate({
      length: 40,
    });
  }

  createMyNode() {
    let token = this.getRandomToken();
    let account = this.contractProvider.getAccount();
    let myNode = new NodeDTO({
      address: WalletProvider.encodeBWSAddress(ContractProvider.isMainNet(), false, account.address),
      isFullNode: true,
      host: process.env.MY_HOST,
      version: '1',
      updated: (new Date()).getTime(),
      token,
    });
    return myNode;
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
