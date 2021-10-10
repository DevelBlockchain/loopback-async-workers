import { SimulateSliceDTO } from "../../types";
import { Environment, Variable } from "../vm/data";

export interface BywiseBlockchainInterface {
    saveEnvironment(ctx: SimulateSliceDTO, env: Environment): Promise<void>;
    executeFunction(ctx: SimulateSliceDTO, env: Environment, name:string, inputs: Variable[]): Promise<Variable[]>;
}