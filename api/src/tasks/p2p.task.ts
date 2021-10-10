import { service } from '@loopback/core';
import { CronJob, cronJob } from '@loopback/cron';
import { NodesProvider } from '../services';
import { InfoDTO } from '../types';
import { BywiseAPI } from '../utils/bywise-api';

@cronJob()
export class P2PConnection extends CronJob {

  constructor(
    @service(NodesProvider) private nodesProvider: NodesProvider,
  ) {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/10 * * * * *',
    });
  }

  runProcess = async () => {
    let nodes = this.nodesProvider.getNodes();
    if (nodes.length < this.nodesProvider.getNodeLimit()) {
      if (nodes.length === 0) {
        let hosts: string[] = process.env.LIST_HOSTS ? JSON.parse(`${process.env.LIST_HOSTS}`) : [];
        if (hosts.length > 0) {
          let host = hosts[Math.floor(Math.random() * hosts.length)];
          await this.tryConnectSomeNode([], host);
        }
      } else {
        let node = nodes[Math.floor(Math.random() * nodes.length)];
        await this.tryConnectSomeNode([], node.host);
      }
    }
  }

  async tryConnectSomeNode(testedNodes: string[], host: string): Promise<boolean> {
    if (testedNodes.includes(host) || host === process.env.MY_HOST) {
      return false;
    }
    testedNodes.push(host);
    let req = await BywiseAPI.getInfo(host);
    if (req.error) {
      throw new Error(`cant connect to ${host}`);
    }
    let info = new InfoDTO(req.data);
    let isConnected = false;
    this.nodesProvider.getNodes().forEach(node => {
      if (node.host === host) {
        isConnected = true;
      }
    });
    if (!isConnected) {
      await this.nodesProvider.tryConnectNode(host);
      return true;
    } else {
      for (let i = 0; i < info.nodes.length; i++) {
        let node = info.nodes[i];
        if (node.isFullNode) {
          return await this.tryConnectSomeNode(testedNodes, node.host);
        }
      }
    }
    return false;
  }
}

@cronJob()
export class P2PCheckSignOfLife extends CronJob {

  constructor(
    @service(NodesProvider) private nodesProvider: NodesProvider,
  ) {
    super({
      name: 'task-life-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/1 * * * *',
    });
  }

  runProcess = async () => {
    let nodes = this.nodesProvider.getNodes();
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      let req = await BywiseAPI.tryToken(node);
      if (req.error) {
        this.nodesProvider.removeNode(node);
      }
    }
  }
}