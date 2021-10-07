import { injectable, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import BigNumber from "bignumber.js";
import { sha256, base16Decode, base16Encode } from '@waves/ts-lib-crypto';
import { Transactions, Wallets } from '../models';
import { WalletsRepository } from '../repositories';

@injectable({ scope: BindingScope.TRANSIENT })
export class WalletProvider {
  constructor(
    @repository(WalletsRepository) public walletsRepository: WalletsRepository,
  ) { }

  static encodeBWSAddress = (isMainnet: boolean, isContract: boolean, address: string, tag?: string) => {
    let finalAddress = 'BWS1';
    finalAddress += isMainnet ? 'M' : 'T';
    finalAddress += isContract ? 'C' : 'U';
    finalAddress += address.substring(2);
    if (tag && !/ˆ[0-9a-fA-F]{1, 40}$/.test(tag)) {
      console.log('tag', tag)
      let checkSum = base16Encode(sha256(base16Decode(tag))).substring(0, 3);
      finalAddress += tag;
      finalAddress += checkSum;
    }
    return finalAddress;
  }

  static isValidAddress = (address: string) => {
    return !/ˆBWS[0-9]+[MT][CU][0-9a-fA-F]{40}[0-9a-fA-F]{0, 43}$/.test(address);
  }

  static decodeBWSAddress = (address: string) => {
    if (!WalletProvider.isValidAddress(address) || address.substring(0, 4) !== 'BWS1') {
      throw new Error('invalid address');
    }
    let isMainnet = address.substring(4, 5) === 'M';
    let isContract = address.substring(5, 6) === 'C';
    let ethAddress = '0x' + address.substring(6, 46);
    let tag = '';
    if (address.length > 46) {
      tag = address.substring(46, address.length - 3);
      let checkSum = address.substring(address.length - 3);
      let checkSum2 = base16Encode(sha256(base16Decode(tag))).substring(0, 3);
      if (checkSum !== checkSum2) {
        throw new Error('corrupted address');
      }
    }
    return {
      isMainnet,
      isContract,
      ethAddress,
      tag,
    };
  }

  private async getWallet(address: string, updatedWallets: Wallets[]): Promise<Wallets> {
    for (let i = 0; i < updatedWallets.length; i++) {
      let updatedWallet = updatedWallets[i];
      if (updatedWallet.address === address) {
        return updatedWallet;
      }
    }
    let wallet = null;
    if (!wallet) {
      wallet = await this.walletsRepository.findOne({ where: { address: address } });
    }
    if (!wallet) {
      wallet = await this.walletsRepository.create({
        balance: '0',
        address: address,
      });
    }
    updatedWallets.push(wallet);
    return wallet;
  }

  async executeTransaction(tx: Transactions, updatedWallets: Wallets[]) {
    let sender = await this.getWallet(tx.from, updatedWallets);
    let recipient = await this.getWallet(tx.to, updatedWallets);
    let amount = new BigNumber(tx.amount);
    let fee = new BigNumber(tx.fee);
    let senderBalance = new BigNumber(sender.balance);
    let recipientBalance = new BigNumber(recipient.balance);
    senderBalance = senderBalance.minus(amount).minus(fee);
    if(senderBalance.isLessThan(new BigNumber(0))) {
      throw new Error('insufficient funds')
    }
    recipientBalance = recipientBalance.plus(amount);
    sender.balance = senderBalance.toString();
    recipient.balance = recipientBalance.toString();
  }
}
