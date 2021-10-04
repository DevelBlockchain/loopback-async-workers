import { injectable, BindingScope, Provider } from '@loopback/core';
import { repository } from '@loopback/repository';

import { address, base58Encode, keyPair, publicKey, seedWithNonce, sha256, signBytes, stringToBytes, verifySignature } from '@waves/ts-lib-crypto';
import { ContractProvider } from '.';
import { Transactions } from '../models';
import { WalletsRepository } from '../repositories';
import { TransactionsDTO } from '../types/transactions.type';

@injectable({ scope: BindingScope.TRANSIENT })
export class VirtualMachineProvider {
  constructor(
    @repository(WalletsRepository) public walletsRepository: VirtualMachineProvider,
  ) { }

  async executeTransaction(transaction: TransactionsDTO) {
    /*if (!WalletProvider.isBywiseAddress(transaction.from)) throw new Error('invalid address');
    let wallet = await this.walletsRepository.findOne({
      where: {
        address: transaction.from
      }
    });
    if (!wallet) throw new Error('address not allowed');
    if (!transaction.sign) throw new Error('signature not found');
    let sign = transaction.sign;
    transaction.sign = undefined;
    let hash = WalletProvider.transactionToBytes(transaction);
    let isValidSign = await verifySignature(wallet.publicKey, hash, sign);
    transaction.sign = sign;
    if (!isValidSign) throw new Error('invalid signature');*/
  }
}
