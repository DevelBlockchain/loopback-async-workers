import { Type, Variable } from "./data";

export interface BywiseCommands {
    transferBWS(to: Variable, amount: Variable): void;
    balanceOfBWS(address: Variable): void;
    getSender(): Variable;
    verifySignature(address: Variable, data: Variable, signature: Variable): void;
}

export interface BywiseData {
    newValue(name: string, value: Variable): void;
    setValue(name: string, value: Variable): void;
    getValue(name: string): Variable;

    newArray(name: string, type: Type): void;
    pushArray(name: string, index: bigint, value: Variable): void;
    popArray(name: string, index: bigint): Variable;
    getArrayLength(name: string, index: Variable): bigint;
    setArray(name: string, index: bigint, value: Variable): void;
    getArray(name: string, index: bigint): Variable;

    newMap(name: string, type: Type): void;
    setMap(name: string, key: Variable, value: Variable): void;
    getMap(name: string, key: Variable): Variable;
    hasMap(name: string, key: Variable): Variable;
}