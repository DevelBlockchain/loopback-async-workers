import { SimulateSliceDTO } from "../../types";
import { Environment, Variable } from "../vm/data";
import { BywiseBlockchainInterface } from "./bywise-blockchain";

export class BywiseBlockchainDebug implements BywiseBlockchainInterface {

    async saveEnvironment(ctx: SimulateSliceDTO, env: Environment): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async executeFunction(ctx: SimulateSliceDTO, env: Environment, name: string, inputs: Variable[]): Promise<Variable[]> {
        if(name === 'print') {
            console.log('Execute funtion on bywise inteface', inputs.map(v => v.value).join(' '))
            return [];
        }
        throw new Error("Method not implemented.");
    }

}