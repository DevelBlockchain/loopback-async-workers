const BigNumber = require("bignumber.js");

function calcFee(sizeN, costN, amountN) {
    let size = new BigNumber(sizeN);
    let cost = new BigNumber(costN);
    let amount = new BigNumber(amountN);
    return amount.div(1000.0).plus(size.div(20.0).plus(cost.multipliedBy(20)).div(1000.0)).plus(0.001).toFixed(5);
}

let tests = [
    [21555, 19, 0, 'Generate contract'],
    [173, 12, 0, 'Execute contract'],
    [32, 32, 0, 'Execute contract'],
    [0, 0, 1, 'Transfer amount 1'],
    [0, 0, 100, 'Transfer amount 100'],
    [0, 0, 0, 'Span transaction'],
]

tests.forEach(test => {
    console.log(`calcFee= ${calcFee(test[0], test[1], test[2])} - test: ${test[3]} - {size:${test[0]},cost:${test[1]},amount:${test[2]}}`)
})