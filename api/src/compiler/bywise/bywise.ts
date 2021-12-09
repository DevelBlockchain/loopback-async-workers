import { ContractsVars } from "../../models";
import { ContractsVarsProvider } from "../../services/contracts-vars.service";
import { SimulateSliceDTO } from "../../types";
import { Environment, Type, Variable } from "../vm/data";
import { BywiseBlockchainInterface } from "./bywise-blockchain";

export class BywiseBlockchainDebug implements BywiseBlockchainInterface {
    contractsVarsProvider: ContractsVarsProvider

    constructor(contractsVarsProvider: ContractsVarsProvider) {
        this.contractsVarsProvider = contractsVarsProvider;
    }

    async saveEnvironment(ctx: SimulateSliceDTO, env: Environment): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async executeFunction(ctx: SimulateSliceDTO, env: Environment, name: string, inputs: Variable[]): Promise<Variable[]> {
        if (name === 'print') {
            console.log('Execute funtion on bywise inteface', inputs.map(v => v.value).join(' '))
            return [];
        }
        throw new Error("Method not implemented.");
    }

    newArray = async (ctx: SimulateSliceDTO, env: Environment, name: string, type: Type): Promise<void> => {
        throw new Error("Method not implemented")
    }
    pushArray = async (ctx: SimulateSliceDTO, env: Environment, name: string, index: bigint, value: Variable): Promise<void> => {
        throw new Error("Method not implemented")
    }
    popArray = async (ctx: SimulateSliceDTO, env: Environment, name: string, index: bigint): Promise<Variable> => {
        throw new Error("Method not implemented")
    }
    getArrayLength = async (ctx: SimulateSliceDTO, env: Environment, name: string, index: Variable): Promise<bigint> => {
        throw new Error("Method not implemented")
    }
    setArray = async (ctx: SimulateSliceDTO, env: Environment, name: string, index: bigint, value: Variable): Promise<void> => {
        throw new Error("Method not implemented")
    }
    getArray = async (ctx: SimulateSliceDTO, env: Environment, name: string, index: bigint): Promise<Variable> => {
        throw new Error("Method not implemented")
    }

    setMap = async (ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string, value: Variable): Promise<void> => {
        throw new Error("Method not implemented")
    }
    getMap = async (ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string): Promise<Variable | null> => {
        throw new Error("Method not implemented")
    }
    hasMap = async (ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string): Promise<Variable> => {
        throw new Error("Method not implemented")
    }
    delMap = async (ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string): Promise<void> => {
        throw new Error("Method not implemented")
    }
}