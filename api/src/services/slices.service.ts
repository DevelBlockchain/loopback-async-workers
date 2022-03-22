import { injectable, BindingScope, Provider, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { base16Decode, base16Encode, sha256, signBytes } from '@waves/ts-lib-crypto';
import { ethers } from 'ethers';
import { WalletProvider } from '.';
import { BlocksRepository, ConfigsRepository, SlicesRepository, TransactionsRepository, WalletsRepository } from '../repositories';
import { ContractsEnvRepository } from '../repositories/contracts-env.repository';
import { ContractsVarsRepository } from '../repositories/contracts-vars.repository';
import { BlockDTO, SimulateSliceDTO, SliceDTO, TransactionsDTO, TransactionsStatus } from '../types/transactions.type';
import { getRandomString, numberToHex } from '../utils/helper';
import { ContractProvider } from './contract.service';
import { ContractsVarsProvider } from './contracts-vars.service';
import { VirtualMachineProvider } from './virtual-machine.service';

@injectable({ scope: BindingScope.TRANSIENT })
export class SlicesProvider {

  private static mempoolSlices: SliceDTO[] = [];

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

  async validadeSlice(lastBlockHash: string, slice: SliceDTO) {
    if (slice.height < 0) {
      throw new Error('invalid slice height ' + slice.height);
    }
    if (slice.lastBlockHash !== lastBlockHash) {
      throw new Error(`invalid slice lastBlockHash ${slice.lastBlockHash} ${lastBlockHash}`);
    }
    if (!/^[0-9a-f]{64}$/.test(slice.lastBlockHash)) {
      throw new Error('invalid slice lastBlockHash ' + slice.lastBlockHash);
    }
    if (slice.numberOfTransactions <= 0) {
      throw new Error('invalid numberOfTransactions ' + slice.numberOfTransactions);
    }
    if (slice.transactions.length !== slice.numberOfTransactions) {
      throw new Error('invalid slice length ' + slice.transactions.length + ' ' + slice.numberOfTransactions);
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
    if (slice.version !== '1') {
      throw new Error('invalid slice version ' + slice.version);
    }
    if (!WalletProvider.isValidAddress(slice.from)) {
      throw new Error('invalid slice from address ' + slice.from);
    }
    let hash = '';
    if (slice.transactions.length > 0) {
      slice.transactions.forEach(txHash => {
        hash += txHash;
      })
      hash = base16Encode(sha256(base16Decode(hash))).substring(2).toLowerCase();
    } else {
      hash = '0000000000000000000000000000000000000000000000000000000000000000'
    }
    if (slice.merkleRoot !== hash) {
      throw new Error(`invalid slice merkle root ${slice.merkleRoot} ${hash}`);
    }
    hash = SlicesProvider.getHashFromSlice(slice);
    if (slice.hash !== hash) {
      throw new Error(`invalid slice hash ${slice.hash} ${hash}`);
    }
    let recoveredAddress = ethers.utils.verifyMessage(Buffer.from(hash, 'hex'), slice.sign);
    let decodeAddress = WalletProvider.decodeBWSAddress(slice.from);
    if (recoveredAddress !== decodeAddress.ethAddress) {
      throw new Error('invalid slice signature');
    }
  }

  private static getHashFromSlice(slice: SliceDTO): string {
    let bytes = '';
    bytes += numberToHex(slice.height);
    bytes += numberToHex(slice.numberOfTransactions);
    bytes += Buffer.from(slice.version, 'utf-8').toString('hex');
    bytes += Buffer.from(slice.from, 'utf-8').toString('hex');
    bytes += Buffer.from(slice.created, 'utf-8').toString('hex');
    bytes += slice.merkleRoot;
    bytes += slice.lastBlockHash;
    bytes = base16Encode(sha256(base16Decode(bytes))).toLowerCase();
    return bytes;
  }

  getMempoolSlices(): SliceDTO[] {
    return SlicesProvider.mempoolSlices.map(slice => slice);
  }

  getSlice(sliceHash: string): SliceDTO | null {
    for (let i = 0; i < SlicesProvider.mempoolSlices.length; i++) {
      if (SlicesProvider.mempoolSlices[i].hash === sliceHash) {
        return SlicesProvider.mempoolSlices[i];
      }
    }
    return null;
  }

  async addSlice(lastBlockHash: string, slice: SliceDTO): Promise<boolean> {
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

  async consolidateSlices(block: BlockDTO) {
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

  async createNewSlice(lastBlockHash: string, transactions: TransactionsDTO[]) {
    let account = this.contractProvider.getAccount();
    let slice = new SliceDTO();
    slice.height = 0;
    slice.numberOfTransactions = transactions.length;
    slice.transactions = transactions.map(tx => tx.hash);
    slice.version = '1';
    slice.lastBlockHash = lastBlockHash.toLowerCase();
    slice.from = WalletProvider.encodeBWSAddress(ContractProvider.isMainNet(), false, account.address);
    slice.created = (new Date()).toISOString();
    if (transactions.length > 0) {
      let hash = '';
      transactions.forEach(tx => {
        hash += tx.hash;
      })
      slice.merkleRoot = base16Encode(sha256(base16Decode(hash))).substring(2).toLowerCase();
    } else {
      slice.merkleRoot = '0000000000000000000000000000000000000000000000000000000000000000';
    }
    slice.hash = SlicesProvider.getHashFromSlice(slice);
    slice.sign = (await account.signMessage(Buffer.from(slice.hash, 'hex')));
    return slice;
  }
}
