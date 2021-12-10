const { sha256, base16Decode, base16Encode } = require('@waves/ts-lib-crypto');
const { ethers } = require('ethers');

const jsonToString = (mainJson) => {
    const toJSON = (json) => {
        let newJSON;
        if (Array.isArray(json)) {
            newJSON = json.map(value => toJSON(value))
        } else if (json === null || json === undefined) {
            newJSON = json;
        } else if (typeof json === 'object') {
            let obj = {};
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
const getHashFromTransaction = (tx = {}) => {
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
    bytes = base16Encode(sha256(base16Decode(bytes))).substring(2).toLowerCase();
    return bytes;
}
const signTransaction = async (seed = '', tx = {}) => {
    tx.hash = getHashFromTransaction(tx);
    let account = ethers.Wallet.fromMnemonic(seed);
    return (await account.signMessage(Buffer.from(tx.hash, 'hex')));
}
const testData = {
    name: 'asdfasdfasd',
    feliz: 'sdfasdfas',
    obj: {
        name: 'novo obj',
        idade: 5,
        myArray: [
            'sdfg',
            4,
            false,
            {
                name: 'novo obj',
            },
        ],
    },
    myArray: [
        'sdfg',
        4,
        false,
        {
            name: 'novo obj',
            idade: 5,
            myArray: [
                'sdfg',
                4,
                false,
            ],
        },
        null,
        undefined,
    ],
    banana: 'asdfasdf',
}
console.log(jsonToString(testData));
