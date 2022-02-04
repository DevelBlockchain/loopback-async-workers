import { injectable, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { sha256, base16Decode, base16Encode } from '@waves/ts-lib-crypto';
import { WalletsRepository } from '../repositories';

@injectable({ scope: BindingScope.TRANSIENT })
export class WalletProvider {
  static ZERO_ADDRESS = 'BWS0000000000000000000000000000000000000000000';

  constructor(
    @repository(WalletsRepository) public walletsRepository: WalletsRepository,
  ) { }

  static encodeBWSAddress = (isMainnet: boolean, isContract: boolean, address: string, tag?: string) => {
    let finalAddress = 'BWS1';
    finalAddress += isMainnet ? 'M' : 'T';
    finalAddress += isContract ? 'C' : 'U';
    finalAddress += address.substring(2);
    if (tag && !/^[0-9a-fA-F]{1,40}$/.test(tag)) {
      console.log('tag', tag)
      let checkSum = base16Encode(sha256(base16Decode(tag))).substring(0, 3);
      finalAddress += tag;
      finalAddress += checkSum;
    }
    return finalAddress;
  }

  static isZeroAddress = (address: string) => {
    return address === WalletProvider.ZERO_ADDRESS;
  }

  static isValidAddress = (address: string) => {
    return address === WalletProvider.ZERO_ADDRESS || /^BWS[0-9]+[MT][CU][0-9a-fA-F]{40}[0-9a-fA-F]{0,43}$/.test(address);
  }

  static decodeBWSAddress = (address: string): { isMainnet: boolean, isContract: boolean, ethAddress: string, tag: string } => {
    if (address === WalletProvider.ZERO_ADDRESS) {
      return {
        isMainnet: false,
        isContract: false,
        ethAddress:'0x0000000000000000000000000000000000000000',
        tag:'',
      };
    }
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
}
