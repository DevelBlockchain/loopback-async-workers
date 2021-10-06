import { injectable, BindingScope, Provider } from '@loopback/core';
import { repository } from '@loopback/repository';

import { randomSeed, base58Encode, keyPair, publicKey, seedWithNonce, sha256, signBytes, stringToBytes, verifySignature, privateKey, base16Decode } from '@waves/ts-lib-crypto';
import { ContractProvider } from '.';
import { Transactions } from '../models';
import { WalletsRepository } from '../repositories';
import { TransactionsDTO } from '../types/transactions.type';

@injectable({ scope: BindingScope.TRANSIENT })
export class WalletProvider {
  constructor(
    @repository(WalletsRepository) public walletsRepository: WalletsRepository,
  ) { }

  static transactionToBytes = (tx: any): Uint8Array => {
    let entries = Object.entries(tx);
    entries = entries.sort((entireA, entireB) => entireA[0].localeCompare(entireB[0]));
    tx = {};
    entries.forEach((entire) => {
      tx[entire[0]] = entire[1]
    });
    return sha256(sha256(stringToBytes(JSON.stringify(tx))));
  }

  static getAddressIdentifier(): string {
    return ContractProvider.isMainNet() ? 'BWS1M' : 'BWS1T';
  }

  static getBywiseAddress(publicKey: string): string {
    let hash = base58Encode(sha256(sha256(base16Decode(publicKey)))).substring(0, 28);
    let addressWithoutSum = WalletProvider.getAddressIdentifier() + hash;
    let sum = base58Encode(sha256(addressWithoutSum)).substring(0, 3);
    return addressWithoutSum + sum;
  }

  static isBywiseAddress(address: string): boolean {
    try {
      if (!address.startsWith(WalletProvider.getAddressIdentifier())) return false;
      let addressWithoutSum = address.substring(0, address.length - 3);
      let sum = address.substring(address.length - 3);
      let sumCalc = base58Encode(sha256(addressWithoutSum)).substring(0, 3);
      return sum == sumCalc;
    } catch (er) {
    }
    return false;
  }

  async verifyTransactions(transaction: TransactionsDTO) {
    if (!WalletProvider.isBywiseAddress(transaction.from)) throw new Error('invalid address');
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
    if (!isValidSign) throw new Error('invalid signature');
  }

  static newWallet() {
    let seed = randomSeed();
    let pubKey = publicKey(seed);
    let priKey = privateKey(seed);
    let address = WalletProvider.getBywiseAddress(pubKey);
    return {
      seed,
      pubKey,
      priKey,
      address,
    }
  }
}
