import BigNumber from "bignumber.js";
import { Types, Variable } from "./data";

export class ULA {

    add(a: Variable, b: Variable): Variable {
        if (a.type.isNumber && b.type.isNumber) {
            let value = a.getNumber().plus(b.getNumber());
            return new Variable(Types.number, value.toString());
        } else {
            let value = a.value + b.value;
            return new Variable(Types.string, value.toString());
        }
    };

    sub(a: Variable, b: Variable): Variable {
        if (!a.type.isNumber) {
            throw new Error(`cannot subtract variable of type ${a.type} : ${a.value}`);
        }
        if (!b.type.isNumber) {
            throw new Error(`cannot subtract variable of type ${b.type} : ${b.value}`);
        }
        let value = a.getNumber().minus(b.getNumber());
        return new Variable(Types.number, value.toString());
    };

    mul(a: Variable, b: Variable): Variable {
        if (!a.type.isNumber) {
            throw new Error(`cannot multiply variable of type ${a.type} : ${a.value}`);
        }
        if (!b.type.isNumber) {
            throw new Error(`cannot multiply variable of type ${b.type} : ${b.value}`);
        }
        let value = a.getNumber().multipliedBy(b.getNumber());
        return new Variable(Types.number, value.toString());
    };

    div(a: Variable, b: Variable): Variable {
        if (!a.type.isNumber) {
            throw new Error(`can not divide variable of type ${a.type} : ${a.value}`);
        }
        if (!b.type.isNumber) {
            throw new Error(`can not divide variable of type ${b.type} : ${b.value}`);
        }
        if (b.getNumber().isZero()) throw new Error('can not divide by zero')
        let value = a.getNumber().dividedBy(b.getNumber());
        return new Variable(Types.number, value.toString());
    };

    exp(a: Variable, b: Variable): Variable {
        if (!a.type.isNumber) {
            throw new Error(`cannot exponential variable of type ${a.type} : ${a.value}`);
        }
        if (!b.type.isNumber) {
            throw new Error(`cannot exponential variable of type ${b.type} : ${b.value}`);
        }
        let value = a.getNumber().exponentiatedBy(b.getNumber());
        return new Variable(Types.number, value.toString());
    };

    fixed(a: Variable, b: Variable): Variable {
        if (!a.type.isNumber) {
            throw new Error(`cannot fixe variable of type ${a.type} : ${a.value}`);
        }
        if (!b.type.isNumber) {
            throw new Error(`cannot fixe variable of type ${b.type} : ${b.value}`);
        }
        let value = a.getNumber().toFixed(parseInt(b.getNumber().toFixed(0)));
        return new Variable(Types.number, value.toString());
    };

    sqrt(a: Variable): Variable {
        if (!a.type.isNumber) {
            throw new Error(`cannot square root variable of type ${a.type} : ${a.value}`);
        }
        let value = a.getNumber().squareRoot();
        return new Variable(Types.number, value.toString());
    };

    abs(a: Variable): Variable {
        if (!a.type.isNumber) {
            throw new Error(`cannot absolute variable of type ${a.type} : ${a.value}`);
        }
        let value = a.getNumber().abs();
        return new Variable(a.type, value.toString());
    };

    equ(a: Variable, b: Variable): Variable {
        let response = false;
        if (a.type.isNumber && b.type.isNumber) {
            response = a.getNumber().isEqualTo(b.getNumber());
        } else {
            response = a.value === b.value;
        }
        return new Variable(Types.boolean, `${response}`);
    };

    gt(a: Variable, b: Variable): Variable {
        let response = false;
        if (a.type.isNumber && b.type.isNumber) {
            response = a.getNumber().isGreaterThan(b.getNumber());
        }
        return new Variable(Types.boolean, `${response}`);
    };

    gte(a: Variable, b: Variable): Variable {
        let response = false;
        if (a.type.isNumber && b.type.isNumber) {
            response = a.getNumber().isGreaterThanOrEqualTo(b.getNumber());
        }
        return new Variable(Types.boolean, `${response}`);
    };

    le(a: Variable, b: Variable): Variable {
        let response = false;
        if (a.type.isNumber && b.type.isNumber) {
            response = a.getNumber().isLessThan(b.getNumber());
        }
        return new Variable(Types.boolean, `${response}`);
    };

    lee(a: Variable, b: Variable): Variable {
        let response = false;
        if (a.type.isNumber && b.type.isNumber) {
            response = a.getNumber().isLessThanOrEqualTo(b.getNumber());
        }
        return new Variable(Types.boolean, `${response}`);
    };

    and(a: Variable, b: Variable): Variable {
        if (a.type !== Types.boolean) throw new Error(`cannot inverse variable of type ${a.type} : ${a.value}`);
        if (b.type !== Types.boolean) throw new Error(`cannot inverse variable of type ${b.type} : ${b.value}`);
        return new Variable(Types.boolean, `${a.value === 'true' && b.value === 'true'}`);
    };

    or(a: Variable, b: Variable): Variable {
        if (a.type !== Types.boolean) throw new Error(`cannot inverse variable of type ${a.type} : ${a.value}`);
        if (b.type !== Types.boolean) throw new Error(`cannot inverse variable of type ${b.type} : ${b.value}`);
        return new Variable(Types.boolean, `${a.value === 'true' || b.value === 'true'}`);
    };

    inv(a: Variable): Variable {
        let response = false;
        if (a.type !== Types.boolean) throw new Error(`cannot inverse variable of type ${a.type} : ${a.value}`);
        return new Variable(Types.boolean, `${!(a.value === 'true')}`);
    };
}