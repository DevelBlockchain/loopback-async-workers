import { CommandSyntax, ContractABI, FunctionABI, ParameterABI } from "./data";
import { base16Decode, base16Encode, base58Encode, sha256 } from '@waves/ts-lib-crypto';
import { BywiseHelper } from '@bywise/web3';

export default class Compiler {

    dictionary: CommandSyntax[];
    addresses: string[] = [];
    inputs: string[] = [];
    outputs: string[] = [];
    description: string = '';
    isPaid: boolean = false;
    publicFunctions: FunctionABI[] = [];

    constructor(dictionary: CommandSyntax[]) {
        this.dictionary = dictionary;
    }

    private static numberToHex(number: number) {
        let hex = number.toString(16);
        if ((hex.length % 2) > 0) {
            hex = "0" + hex;
        }
        while (hex.length < 8) {
            hex = "00" + hex;
        }
        if (hex.length > 8 || number < 0) {
            throw new Error(`invalid pointer "${number}"`);
        }
        return hex;
    }

    private static getBytecodeByName(dictionary: CommandSyntax[], name: string): string {
        for (let i = 0; i < dictionary.length; i++) {
            let dict = dictionary[i];
            if (dict.name === name) {
                return dict.bytecode;
            }
        }
        throw new Error(`reserved name "${name}" not found`);
    }

    private findDictionary(name: string): CommandSyntax {
        for (let i = 0; i < this.dictionary.length; i++) {
            let item = this.dictionary[i];
            if (item.name === name && !item.reservedWord) {
                return item;
            }
        }
        throw new Error(`command "${name}" not found`);
    }

    private static getReservedName(dictionary: CommandSyntax[], name: string): CommandSyntax | undefined {
        for (let i = 0; i < dictionary.length; i++) {
            let dict = dictionary[i];
            if (dict.name === name) {
                return dict;
            }
        }
        return undefined;
    }

    static _toBytecode(dictionary: CommandSyntax[], word: string, addresses?: string[]): string {
        let dict = Compiler.getReservedName(dictionary, word);
        let bytecodeConstant = Compiler.getBytecodeByName(dictionary, 'constant');
        if (dict && dict.reservedWord) {
            return dict.bytecode;
        } else if (/^(true|false)$/.test(word.toLowerCase())) {
            return bytecodeConstant + Compiler.getBytecodeByName(dictionary, 'boolean') + Compiler.numberToHex(1) + (word.toLowerCase() === 'true' ? '01' : '00')
        } else if (/^input\[[0-9]+\]$/.test(word)) {
            let index = parseInt(word.substring(6, word.length - 1));
            return Compiler.getBytecodeByName(dictionary, 'input') + Compiler.numberToHex(index);
        } else if (word.startsWith('BWS')) {
            let hex = Buffer.from(word, 'utf-8').toString('hex');
            return bytecodeConstant + Compiler.getBytecodeByName(dictionary, 'address') + Compiler.numberToHex(hex.length / 2) + hex;
        } else if (/^\".*\"$/.test(word)) {
            let hex = word.substring(1, word.length - 1);
            hex = Buffer.from(hex, 'utf-8').toString('hex');
            return bytecodeConstant + Compiler.getBytecodeByName(dictionary, 'string') + Compiler.numberToHex(hex.length / 2) + hex;
        } else if (/^0x[0-9a-fA-F]*$/.test(word)) {
            let hex = word.substring(2);
            return bytecodeConstant + Compiler.getBytecodeByName(dictionary, 'binary') + Compiler.numberToHex(hex.length / 2) + hex;
        } else if (/^[\-]{0,1}[0-9]+$/.test(word.toLowerCase())) {
            let hex = Buffer.from(word, 'utf-8').toString('hex');
            return bytecodeConstant + Compiler.getBytecodeByName(dictionary, 'integer') + Compiler.numberToHex(hex.length / 2) + hex;
        } else if (/^[\-]{0,1}[0-9]+(\.[0-9]+)?[fF]$/.test(word.toLowerCase())) {
            let hex = word.replace('f', '').replace('F', '');
            hex = Buffer.from(hex, 'utf-8').toString('hex');
            return bytecodeConstant + Compiler.getBytecodeByName(dictionary, 'number') + Compiler.numberToHex(hex.length / 2) + hex;
        } else if (/^[a-zA-Z_]\w*$/.test(word) && addresses !== undefined) {
            for (let i = 0; i < addresses.length; i++) {
                if (addresses[i] === word) {
                    return Compiler.getBytecodeByName(dictionary, '*') + this.numberToHex(i + 1);
                }
            }
            addresses.push(word);
            return Compiler.getBytecodeByName(dictionary, '*') + this.numberToHex(addresses.length);
        }
        throw new Error(`invalid parameter ${word}`)
    }

    private toBytecode(lineNumber: number, word: string, bytecodeArray: string[], debugArray: string[]) {
        let bytecode = Compiler._toBytecode(this.dictionary, word, this.addresses);
        this.addBytecode(lineNumber, bytecodeArray, debugArray, bytecode, `parameter ${word}`);
    }

    private addBytecode(lineNumber: number, bytecodeArray: string[], debugArray: string[], bytecode: string, debugMassage: string) {
        bytecodeArray.push(bytecode)
        debugArray.push(`line ${lineNumber + 1} - ${debugMassage}`);
    }

    public static getBywiseAddress(isMainnet: boolean, nonce: number, bytecode: string): string {
        let hexNonce = Compiler.numberToHex(nonce);
        let hex = hexNonce + bytecode;
        let address = '0x' + base16Encode(sha256(sha256(base16Decode(hex)))).toUpperCase().substring(0, 40);
        return BywiseHelper.encodeBWSAddress(isMainnet, true, address)
    }

    private compileCommand(lineNumber: number, line: string[], cmd: CommandSyntax, bytecodeArray: string[], debugArray: string[]) {
        this.addBytecode(lineNumber, bytecodeArray, debugArray, cmd.bytecode, `command ${cmd.name}`);
        if (cmd.complements.length > 0) {
            let compIndex = 0;
            let complement;
            let nextComplement;
            let nextWord;
            let countParans = 0;
            if (line[line.length - 1] !== ';') {
                throw new Error(`syntax error - expected ";"`)
            }
            for (let i = 1; i < line.length; i++) {
                complement = cmd.complements[compIndex];
                let word = line[i];
                if (compIndex + 1 < cmd.complements.length) {
                    nextComplement = cmd.complements[compIndex + 1];
                } else {
                    nextComplement = undefined;
                }
                if (i + 1 < line.length) {
                    nextWord = line[i + 1];
                } else {
                    nextWord = '';
                }
                countParans++;
                this.toBytecode(lineNumber, word, bytecodeArray, debugArray);
                if (complement === undefined && word === ';') {
                    break;
                }
                if (complement === undefined) {
                    throw new Error(`syntax error`)
                }
                if (complement.size && complement.word.length > 0 && !complement.word.includes(word)) {
                    throw new Error(`invalid parameter "${word}" - choose one of these options: ${complement.word.join(', ')}`)
                }
                if (word === ';' ||
                    complement.size && complement.size === countParans ||
                    !complement.size && nextComplement && nextComplement.word.length > 0 && nextComplement.word.includes(nextWord)) {
                    compIndex++;
                    countParans = 0;
                }
            }
            if (compIndex < cmd.complements.length - 1) {
                throw new Error(`syntax error`)
            }
        } else if (line.length > 2) {
            throw new Error(`comand ${line[0]} not need parans`)
        } else {
            this.toBytecode(lineNumber, ';', bytecodeArray, debugArray);
        }
        if (line[0] === 'function' && line[1] === 'public') {
            let isPayable = line[2] === 'payable';
            let func = new FunctionABI(Compiler._toBytecode(this.dictionary, line[3], this.addresses), line[3], isPayable, this.isPaid, this.description);
            let isInputs = true;
            for (let i = 4; i < line.length; i++) {
                let word = line[i];
                if (word === 'void' || word === ';') {

                } else if (word === 'return') {
                    isInputs = false;
                } else if (isInputs) {
                    if (this.inputs[func.inputs.length] === undefined) throw new Error(`set inputs names of ${line[3]} function`)
                    func.inputs.push(new ParameterABI(word, this.inputs[func.inputs.length]));
                } else {
                    if (this.outputs[func.outputs.length] === undefined) throw new Error(`set outputs names of ${line[3]} function`)
                    func.outputs.push(new ParameterABI(word, this.outputs[func.outputs.length]));
                }
            }
            this.publicFunctions.push(func);
            this.inputs = []
            this.outputs = []
            this.description = ''
            this.isPaid = false;
        }
    }

    compilerASM(isMainnet: boolean, codeString: string): ContractABI {
        let code = codeString.split('\n').map((line, lineNumber) => {
            line = line.trim();
            let words: string[] = [];
            let word = '';
            let isString = false;
            let ignoreNextChar = false;
            for (let i = 0; i < line.length; i++) {
                let char = line[i];
                if (char === '#' && !isString) {
                    break;
                } else if (char === ';' && !isString) {
                    if (word !== '') {
                        words.push(word);
                    }
                    words.push(';');
                    word = '';
                    char = '';
                } else if (char === ' ' && !isString) {
                    if (word !== '') {
                        words.push(word);
                    }
                    word = '';
                    char = '';
                } else if (char === '"' && !isString) {
                    isString = true
                } else if (char === '\\' && isString && !ignoreNextChar) {
                    ignoreNextChar = true;
                    char = '';
                } else if (char === '"' && isString && !ignoreNextChar) {
                    isString = false
                }
                word += char;
                if (char !== '') {
                    ignoreNextChar = false;
                }
            }
            if (isString) {
                throw new Error(`line ${lineNumber + 1} - syntax error - expected "`)
            }
            if (word !== '') {
                words.push(word);
            }
            if (words.length > 0 && words[words.length - 1] !== ';') {
                words.push(';');
            }
            return words;
        });
        let bytecode: string[] = [];
        let debug: string[] = [];

        for (let lineNumber = 0; lineNumber < code.length; lineNumber++) {
            let line = code[lineNumber];
            if (line.length > 0) {
                try {
                    if (line[0] === '@paid') {
                        this.isPaid = true;
                    } else if (line[0] === '@input') {
                        let name = line.slice(1, -1).join(' ');
                        if (!/^[a-zA-Z_]\w*$/.test(name)) throw new Error(`invalid name ${name}`)
                        this.inputs.push(name);
                    } else if (line[0] === '@output') {
                        let name = line.slice(1, -1).join(' ');
                        if (!/^[a-zA-Z_]\w*$/.test(name)) throw new Error(`invalid name ${name}`)
                        this.outputs.push(name);
                    } else if (line[0] === '@description') {
                        let description = line.slice(1, -1).join(' ');
                        if (!/^".*"$/.test(description)) throw new Error(`description need string`)
                        this.description = description.substring(1, description.length - 1);
                    } else {
                        let command = this.findDictionary(line[0]);
                        this.compileCommand(lineNumber, line, command, bytecode, debug);
                    }
                } catch (err: any) {
                    throw new Error(`Error: line ${lineNumber + 1} - ${err.message}`)
                }
            }
        }
        let variablesNames = new Map<string, string>()
        this.addresses.forEach((addr, i) => {
            variablesNames.set(Compiler.numberToHex(i + 1), addr);
        })
        let contract = new ContractABI();
        contract.bytecode = bytecode.join('');
        contract.debug = debug;
        contract.names = variablesNames;
        contract.nonce = Math.round(Math.random() * 100000000);
        contract.address = Compiler.getBywiseAddress(isMainnet, contract.nonce, contract.bytecode);
        contract.publicFunctions = this.publicFunctions;
        return contract;
    }
}