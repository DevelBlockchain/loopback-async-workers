const randomstring = require('randomstring');

const getRandomString = () => {
    return randomstring.generate({
        length: 40,
    });
}
const sleep = async function sleep(ms: number) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms + 10);
    });
}

export {
    getRandomString,
    sleep,
}