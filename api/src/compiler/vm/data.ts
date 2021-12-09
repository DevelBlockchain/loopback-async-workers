import BigNumber from "bignumber.js";
import { SimulateSliceDTO, VariableDTO } from "../../types";

export class Type {
    name: string;
    defaultValue: string;
    isNumber: boolean;

    constructor(name: string, defaultValue: string, isNumber: boolean) {
        this.name = name;
        this.defaultValue = defaultValue;
        this.isNumber = isNumber;
    }

    toString(value: string) {
        return this.name;
    }
}

export class Types {
    static string = new Type('string', '""', false);
    static number = new Type('number', '0', true);
    static integer = new Type('integer', '0', true);
    static address = new Type('address', 'BWS0000000000000000000000000000000000000000000', false);
    static binary = new Type('binary', '0x', false);
    static boolean = new Type('boolean', 'false', false);
    static array = new Type('array', '[]', false);
    static map = new Type('map', '{}', false);

    static getType(name: string): Type | undefined {
        let type: Type | undefined = undefined;
        Object.entries(Types).forEach(([key, value]) => {
            if (value.name === name) {
                type = value;
            }
        })
        return type;
    }
}

export class Variable {
    type: Type;
    value: string;

    constructor(type: Type, value: string) {
        this.type = type;
        this.value = value;
    }

    getNumber(): BigNumber {
        if (this.type === Types.number) {
            return new BigNumber(this.value);
        } else if (this.type === Types.integer) {
            return new BigNumber((new BigNumber(this.value)).toFixed(0));
        } else {
            throw new Error(`Internal fatal error - Variable.getNumber(${this.value})`);
        }
    }

    toJSON(): any {
        return {
            type: this.type.name,
            value: this.value,
        }
    }

    toOutput(): any {
        if (this.type === Types.array) {
            let jsonArray: any[] = JSON.parse(this.value);
            let array: any[] = [];
            jsonArray.forEach(value => {
                const variable = Variable.fromJSON(value).toOutput();
                array.push(variable);
            })
            return array;
        } else if (this.type === Types.map) {
            let jsonArray: any = JSON.parse(this.value);
            let obj: any = {};
            Object.entries(jsonArray).forEach(([key, value]) => {
                const variable = Variable.fromJSON(value).toOutput();
                obj[key.split(':')[1]] = variable;
            })
            return obj;
        } else {
            return this.value;
        }
    }

    static fromJSON(json: any): Variable {
        let type = Types.getType(json.type);
        if (type === undefined) throw new Error(`Internal fatal error - invalid type ${json.type}`);
        let obj = new Variable(type, json.value);
        return obj;
    }
}

export class VariableMeta {
    variable: Variable;
    isGlobal: boolean;
    registerId?: string;

    constructor(variable: Variable, isGlobal?: boolean, registerId?: string) {
        this.variable = variable;
        this.isGlobal = isGlobal ? isGlobal : false;
        this.registerId = registerId;
    }
}

export class Function {
    pointer: number;
    name: string;
    isPublic: boolean;
    isPayable: boolean;
    inputs: Type[] = [];
    outputs: Type[] = [];

    constructor(pointer: number, name: string, isPublic: boolean, isPayable: boolean) {
        this.pointer = pointer;
        this.name = name;
        this.isPublic = isPublic;
        this.isPayable = isPayable;
    }

    toJSON(): any {
        return {
            pointer: this.pointer,
            name: this.name,
            isPublic: this.isPublic,
            isPayable: this.isPayable,
            inputs: this.inputs.map(v => v.name),
            outputs: this.outputs.map(v => v.name),
        }
    }

    static fromJSON(json: any): Function {
        let obj = new Function(json.pointer, json.name, json.isPublic, json.isPayable);
        json.inputs.forEach((v: string) => {
            let type = Types.getType(v);
            if (type === undefined) throw new Error(`Internal fatal error - invalid type ${json.type}`);
            obj.inputs.push(type);
        })
        json.outputs.forEach((v: string) => {
            let type = Types.getType(v);
            if (type === undefined) throw new Error(`Internal fatal error - invalid type ${json.type}`);
            obj.outputs.push(type);
        })
        return obj;
    }
}

export class ParameterABI {
    type: string;
    name: string;

    constructor(type: string, name: string) {
        this.type = type;
        this.name = name;
    }

    toJSON(): any {
        return {
            type: this.type,
            name: this.name,
        }
    }

    static fromJSON(json: any): ParameterABI {
        return new ParameterABI(json.type, json.name);
    }
}

export class FunctionABI {
    addr: string;
    name: string;
    isPayable: boolean;
    isPaid: boolean;
    description: string;
    inputs: ParameterABI[] = [];
    outputs: ParameterABI[] = [];

    constructor(addr: string, name: string, isPayable: boolean, isPaid: boolean, description: string) {
        this.addr = addr;
        this.name = name;
        this.isPayable = isPayable;
        this.isPaid = isPaid;
        this.description = description;
    }

    toJSON(): any {
        return {
            addr: this.addr,
            name: this.name,
            isPayable: this.isPayable,
            isPaid: this.isPaid,
            description: this.description,
            inputs: this.inputs.map(v => v.toJSON()),
            outputs: this.outputs.map(v => v.toJSON())
        }
    }

    static fromJSON(json: any): FunctionABI {
        let obj = new FunctionABI(json.addr, json.name, json.isPayable, json.isPaid, json.description);
        obj.inputs = json.inputs.map((v: any) => ParameterABI.fromJSON(v));
        obj.outputs = json.outputs.map((v: any) => ParameterABI.fromJSON(v));
        return obj;
    }
}

export class Context {
    isExternal: boolean;
    initialPointer = 0;
    stack: number = 0;
    globalVariables = new Map<string, Variable>();
    variables = new Map<string, Variable>();
    inputs: Type[] = [];
    outputs: Type[] = [];
    inputValues: Variable[] = [];
    outputRegisters: string[] = [];
    outputValues: Variable[] = [];
    subContext: Context | undefined;

    constructor(isExternal: boolean) {
        this.isExternal = isExternal;
    }
}

export class Environment {
    ctx = new Context(false);
    globalVariables = this.ctx.globalVariables;
    cost = 0;
    contract: ContractABI;
    functions = new Map<string, Function>();
    checkpoints = new Map<string, number>();
    lastPointer = 0;
    pointer = 0;
    code: string[] = [];
    logs: string[] = [];

    constructor(contract: ContractABI) {
        this.contract = contract;
    }

    getCommand(endCommandSignal: string): string[] {
        this.lastPointer = this.pointer
        let command: string[] = [];
        let word;
        do {
            word = this.code[this.pointer];
            if (word !== endCommandSignal) {
            }
            command.push(word);
            this.pointer++;
            if (!word) {
                throw new Error(`invalid end code`);
            }
        } while (word !== endCommandSignal)
        return command;
    }

    gotoEnd(endCommand: string) {
        for (let i = this.pointer; i < this.code.length; i++) {
            if (this.code[i] === endCommand) {
                this.pointer = i + 2;
                return;
            }
        }
        throw new Error(`not found end of function`);
    }

    newContext(isExternal: boolean) {
        let newContext = new Context(isExternal);
        newContext.globalVariables = this.ctx.globalVariables;
        newContext.initialPointer = this.pointer;
        newContext.stack = this.ctx.stack + 1;
        newContext.subContext = this.ctx;
        if (newContext.stack > 10000) throw new Error(`stack overflow error`);
        this.ctx = newContext;
    }

    dropContext() {
        if (this.ctx.subContext) {
            this.pointer = this.ctx.initialPointer
            this.ctx = this.ctx.subContext;
        } else {
            throw new Error(`invalid end`);
        }
    }

    toJSON(): any {
        let globalVariables: { v: object, k: string }[] = [];
        this.globalVariables.forEach((value, key) => {
            globalVariables.push({ v: value.toJSON(), k: key })
        })
        let functions: { v: object, k: string }[] = [];
        this.functions.forEach((value, key) => {
            functions.push({ v: value.toJSON(), k: key })
        })
        let checkpoints: { v: number, k: string }[] = [];
        this.checkpoints.forEach((value, key) => {
            checkpoints.push({ v: value, k: key })
        })
        return {
            contract: this.contract.toJSON(true),
            globalVariables,
            functions,
            checkpoints,
            pointer: this.pointer,
            lastPointer: this.lastPointer,
        }
    }

    static fromJSON(json: any): Environment {
        let contract = ContractABI.fromJSON(json.contract);
        let obj = new Environment(contract);
        json.globalVariables.forEach((v: any) => {
            obj.globalVariables.set(v.k, Variable.fromJSON(v.v))
        })
        json.functions.forEach((v: any) => {
            obj.functions.set(v.k, Function.fromJSON(v.v))
        })
        json.checkpoints.forEach((v: any) => {
            obj.checkpoints.set(v.k, v.v)
        })
        obj.pointer = json.pointer;
        obj.lastPointer = json.lastPointer;
        return obj;
    }
}

export class Operator {
    name: string;
    op: (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {};

    constructor(name: string, op: any) {
        this.name = name;
        this.op = op;
    }
}

export class Command {
    name: string;
    inputs: string[];
    codeLine: number;

    constructor(name: string, inputs: string[], codeLine: number) {
        this.name = name;
        this.inputs = inputs;
        this.codeLine = codeLine;
    }
}

export class CommandComplement {
    word: string[] = [];
    size: number = 0;
}

export class CommandSyntax {
    bytecode: string = '';
    name: string = '';
    description: string = '';
    reservedWord: boolean = false;
    complements: CommandComplement[] = [];
}

export class ContractABI {
    nonce: number = 0;
    bytecode: string = '';
    address: string = '';
    debug?: string[] | undefined;
    names?: Map<string, string> | undefined;
    publicFunctions: FunctionABI[] = [];

    toJSON(all = false): any {
        if (all) {
            let names: string[] = [];
            if (this.names) {
                this.names.forEach((value, key) => {
                    names.push(`${key}:${value}`);
                })
            }
            return {
                nonce: this.nonce,
                bytecode: this.bytecode,
                address: this.address,
                debug: this.debug ? this.debug : undefined,
                names,
                publicFunctions: this.publicFunctions.map(v => v.toJSON()),
            }
        } else {
            return {
                nonce: this.nonce,
                bytecode: this.bytecode,
                address: this.address,
                publicFunctions: this.publicFunctions.map(v => v.toJSON()),
            }
        }
    }

    static fromJSON(json: any): ContractABI {
        let obj = new ContractABI();
        obj.nonce = json.nonce;
        obj.bytecode = json.bytecode;
        obj.address = json.address;
        obj.publicFunctions = json.publicFunctions.map((v: any) => FunctionABI.fromJSON(v));
        if (json.debug) {
            obj.debug = json.debug;
        }
        if (json.names) {
            let names = new Map<string, string>();
            json.names.forEach((entire: string) => {
                let key = entire.substring(0, entire.indexOf(':', 0));
                let value = entire.substring(entire.indexOf(':', 0) + 1);
                names.set(key, value);
            })
            obj.names = names;
        }
        return obj;
    }
}

export class ExecutedFunction {
    output: any = {};
    cost: number = 0;
    logs: string[] = [];
}