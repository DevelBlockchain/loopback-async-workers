const randomstring = require('randomstring');

export const getRandomString = () => {
    return randomstring.generate({
        length: 40,
    });
}

export const numberToHex = (number: number) => {
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

export const sleep = async function sleep(ms: number) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms + 10);
    });
}