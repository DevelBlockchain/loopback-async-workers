import { SimulateSliceDTO } from "../../types";
import { Environment, Type, Variable } from "../vm/data";

export interface BywiseBlockchainInterface {
    executeFunction(ctx: SimulateSliceDTO, env: Environment, name:string, inputs: Variable[]): Promise<Variable[]>;

    pushArray(ctx: SimulateSliceDTO, env: Environment, registerId: string, value: Variable, index: number | undefined): Promise<void>;
    popArray(ctx: SimulateSliceDTO, env: Environment, registerId: string, index: number | undefined): Promise<Variable>;
    getArrayLength(ctx: SimulateSliceDTO, env: Environment, registerId: string): Promise<number>;
    getArray(ctx: SimulateSliceDTO, env: Environment, registerId: string, index: number): Promise<Variable | null>;

    setMap(ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string, value: Variable): Promise<void>;
    getMap(ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string): Promise<Variable | null>;
    delMap(ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string): Promise<void>;
}