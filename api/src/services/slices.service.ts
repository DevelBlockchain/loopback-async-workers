import { injectable, BindingScope, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { BlocksRepository, ConfigsRepository, SlicesRepository, TransactionsRepository, WalletsRepository } from '../repositories';
import { ContractsEnvRepository } from '../repositories/contracts-env.repository';
import { ContractsVarsRepository } from '../repositories/contracts-vars.repository';
import { SimulateSliceDTO, TransactionsStatus } from '../types/transactions.type';
import { ContractProvider } from './contract.service';
import { ContractsVarsProvider } from './contracts-vars.service';
import { VirtualMachineProvider } from './virtual-machine.service';
import { Slice, Block, Tx } from '@bywise/web3';
import { Transactions } from '../models';

@injectable({ scope: BindingScope.TRANSIENT })
export class SlicesProvider {

  private static mempoolSlices: Slice[] = [];

  constructor(
    @repository(SlicesRepository) private slicesRepository: SlicesRepository,
    @repository(TransactionsRepository) private transactionsRepository: TransactionsRepository,
    @repository(BlocksRepository) public blocksRepository: BlocksRepository,
    @repository(WalletsRepository) public walletsRepository: WalletsRepository,
    @service(ContractProvider) private contractProvider: ContractProvider,
    @service(VirtualMachineProvider) private virtualMachineProvider: VirtualMachineProvider,
    @service(ContractsVarsProvider) private contractsVarsProvider: ContractsVarsProvider,
    @repository(ContractsEnvRepository) public contractsEnvRepository: ContractsEnvRepository,
    @repository(ContractsVarsRepository) public contractsVarsRepository: ContractsVarsRepository,
    @repository(ConfigsRepository) public configsRepository: ConfigsRepository,
  ) {

  }

  async validadeSlice(lastBlockHash: string, slice: Slice) {
    slice.isValid()
    if (slice.lastBlockHash !== lastBlockHash) {
      throw new Error(`invalid slice lastBlockHash ${slice.lastBlockHash} ${lastBlockHash}`);
    }
    for (let i = 0; i < slice.transactions.length; i++) {
      let txHash = slice.transactions[i];
      let tx = await this.transactionsRepository.findOne({ where: { hash: txHash } });
      if (!tx) {
        throw new Error('slice transaction ' + txHash + ' not found');
      }
      if (tx.status !== TransactionsStatus.TX_MEMPOOL) {
        throw new Error(`slice transaction ${txHash} already registered`);
      }
    }
  }

  getMempoolSlices(): Slice[] {
    return SlicesProvider.mempoolSlices.map(slice => slice);
  }

  getSlice(sliceHash: string): Slice | null {
    for (let i = 0; i < SlicesProvider.mempoolSlices.length; i++) {
      if (SlicesProvider.mempoolSlices[i].hash === sliceHash) {
        return SlicesProvider.mempoolSlices[i];
      }
    }
    return null;
  }

  async addSlice(lastBlockHash: string, slice: Slice): Promise<boolean> {
    for (let i = 0; i < SlicesProvider.mempoolSlices.length; i++) {
      if (SlicesProvider.mempoolSlices[i].hash === slice.hash) {
        return false;
      }
    }
    await this.validadeSlice(lastBlockHash, slice);
    SlicesProvider.mempoolSlices.push(slice);
    console.log('created new slice')
    return true;
  }

  async consolidateSlices(block: Block) {
    let ctx = new SimulateSliceDTO();
    await this.simulateBlock(block.slices, ctx);
    SlicesProvider.mempoolSlices = [];
    let newBlock = await this.blocksRepository.create(block);
    for (let i = 0; i < ctx.slicesModels.length; i++) {
      let slice = await this.slicesRepository.create({
        blocksId: newBlock.id,
        ...ctx.slicesModels[i]
      });
      for (let j = 0; j < slice.transactions.length; j++) {
        let txHash = slice.transactions[j];
        for (let z = 0; z < ctx.transactionsModels.length && txHash.length > 0; z++) {
          let tx = ctx.transactionsModels[z];
          if (tx.hash === txHash) {
            tx.slicesId = slice.id;
            txHash = '';
          }
        }
      }
    }
    for (let i = 0; i < ctx.transactionsModels.length; i++) {
      await this.transactionsRepository.update(ctx.transactionsModels[i]);
    }
    for (let i = 0; i < ctx.walletsModels.length; i++) {
      await this.walletsRepository.update(ctx.walletsModels[i]);
    }
    for (let i = 0; i < ctx.contractEnvModels.length; i++) {
      await this.contractsEnvRepository.update(ctx.contractEnvModels[i]);
    }
    for (let i = 0; i < ctx.contractVarsModels.length; i++) {
      await this.contractsVarsRepository.update(ctx.contractVarsModels[i]);
    }
    for (let i = 0; i < ctx.configs.length; i++) {
      await this.configsRepository.update(ctx.configs[i]);
    }
    await this.contractsVarsProvider.consolideVars(ctx.simulateId);
  }

  async simulateBlock(slices: string[], ctx: SimulateSliceDTO) {
    for (let i = 0; i < slices.length; i++) {
      let sliceHash = slices[i];
      await this.simulateSlice(sliceHash, ctx);
    }
  }

  async simulateSlice(sliceHash: string, ctx: SimulateSliceDTO) {
    for (let i = 0; i < ctx.slicesModels.length; i++) {
      if (ctx.slicesModels[i].hash === sliceHash) {
        throw new Error('slice duplicate slice ' + sliceHash);
      }
    }
    let slice = this.getSlice(sliceHash);
    if (!slice) {
      throw new Error('mempool slice ' + sliceHash + ' not found');
    }
    for (let i = 0; i < slice.transactions.length; i++) {
      let txHash = slice.transactions[i];
      await this.simulateTransaction(txHash, ctx);
    }
    ctx.slicesModels.push(slice);
  }

  async simulateTransaction(txHash: string, ctx: SimulateSliceDTO) {
    for (let i = 0; i < ctx.transactionsModels.length; i++) {
      if (ctx.transactionsModels[i].hash === txHash) {
        throw new Error('slice duplicate transaction ' + txHash);
      }
    }
    let tx = await this.transactionsRepository.findOne({ where: { hash: txHash } });
    if (!tx) {
      throw new Error('slice transaction ' + txHash + ' not found');
    }
    if (tx.status !== TransactionsStatus.TX_MEMPOOL) {
      throw new Error(`slice transaction ${txHash} already registered`);
    }
    tx.status = TransactionsStatus.TX_MINED;
    await this.virtualMachineProvider.executeTransaction(tx, ctx);
    ctx.transactionsModels.push(tx);
  }

  async createNewSlice(lastBlockHash: string, transactions: Transactions[]) {
    let wallet = this.contractProvider.getWallet();
    let slice = new Slice();
    slice.height = 0;
    slice.transactions = transactions.map(tx => tx.hash);
    slice.version = '1';
    slice.lastBlockHash = lastBlockHash.toLowerCase();
    slice.from = wallet.address;
    slice.next = wallet.address;
    slice.created = (new Date()).toISOString();
    slice.hash = slice.toHash();
    slice.sign = await wallet.signHash(slice.hash);
    return slice;
  }
}
