import BigNumber from "bignumber.js";
import { SimulateSliceDTO } from "../../types";
import { BywiseBlockchainInterface } from "../bywise/bywise-blockchain";
import Compiler from "./compiler";
import { CommandComplement, CommandSyntax, Context, ContractABI, Environment, ExecutedFunction, Function, FunctionABI, Operator, Type, Types, Variable, VariableMeta } from "./data";
import { ULA } from "./ula";
import fs from 'fs';

export default class BywiseVirtualMachine {
    private bywiseBlockchain: BywiseBlockchainInterface;
    private env: Environment;
    private ula = new ULA();
    private cmds: Operator[] = [];
    private dictionary: CommandSyntax[];
    private outputValues: Variable[] = [];

    constructor(contract: ContractABI, bywiseBlockchain: BywiseBlockchainInterface) {
        this.bywiseBlockchain = bywiseBlockchain;
        this.env = new Environment(contract);
        this.dictionary = BywiseVirtualMachine.getDictionary();
        this.initializeOperators();
    }

    static async exec(ctx: SimulateSliceDTO, isMainnet: boolean, limiteCost: number, contract: ContractABI, bywiseBlockchain: BywiseBlockchainInterface): Promise<{ cost: number, env: string, logs: string[] }> {
        let vm = new BywiseVirtualMachine(contract, bywiseBlockchain);
        return await vm.exec(ctx, isMainnet, limiteCost);
    }

    static async execFunction(ctx: SimulateSliceDTO, limiteCost: number, env: Environment, bywiseBlockchain: BywiseBlockchainInterface, name: string, inputsValues: string[]): Promise<ExecutedFunction> {
        let vm = new BywiseVirtualMachine(env.contract, bywiseBlockchain);
        vm.env = env;
        return await vm.execFunction(ctx, limiteCost, name, inputsValues);
    }

    private async exec(ctx: SimulateSliceDTO, isMainnet: boolean, limiteCost: number): Promise<{ cost: number, env: string, logs: string[] }> {
        try {
            if (this.env.contract.address !== Compiler.getBywiseAddress(isMainnet, this.env.contract.nonce, this.env.contract.bytecode)) throw new Error(`invalid address of contract`);
            let code = this.decodeBytecode(this.env.contract.bytecode);
            this.env.code = code;
            let endCommandSignal = this.getBytecodeByName(';');
            let checkpointCommand = this.getBytecodeByName('checkpoint');
            this.env.pointer = 0;
            while (this.env.pointer < code.length - 1) {
                let cmd = this.env.getCommand(endCommandSignal);
                if (cmd[0] === checkpointCommand) {
                    await this.executeCommand(ctx, limiteCost, cmd);
                }
            }
            this.env.pointer = 0;
            while (this.env.pointer < code.length - 1) {
                let cmd = this.env.getCommand(endCommandSignal);
                if (cmd[0] !== checkpointCommand) {
                    await this.executeCommand(ctx, limiteCost, cmd);
                }
            }
            return { cost: this.env.cost, env: this.env.toJSON(), logs: this.env.logs };
        } catch (err: any) {
            if (this.env.contract.debug) {
                if (this.env.contract.names) {
                    this.env.contract.names.forEach((key, value) => {
                        err.message = err.message.replace(` ${value} `, ` ${key} `);
                    })
                }
                throw new Error(`${this.env.contract.debug[this.env.lastPointer]}\n- ${err.message}`);
            }
            throw err;
        }
    }

    private async execFunction(ctx: SimulateSliceDTO, limiteCost: number, name: string, inputsValues: string[]): Promise<ExecutedFunction> {
        try {
            let code = this.decodeBytecode(this.env.contract.bytecode);
            let endCommandSignal = this.getBytecodeByName(';');
            let checkpointCommand = this.getBytecodeByName('checkpoint');
            this.env.code = code;
            for (let i = 0; i < this.env.contract.publicFunctions.length; i++) {
                let func = this.env.contract.publicFunctions[i];
                if (func.name === name) {
                    if (!ctx.tx) {
                        throw new Error(`Transaction context not found`);
                    }
                    if (ctx.tx.amount !== "0" && !func.isPayable) {
                        throw new Error(`function ${name} is not payable`);
                    }
                    if (!func.isPaid && !ctx.simulate) {
                        throw new Error(`function ${name} is not paid`);
                    }
                    let inputs = [];
                    inputs.push(func.addr);
                    if (inputsValues.length > 0) {
                        inputsValues.forEach(input => {
                            inputs.push(Compiler._toBytecode(this.dictionary, input))
                        });
                    } else {
                        inputs.push(this.getBytecodeByName('void'))
                    }
                    inputs.push(this.getBytecodeByName('return'))
                    func.outputs.forEach(out => {
                        inputs.push('000f00000000');
                    })
                    this.executeFunction(true, ctx, this.env, inputs);
                    while (this.env.pointer < code.length - 1) {
                        let cmd = this.env.getCommand(endCommandSignal);
                        if (cmd[0] !== checkpointCommand) {
                            await this.executeCommand(ctx, limiteCost, cmd);
                        }
                    }
                    let executed = new ExecutedFunction();
                    let outputResponse: any = {};
                    this.outputValues.forEach((value, i) => {
                        outputResponse[func.outputs[i].name] = value.toOutput();
                    })
                    executed.output = outputResponse;
                    executed.cost = this.env.cost;
                    executed.logs = this.env.logs;
                    return executed;
                }
            }
            throw new Error(`function ${name} not found`);
        } catch (err: any) {
            console.log(err)
            if (this.env.contract.debug) {
                if (this.env.contract.names) {
                    this.env.contract.names.forEach((key, value) => {
                        err.message = err.message.replace(` ${value} `, ` ${key} `);
                    })
                }
                throw new Error(`${this.env.contract.debug[this.env.lastPointer]}\n- ${err.message}`);
            }
            throw err;
        }
    }

    static getDictionary(): CommandSyntax[] {
        let dictionary: CommandSyntax[] = [];
        const dictionaryJson: any[] = JSON.parse(fs.readFileSync('./src/compiler/vm/dictionary.json', 'utf8'));
        dictionaryJson.forEach(op => {
            let cmdSyntax = new CommandSyntax();
            cmdSyntax.bytecode = op.bytecode;
            cmdSyntax.name = op.name;
            cmdSyntax.description = op.description;
            cmdSyntax.reservedWord = op.reservedWord ? true : false;
            if (op.complements) op.complements.forEach((comp: any) => {
                let complement = new CommandComplement();
                complement.word = comp.word ? comp.word : [];
                complement.size = comp.size ? comp.size : 0;
                cmdSyntax.complements.push(complement);
            })
            dictionary.push(cmdSyntax);
        })
        return dictionary;
    }

    private decodeBytecode(code: string): string[] {
        let commands: string[] = [];
        while (code.length > 0) {
            let size = 4;
            let bytecode = code.substring(0, size);
            let parameter = this.getReservedName(bytecode);
            if (parameter.name === '*') {
                size += 8; // pointer{8}
            } else if (parameter.name === 'constant') {
                let typeBytecode = code.substring(size, size + 4);
                size += 4; // type-constant{4}
                let type = this.getReservedName(typeBytecode);
                let constantSizeBytecode = '0x' + code.substring(size, size + 8);
                let constantSize = Number.parseInt(constantSizeBytecode, 16) * 2;
                size += 8; // length{8}
                size += constantSize; // size-constant{}
            } else if (parameter.name === 'input') {
                let indexHex = code.substring(size, size + 8);
                let index = Number.parseInt(indexHex, 16);
                size += 8; // index input number{8}
            }
            commands.push(code.substring(0, size));
            code = code.substring(size);
        }
        return commands;
    }

    private getBytecodeByName(name: string): string {
        for (let i = 0; i < this.dictionary.length; i++) {
            let dict = this.dictionary[i];
            if (dict.name === name) {
                return dict.bytecode;
            }
        }
        throw new Error(`reserved name "${name}" not found`);
    }

    private findDictionary(bytecode: string): CommandSyntax {
        for (let i = 0; i < this.dictionary.length; i++) {
            let item = this.dictionary[i];
            if (item.bytecode === bytecode && !item.reservedWord) {
                return item;
            }
        }
        throw new Error(`command "${bytecode}" not found`);
    }

    private getReservedName(bytecode: string): CommandSyntax {
        for (let i = 0; i < this.dictionary.length; i++) {
            let dict = this.dictionary[i];
            if (dict.bytecode === bytecode) {
                return dict;
            }
        }
        throw new Error(`reserved name "${bytecode}" not found`);
    }

    private isReservedName(bytecode: string): boolean {
        for (let i = 0; i < this.dictionary.length; i++) {
            let dict = this.dictionary[i];
            if (dict.bytecode === bytecode) {
                return true;
            }
        }
        return false;
    }

    private async executeCommand(ctx: SimulateSliceDTO, limiteCost: number, cmd: string[]) {
        let dict = this.findDictionary(cmd[0]);
        for (let i = 0; i < this.cmds.length; i++) {
            const op = this.cmds[i];
            if (op.name === dict.name) {
                await op.op(ctx, this.env, cmd.slice(1, -1));
                this.env.cost++;
                if (this.env.cost >= limiteCost) {
                    throw new Error(`the fee spending limit has been reached`);
                }
            }
        }
    }

    private initializeOperators() {
        this.addBasicOperations();
        this.addCastOperations();
        this.addMathOperations();
        this.addLogicOperations();
        this.addVectorOperations();
    }

    private executeFunction(isExternal: boolean, ctx: SimulateSliceDTO, env: Environment, inputs: string[]) {
        let nameFunctionBC = inputs[0];
        let nameFunction = this.getRegisterID(nameFunctionBC);
        let func = env.functions.get(nameFunction);
        if (!func) throw new Error(`function ${nameFunction} not found`);
        env.newContext(isExternal);
        let isInputs = true;
        let countVar = 0;
        for (let i = 1; i < inputs.length; i++) {
            let word = inputs[i];
            if (this.isReservedName(word)) {
                let param = this.getReservedName(word).name;
                if (param === 'void') {

                } else if (param === 'return') {
                    isInputs = false;
                    countVar = 0;
                } else {
                    throw new Error(`invalid parameter ${param}`);
                }
            } else {
                if (isInputs) {
                    let value = this.getVar(env.ctx, word).variable;
                    this.checkType(value, func.inputs[countVar]);
                    env.ctx.inputValues.push(value);
                    countVar++;
                } else if (!isExternal) {
                    let registerId = this.getRegisterID(word);
                    let value = this.getVar(env.ctx, word).variable;
                    this.checkType(value, func.outputs[countVar]);
                    countVar++;
                    env.ctx.outputRegisters.push(registerId);
                } else {
                    countVar++;
                    env.ctx.outputRegisters.push('');
                }
            }
        }
        env.ctx.outputs = func.outputs;
        if (func.inputs.length !== env.ctx.inputValues.length) {
            throw new Error(`need input parameters - expected ${func.inputs.length} current ${env.ctx.inputValues.length}`);
        }
        if (func.outputs.length !== env.ctx.outputRegisters.length) {
            throw new Error(`need output parameters - expected ${func.outputs.length} current ${env.ctx.outputRegisters.length}`);
        }
        this.env.pointer = func.pointer;
    }

    private addBasicOperations() {
        this.addOperator(new Operator(
            'nop',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
            }
        ));
        this.addOperator(new Operator(
            'define',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [persistenceBC, typeBC, newVariableBC, valueBC] = inputs;
                let persistence = this.getReservedName(persistenceBC).name;
                let typeName = this.getReservedName(typeBC).name;
                let type = this.validateType(typeName);
                let registerId = this.getRegisterID(newVariableBC);
                let voidValue = this.getBytecodeByName('void');
                if (type === Types.array) {
                    if (voidValue !== valueBC) {
                        throw new Error(`need "void" default value`);
                    } else {
                        this.newArray(env.ctx, persistence, registerId);
                    }
                } else if (type === Types.map) {
                    if (voidValue !== valueBC) {
                        throw new Error(`need "void" default value`);
                    } else {
                        this.newMap(env.ctx, persistence, registerId);
                    }
                } else {
                    if (voidValue === valueBC) {
                        this.newValue(env.ctx, persistence, registerId, new Variable(type, type.defaultValue));
                    } else {
                        let value = this.getVar(env.ctx, valueBC);
                        this.checkType(value.variable, type)

                        this.newValue(env.ctx, persistence, registerId, value.variable);
                    }
                }
            }
        ));
        this.addOperator(new Operator(
            'function',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let privacyFunctionBC = inputs[0];
                let privacyFunction = this.getReservedName(privacyFunctionBC).name;
                let payableFunctionBC = inputs[1];
                let payableFunction = this.getReservedName(payableFunctionBC).name;
                let nameFunctionBC = inputs[2];
                let nameFunction = this.getRegisterID(nameFunctionBC);
                if (!['public', 'private'].includes(privacyFunction)) throw new Error(`privacy function wrong ${privacyFunction}`);
                if (!['payable', 'notpayable'].includes(payableFunction)) throw new Error(`payable function wrong ${payableFunction}`);
                let func = new Function(this.env.pointer, nameFunction, privacyFunction === 'public', payableFunction === 'payable');
                let isInputs = true;
                for (let i = 3; i < inputs.length; i++) {
                    let word = inputs[i];
                    let typeName = this.getReservedName(word).name;
                    if (typeName === 'void') {

                    } else if (typeName === 'return') {
                        isInputs = false;
                    } else if (this.validateType(typeName)) {
                        let type = this.validateType(typeName);
                        if (isInputs) {
                            func.inputs.push(type);
                        } else {
                            func.outputs.push(type);
                        }
                    }
                }
                if (env.functions.has(nameFunction)) throw new Error(`function ${nameFunction} already defined`);
                env.functions.set(nameFunction, func);
                env.gotoEnd(this.getBytecodeByName('end'));

                if (func.isPublic) {
                    let hasABI = false;
                    this.env.contract.publicFunctions.forEach(fabi => {
                        if (fabi.addr === nameFunctionBC) {
                            hasABI = true;
                        }
                    });
                    if (!hasABI) throw new Error(`public function not declared at ABI`);
                }
            }
        ));
        this.addOperator(new Operator(
            'exec',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                this.executeFunction(false, ctx, env, inputs);
            }
        ));
        this.addOperator(new Operator(
            'return',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [valueBD] = inputs;
                let value = this.getVar(env.ctx, valueBD);
                if (env.ctx.outputs.length === 0) {
                    throw new Error(`function not has return`);
                }
                this.checkType(value.variable, env.ctx.outputs[env.ctx.outputValues.length]);
                env.ctx.outputValues.push(value.variable);
            }
        ));
        this.addOperator(new Operator(
            'end',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                if (env.ctx.outputs.length !== env.ctx.outputValues.length)
                    throw new Error(`Wrong number of outputs. current: ${env.ctx.outputValues.length} - expected: ${env.ctx.outputs.length}`);
                for (let i = 0; i < env.ctx.outputRegisters.length; i++) {
                    if (env.ctx.subContext) {
                        if (env.ctx.isExternal) {
                            this.outputValues = env.ctx.outputValues;
                        } else {
                            this.setValue(env.ctx.subContext, env.ctx.outputRegisters[i], env.ctx.outputValues[i]);
                        }
                    } else {
                        throw new Error(`this is not a subroutine`);
                    }
                }
                env.dropContext();
            }
        ));
        this.addOperator(new Operator(
            'mov',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a);

                this.setValue(env.ctx, opRes, opA.variable);
            }
        ));
        this.addOperator(new Operator(
            'print',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let log = inputs.map(word => this.getVar(env.ctx, word).variable.value).join(' ');
                env.logs.push(log);
                console.log('print logs', log);
            }
        ));
        this.addOperator(new Operator(
            'require',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [test, message] = inputs;
                let opTest = this.getVar(env.ctx, test);
                let opMessage = this.getVar(env.ctx, message);
                this.checkType(opTest.variable, Types.boolean);
                this.checkType(opMessage.variable, Types.string);
                if (opTest.variable.value === 'false') {
                    throw new Error(opMessage.variable.value);
                }
            }
        ));
        this.addOperator(new Operator(
            'bywise',
            async (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let nameFunction = this.getVar(env.ctx, inputs[0]);
                this.checkType(nameFunction.variable, Types.string);

                let inputValues: Variable[] = [];
                let outputRegisters: string[] = [];
                let outputValues: Variable[] = [];

                let isInputs = true;
                for (let i = 0; i < inputs.length; i++) {
                    let word = inputs[i];
                    if (this.isReservedName(word)) {
                        let param = this.getReservedName(word).name;
                        if (param === 'void') {
                        } else if (param === 'return') {
                            isInputs = false;
                        } else {
                            throw new Error(`invalid parameter ${param}`);
                        }
                    } else {
                        let value = this.getVar(env.ctx, word);
                        if (isInputs) {
                            inputValues.push(value.variable);
                        } else {
                            let registerId = this.getRegisterID(word);
                            outputRegisters.push(registerId);
                            let value = this.getVar(env.ctx, word);
                            outputValues.push(value.variable);
                        }
                    }
                }
                let returnValues = await this.bywiseBlockchain.executeFunction(ctx, env, nameFunction.variable.value, inputValues);
                for (let index = 0; index < outputRegisters.length; index++) {
                    const registerId = outputRegisters[index];
                    const value = outputValues[index];
                    const returnValue = returnValues[index];
                    if (returnValue === undefined) {
                        throw new Error(`invalid output parameter ${value.value}`);
                    }
                    this.checkType(value, returnValue.type);
                    this.setValue(env.ctx, registerId, returnValue);
                }
            }
        ));
    }

    private addCastOperations() {
        this.addOperator(new Operator(
            'cast',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, typeBC, oldValueName] = inputs;

                let typeName = this.getReservedName(typeBC).name;
                let newType = this.validateType(typeName);
                let opRes = this.getRegisterID(resultVar);
                let resultValue = this.getVar(env.ctx, resultVar).variable;
                this.checkType(resultValue, newType);
                let oldValue = this.getVar(env.ctx, oldValueName).variable;

                let newValue: string | undefined = undefined;
                if (Types.string === newType) {
                    switch (oldValue.type) {
                        case Types.number:
                        case Types.integer:
                        case Types.address:
                        case Types.binary:
                        case Types.boolean:
                        case Types.string:
                            newValue = oldValue.toString();
                    }
                } else if (Types.number === newType) {
                    switch (oldValue.type) {
                        case Types.number:
                            newValue = oldValue.toString();
                            break;
                        case Types.integer:
                            newValue = oldValue.getNumber().toString();
                            break;
                        case Types.address:
                        case Types.binary:
                        case Types.string:
                        case Types.boolean:
                            newValue = oldValue.toString();
                            newValue = newValue === oldValue.type.defaultValue ? '0' : '1';
                            break;
                    }
                } else if (Types.integer === newType) {
                    switch (oldValue.type) {
                        case Types.number:
                        case Types.integer:
                            newValue = oldValue.toString();
                            break;
                        case Types.address:
                        case Types.binary:
                        case Types.string:
                        case Types.boolean:
                            newValue = oldValue.toString();
                            newValue = newValue === oldValue.type.defaultValue ? '0' : '1';
                            break;
                    }
                } else if (Types.address === newType) {
                    switch (oldValue.type) {
                        case Types.address:
                            newValue = oldValue.toString();
                            break;
                        case Types.string:
                            newValue = oldValue.toString();
                            newValue = newValue.replace(/\"/gm, '');
                            if (!this.isAddress(newValue)) {
                                newValue = undefined;
                            }
                            break;
                    }
                } else if (Types.binary === newType) {
                    switch (oldValue.type) {
                        case Types.binary:
                            newValue = oldValue.toString();
                            break;
                    }
                } else if (Types.boolean === newType) {
                    switch (oldValue.type) {
                        case Types.integer:
                        case Types.number:
                            newValue = oldValue.getNumber().isZero() ? 'false' : 'true';
                            break;
                        case Types.address:
                            newValue = this.isZeroAddress(oldValue.toString()) ? 'false' : 'true';
                            break;
                        case Types.binary:
                        case Types.string:
                        case Types.boolean:
                            newValue = oldValue.toString();
                            newValue = newValue === oldValue.type.defaultValue ? 'false' : 'true';
                            break;
                    }
                }
                if (newValue) {
                    resultValue.value = newValue;
                    this.setValue(env.ctx, opRes, resultValue);
                } else {
                    throw new Error(`cant cast ${oldValue.type.name} to ${newType}`)
                }
            }
        ));
    }

    private addMathOperations() {
        this.addOperator(new Operator(
            'equ',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.equ(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'inv',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let resultVal = this.ula.inv(opA);

                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'gt',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.gt(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'gte',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.gte(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'le',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.le(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'lee',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.lee(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'and',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.and(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'or',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.or(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'add',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.add(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'sub',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.sub(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'mul',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.mul(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'div',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.div(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'exp',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.exp(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'fixed',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a, b] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;
                let opB = this.getVar(env.ctx, b).variable;

                let resultVal = this.ula.fixed(opA, opB);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'sqrt',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;

                let resultVal = this.ula.sqrt(opA);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
        this.addOperator(new Operator(
            'abs',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, a] = inputs;

                let opRes = this.getRegisterID(resultVar);
                let opA = this.getVar(env.ctx, a).variable;

                let resultVal = this.ula.abs(opA);
                this.setValue(env.ctx, opRes, resultVal);
            }
        ));
    }

    private addLogicOperations() {
        this.addOperator(new Operator(
            'checkpoint',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [checkpoint] = inputs;
                let registerId = this.getRegisterID(checkpoint);
                if (env.checkpoints.has(registerId)) throw new Error(`checkpoint label ${registerId} already defined`);
                env.checkpoints.set(registerId, env.pointer);
            }
        ));
        this.addOperator(new Operator(
            'jump',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [checkpoint] = inputs;
                let registerId = this.getRegisterID(checkpoint);
                let pointer = env.checkpoints.get(registerId);
                if (pointer === undefined) throw new Error(`checkpoint label ${checkpoint} not found`);
                env.pointer = pointer;
            }
        ));
        this.addOperator(new Operator(
            'jumpif',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [condition, checkpoint] = inputs;
                let registerId = this.getRegisterID(checkpoint);
                let pointer = env.checkpoints.get(registerId);
                if (pointer === undefined) throw new Error(`checkpoint label ${checkpoint} not found`);
                let value = this.getVar(env.ctx, condition).variable;
                this.checkType(value, Types.boolean);
                if (value.value === 'true') {
                    env.pointer = pointer;
                }
            }
        ));
        this.addOperator(new Operator(
            'jumpnif',
            (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [condition, checkpoint] = inputs;
                let registerId = this.getRegisterID(checkpoint);
                let pointer = env.checkpoints.get(registerId);
                if (pointer === undefined) throw new Error(`checkpoint label ${checkpoint} not found`);
                let value = this.getVar(env.ctx, condition).variable;
                this.checkType(value, Types.boolean);
                if (value.value === 'false') {
                    env.pointer = pointer;
                }
            }
        ));
    }

    private addVectorOperations() {
        this.addOperator(new Operator(
            'push',
            async (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [arrayBC, valueBC, indexBC] = inputs;
                let array = this.getVar(env.ctx, arrayBC);
                let value = this.getVar(env.ctx, valueBC);
                let voidValue = this.getBytecodeByName('void');
                let index = undefined;
                if (voidValue !== indexBC) {
                    let value = this.getVar(env.ctx, indexBC);
                    this.checkType(value.variable, Types.integer);
                    index = value.variable.getNumber().toNumber();
                }
                await this.pushArray(ctx, env, array, value.variable, index);
            }
        ));
        this.addOperator(new Operator(
            'set',
            async (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [mapBC, valueBC, indexBC] = inputs;
                let map = this.getVar(env.ctx, mapBC);
                let value = this.getVar(env.ctx, valueBC);
                let index = this.getVar(env.ctx, indexBC);
                await this.setMap(ctx, env, map, value.variable, index.variable);
            }
        ));
        this.addOperator(new Operator(
            'pop',
            async (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, arrayBC, indexBC] = inputs;

                let array = this.getVar(env.ctx, arrayBC);
                let voidValue = this.getBytecodeByName('void');
                let index = undefined;
                if (voidValue !== indexBC) {
                    let value = this.getVar(env.ctx, indexBC);
                    this.checkType(value.variable, Types.integer);
                    index = value.variable.getNumber().toNumber();
                }
                let value = await this.popArray(ctx, env, array, index);
                let opRes = this.getRegisterID(resultVar);
                this.setValue(env.ctx, opRes, value);
            }
        ));
        this.addOperator(new Operator(
            'delete',
            async (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [arrayOrMapBC, indexBC] = inputs;

                let arrayOrMap = this.getVar(env.ctx, arrayOrMapBC);
                let index = this.getVar(env.ctx, indexBC);

                if (arrayOrMap.variable.type === Types.array) {
                    this.checkType(index.variable, Types.integer);
                    let indexN = index.variable.getNumber().toNumber();
                    await this.popArray(ctx, env, arrayOrMap, indexN);
                } else if (arrayOrMap.variable.type === Types.map) {
                    await this.delMap(ctx, env, arrayOrMap, index.variable);
                } else {
                    throw new Error(`variable ${indexBC} is not array or mapping`);
                }
            }
        ));
        this.addOperator(new Operator(
            'has',
            async (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, mapBC, indexBC] = inputs;
                let map = this.getVar(env.ctx, mapBC);
                let index = this.getVar(env.ctx, indexBC);
                this.checkType(map.variable, Types.map);
                let value = await this.hasMap(ctx, env, map, index.variable);
                let opRes = this.getRegisterID(resultVar);
                this.setValue(env.ctx, opRes, value);
            }
        ));
        this.addOperator(new Operator(
            'get',
            async (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, arrayOrMapBC, indexBC] = inputs;
                let arrayOrMap = this.getVar(env.ctx, arrayOrMapBC);
                let index = this.getVar(env.ctx, indexBC).variable;
                let value;
                if (arrayOrMap.variable.type === Types.array) {
                    this.checkType(index, Types.integer);
                    let indexN = index.getNumber().toNumber();
                    value = await this.getArrayValue(ctx, env, arrayOrMap, indexN);
                } else if (arrayOrMap.variable.type === Types.map) {
                    value = await this.getMap(ctx, env, arrayOrMap, index);
                } else {
                    throw new Error(`variable ${indexBC} is not array or mapping`);
                }
                let opRes = this.getRegisterID(resultVar);
                this.setValue(env.ctx, opRes, value);
            }
        ));
        this.addOperator(new Operator(
            'size',
            async (ctx: SimulateSliceDTO, env: Environment, inputs: string[]) => {
                let [resultVar, arrayBC] = inputs;

                let array = this.getVar(env.ctx, arrayBC);
                let value = await this.getSizeArray(ctx, env, array);

                let opRes = this.getRegisterID(resultVar);
                this.setValue(env.ctx, opRes, value);
            }
        ));
    }

    private isRegisterID(register: string): boolean {
        let size = 4;
        let bytecode = register.substring(0, size);
        let parameter = this.getReservedName(bytecode);
        if (parameter.name === '*' && register.length === 12) {
            return true;
        } else {
            return false;
        }
    }

    private getRegisterID(register: string): string {
        let size = 4;
        let bytecode = register.substring(0, size);
        let parameter = this.getReservedName(bytecode);
        if (parameter.name === '*' && register.length === 12) {
            return register.substring(4, 12);
        } else {
            throw new Error(`invalid register ${register}`);
        }
    }

    private checkType(value: Variable, type: Types) {
        if (value.type !== type) throw new Error(`invalid type ${value.type} - need ${type}`);
    }

    private getVar(ctx: Context, variableBC: string): VariableMeta {
        let size = 4;
        let bytecode = variableBC.substring(0, size);
        let parameter = this.getReservedName(bytecode);
        if (parameter.name === 'input') {
            let indexHex = variableBC.substring(4, 12);
            let index = Number.parseInt(indexHex, 16);
            let variable = this.getInputValue(ctx, index);
            return new VariableMeta(variable);
        } else if (parameter.name === '*') {
            let registerId = variableBC.substring(4, 12);
            return this.getValue(ctx, registerId);
        } else if (parameter.name === 'constant') {
            let typeBC = variableBC.substring(4, 8);
            let valueBC = variableBC.substring(16);
            let typeName = this.getReservedName(typeBC).name;
            let type = this.validateType(typeName);
            let value;
            if (type === Types.boolean) {
                value = valueBC === '01' ? 'true' : 'false';
            } else if (type === Types.binary) {
                value = valueBC;
            } else {
                value = Buffer.from(valueBC, 'hex').toString('utf-8');
            }
            return new VariableMeta(new Variable(type, value));
        } else {
            throw new Error(`invalid register ${variableBC}`);
        }
    }



    private isAddress(address: string) {
        return address === 'BWS0000000000000000000000000000000000000000000' || !/^BWS[0-9]+[MT][CU][0-9a-fA-F]{40}[0-9a-fA-F]{0, 43}$/.test(address);
    }

    private isZeroAddress(address: string) {
        return address === 'BWS0000000000000000000000000000000000000000000';
    }

    private validateType(value: string): Type {
        let type = Types.getType(value);
        if (type) {
            return type;
        }
        throw new Error(`invalid type ${value}`)
    }

    private addOperator(op: Operator) {
        this.cmds.push(op);
    }

    private _getValue(ctx: Context, registerId: string): VariableMeta | undefined {
        if (registerId.length !== 8) throw new Error(`invalid length register ${registerId}`);
        let v = ctx.variables.get(registerId);
        if (v) {
            return new VariableMeta(v, false, registerId);
        }
        v = ctx.globalVariables.get(registerId);
        if (v) {
            return new VariableMeta(v, true, registerId);
        }
        if (ctx.subContext) {
            return this._getValue(ctx.subContext, registerId);
        } else {
            return undefined;
        }
    }

    private getInputValue(ctx: Context, index: number): Variable {
        if (index < ctx.inputValues.length) {
            return ctx.inputValues[index];
        } else {
            throw new Error(`input ${index} not found`);
        }
    }

    private getValue(ctx: Context, registerId: string): VariableMeta {
        let v = this._getValue(ctx, registerId);
        if (v) {
            return v;
        } else {
            throw new Error(`variable ${registerId} not found`);
        }
    }

    private newValue(ctx: Context, persistence: string, registerId: string, value: Variable) {
        let v = ctx.variables.get(registerId);
        if (v) {
            throw new Error(`variable ${registerId} already defined`);
        }
        v = ctx.globalVariables.get(registerId);
        if (v) {
            throw new Error(`variable ${registerId} already defined`);
        }
        if (persistence === 'global') {
            ctx.globalVariables.set(registerId, value);
        } else {
            ctx.variables.set(registerId, value);
        }
    }

    private setValue(ctx: Context, registerId: string, value: Variable) {
        let v = this.getValue(ctx, registerId).variable;
        if (v.type !== value.type) {
            if (v.type.isNumber && value.type.isNumber) {
                v.value = value.getNumber().toFixed(0, BigNumber.ROUND_FLOOR);
            } else {
                throw new Error(`cant cast ${value.type.name} to ${v.type.name}`)
            }
        } else {
            v.value = value.value;
        }
    }

    private newArray(ctx: Context, persistence: string, registerId: string) {
        let value;
        if (persistence === 'global') {
            value = new Variable(Types.array, 'global');
        } else {
            value = new Variable(Types.array, '[]');
        }
        this.newValue(ctx, persistence, registerId, value);
    }

    private async getArrayValue(ctx: SimulateSliceDTO, env: Environment, array: VariableMeta, index: number): Promise<Variable> {
        if (array.isGlobal) {
            if (!array.registerId) throw new Error(`register id not found of global array`);
            let value = await this.bywiseBlockchain.getArray(ctx, env, array.registerId, index);
            if (value !== null) {
                return value;
            }
        } else {
            this.checkType(array.variable, Types.array);
            let vs: any[] = JSON.parse(array.variable.value);
            if (index < vs.length) {
                let jsonVar = vs[index];
                let type = Types.getType(jsonVar.type);
                if (!type) throw new Error(`invalid type "${jsonVar.type}" at ${array.registerId} [${index}]`);
                return new Variable(type, jsonVar.value);
            }
        }
        throw new Error(`variable ${array.registerId} [${index}] not found`);
    }

    private async getSizeArray(ctx: SimulateSliceDTO, env: Environment, array: VariableMeta): Promise<Variable> {
        if (array.isGlobal) {
            if (!array.registerId) throw new Error(`register id not found of global array`);
            let value = await this.bywiseBlockchain.getArrayLength(ctx, env, array.registerId);
            return new Variable(Types.integer, `${value}`);
        } else {
            this.checkType(array.variable, Types.array);
            let vs: any[] = JSON.parse(array.variable.value);
            return new Variable(Types.integer, `${vs.length}`);
        }
    }

    private async pushArray(ctx: SimulateSliceDTO, env: Environment, array: VariableMeta, value: Variable, index: number | undefined) {
        if (array.isGlobal) {
            if (!array.registerId) throw new Error(`register id not found of global array`);
            await this.bywiseBlockchain.pushArray(ctx, env, array.registerId, value, index);
            return;
        } else {
            this.checkType(array.variable, Types.array);
            let vs: any[] = JSON.parse(array.variable.value);
            if (index !== undefined) {
                index = Math.floor(index);
                if (index >= 0) {
                    vs = [...vs.slice(0, index), value, ...vs.slice(index)];
                } else {
                    throw new Error(`invalid index ${index}`);
                }
            } else {
                vs.push(value);
            }
            array.variable.value = JSON.stringify(vs);
            return;
        }
        throw new Error(`variable ${array.registerId} [${index}] not found`);
    }

    private async popArray(ctx: SimulateSliceDTO, env: Environment, array: VariableMeta, index: number | undefined): Promise<Variable> {
        if (array.isGlobal) {
            if (!array.registerId) throw new Error(`register id not found of global array`);
            return await this.bywiseBlockchain.popArray(ctx, env, array.registerId, index);
        } else {
            this.checkType(array.variable, Types.array);
            let vs: any[] = JSON.parse(array.variable.value);
            let jsonVar;
            if (index !== undefined) {
                jsonVar = vs[index];
                index = Math.floor(index);
                if (index >= 0) {
                    vs = [...vs.slice(0, index), ...vs.slice(index + 1)];
                } else {
                    throw new Error(`invalid index ${index}`);
                }
            } else {
                jsonVar = vs.pop();
            }
            array.variable.value = JSON.stringify(vs);
            let type = Types.getType(jsonVar.type);
            if (!type) throw new Error(`invalid type "${jsonVar.type}" at ${array.registerId} [${index}]`);
            return new Variable(type, jsonVar.value);
        }
        throw new Error(`variable ${array.registerId} [${index}] not found`);
    }

    private async delMap(ctx: SimulateSliceDTO, env: Environment, array: VariableMeta, index: Variable): Promise<void> {
        let key = `${index.type}:${index.value}`;
        if (array.isGlobal) {
            if (!array.registerId) throw new Error(`register id not found of global array`);
            await this.bywiseBlockchain.delMap(ctx, env, array.registerId, key);
        } else {
            this.checkType(array.variable, Types.map);
            let vs: any = JSON.parse(array.variable.value);
            vs[key] = undefined;
            array.variable.value = JSON.stringify(vs);
        }
    }

    private async setMap(ctx: SimulateSliceDTO, env: Environment, array: VariableMeta, value: Variable, index: Variable): Promise<void> {
        let key = `${index.type}:${index.value}`;
        if (array.isGlobal) {
            if (!array.registerId) throw new Error(`register id not found of global array`);
            await this.bywiseBlockchain.setMap(ctx, env, array.registerId, key, value);
        } else {
            this.checkType(array.variable, Types.map);
            let vs: any = JSON.parse(array.variable.value);
            vs[key] = value;
            array.variable.value = JSON.stringify(vs);
        }
    }

    private async hasMap(ctx: SimulateSliceDTO, env: Environment, array: VariableMeta, index: Variable): Promise<Variable> {
        let key = `${index.type}:${index.value}`;
        if (array.isGlobal) {
            if (!array.registerId) throw new Error(`register id not found of global array`);
            let value = await this.bywiseBlockchain.getMap(ctx, env, array.registerId, key);
            if (value !== null) {
                return new Variable(Types.boolean, 'true');
            }
        } else {
            this.checkType(array.variable, Types.map);
            let vs: any = JSON.parse(array.variable.value);
            let jsonVar = vs[key];
            return new Variable(Types.boolean, `${jsonVar !== undefined}`);
        }
        return new Variable(Types.boolean, 'false');
    }

    private async getMap(ctx: SimulateSliceDTO, env: Environment, array: VariableMeta, index: Variable): Promise<Variable> {
        let key = `${index.type}:${index.value}`;
        if (array.isGlobal) {
            if (!array.registerId) throw new Error(`register id not found of global array`);
            let value = await this.bywiseBlockchain.getMap(ctx, env, array.registerId, key);
            if (value !== null) {
                return value;
            }
        } else {
            this.checkType(array.variable, Types.map);
            let vs: any = JSON.parse(array.variable.value);
            let jsonVar = vs[key];
            if (jsonVar) {
                let type = Types.getType(jsonVar.type);
                if (!type) throw new Error(`invalid type "${jsonVar.type}" at ${array.registerId} [${index}]`);
                return new Variable(type, jsonVar.value);
            }
        }
        throw new Error(`variable ${array.registerId} [${index.value}] not found`);
    }

    private newMap(ctx: Context, persistence: string, registerId: string) {
        let value;
        if (persistence === 'global') {
            value = new Variable(Types.map, 'global');
        } else {
            value = new Variable(Types.map, '{}');
        }
        this.newValue(ctx, persistence, registerId, value);
    }
}