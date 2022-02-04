const randomstring = require('randomstring');
import { sha256, base16Decode, base16Encode } from '@waves/ts-lib-crypto';
import { ethers } from "ethers";
import { TransactionsDTO } from '../types';

const jsonToString = (mainJson: any): string => {
    const toJSON: any = (json: any) => {
        let newJSON;
        if (Array.isArray(json)) {
            newJSON = json.map(value => toJSON(value))
        } else if (json === null || json === undefined) {
            newJSON = json;
        } else if (typeof json === 'object') {
            let obj: any = {};
            Object.entries(json).sort((a, b) => a[0].localeCompare(b[0], 'en')).forEach(([key, value]) => {
                obj[key] = toJSON(value)
            })
            newJSON = obj;
        } else {
            newJSON = json;
        }
        return newJSON;
    }
    return JSON.stringify(toJSON(mainJson));
}
const getHashFromTransaction = (tx: TransactionsDTO) => {
    let version = '1';
    let bytes = '';
    bytes += Buffer.from(version, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.from, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.to, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.amount, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.fee, 'utf-8').toString('hex');
    bytes += Buffer.from(tx.type, 'utf-8').toString('hex');
    bytes += Buffer.from(jsonToString(tx.data), 'utf-8').toString('hex');
    if (tx.foreignKeys) {
        tx.foreignKeys.forEach(key => {
            bytes += key;
        })
    }
    bytes += Buffer.from(tx.created, 'utf-8').toString('hex');
    bytes = base16Encode(sha256(base16Decode(bytes))).toLowerCase();
    return bytes;
}
const signTransaction = async (seed: string, tx: TransactionsDTO) => {
    tx.hash = getHashFromTransaction(tx);
    let account = ethers.Wallet.fromMnemonic(seed);
    return (await account.signMessage(Buffer.from(tx.hash, 'hex')));
}
const getRandomString = () => {
    return randomstring.generate({
        length: 40,
    });
}
const numberToHex = (number: number) => {
    let hex = number.toString(16);
    if ((hex.length % 2) > 0) {
        hex = "0" + hex;
    }
    while (hex.length < 16) {
        hex = "00" + hex;
    }
    if (hex.length > 16 || number < 0) {
        throw new Error(`invalid pointer "${number}"`);
    }
    return hex;
}
const sleep = async function sleep(ms: number) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms + 10);
    });
}

export {
    jsonToString,
    getHashFromTransaction,
    signTransaction,
    getRandomString,
    numberToHex,
    sleep,
}