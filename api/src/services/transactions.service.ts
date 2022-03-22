import { injectable, BindingScope, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { ethers } from "ethers";
import { Transactions } from '../models';
import { TransactionsRepository } from '../repositories';
import { ContractProvider } from './contract.service';
import { SimulateSliceDTO, TransactionOutputDTO, TransactionsStatus } from '../types/transactions.type';
import { VirtualMachineProvider } from './virtual-machine.service';
import { ConfigProvider } from './configs.service';
import { Tx, TxType, BywiseHelper } from '@bywise/web3';

@injectable({ scope: BindingScope.TRANSIENT })
export class TransactionsProvider {

  static mempoolNotValidatedTransactions: Tx[] = [];

  constructor(
    @repository(TransactionsRepository) private transactionsRepository: TransactionsRepository,
    @service(ContractProvider) private contractProvider: ContractProvider,
    @service(ConfigProvider) public configProvider: ConfigProvider,
    @service(VirtualMachineProvider) private virtualMachineProvider: VirtualMachineProvider,
  ) {

  }

  private static validadeTransaction(txDTO: Tx) {
    let tx = new Tx({ ...txDTO });
    tx.isValid();
  }

  async createNewTransaction(to: string, amount: string, fee: string, type: TxType, data: any, foreignKeys?: string[]) {
    let wallet = this.contractProvider.getWallet();
    let tx = new Tx();
    tx.version = '1';
    tx.from = [wallet.address];
    tx.to = [to];
    tx.tag = BywiseHelper.getAddressTag(to);
    tx.amount = [amount];
    tx.fee = fee;
    tx.type = type;
    tx.data = data;
    tx.foreignKeys = foreignKeys;
    tx.created = (new Date()).toISOString();
    tx.hash = tx.toHash();
    tx.sign = [await wallet.signHash(tx.hash)];

    tx.isValid();
    return tx;
  }

  async simulateTransaction(tx: Tx, ctx: SimulateSliceDTO): Promise<TransactionOutputDTO> {
    let newTx = new Transactions(tx);
    ctx.simulate = true;
    await this.virtualMachineProvider.executeTransaction(newTx, ctx);
    return newTx.output;
  }

  async saveTransaction(tx: Tx): Promise<Transactions> {
    tx.isValid();
    
    let registeredTx = await this.transactionsRepository.findOne({
      where: {
        hash: tx.hash
      }
    })
    if (!registeredTx) {
      let ctx = new SimulateSliceDTO();
      let newTx = new Transactions(tx);
      await this.virtualMachineProvider.executeTransaction(newTx, ctx);

      newTx.status = TransactionsStatus.TX_MEMPOOL;
      await this.transactionsRepository.create(newTx);
      return newTx;
    } else {
      throw new Error('Transaction already registered');
    }
  }
}
