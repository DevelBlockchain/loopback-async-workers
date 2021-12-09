import { SimulateSliceDTO } from "../../types";
import { Environment, Type, Variable } from "../vm/data";

export interface BywiseBlockchainInterface {
    saveEnvironment(ctx: SimulateSliceDTO, env: Environment): Promise<void>;
    executeFunction(ctx: SimulateSliceDTO, env: Environment, name:string, inputs: Variable[]): Promise<Variable[]>;

    /*transferBWS(to: Variable, amount: Variable): void;
    balanceOfBWS(address: Variable): void;
    getSender(): Variable;
    verifySignature(address: Variable, data: Variable, signature: Variable): void;*/

    newArray(ctx: SimulateSliceDTO, env: Environment, registerId: string, type: Type): Promise<void>;
    pushArray(ctx: SimulateSliceDTO, env: Environment, registerId: string, index: bigint, value: Variable): Promise<void>;
    popArray(ctx: SimulateSliceDTO, env: Environment, registerId: string, index: bigint): Promise<Variable>;
    getArrayLength(ctx: SimulateSliceDTO, env: Environment, registerId: string, index: Variable): Promise<bigint>;
    setArray(ctx: SimulateSliceDTO, env: Environment, registerId: string, index: bigint, value: Variable): Promise<void>;
    getArray(ctx: SimulateSliceDTO, env: Environment, registerId: string, index: bigint): Promise<Variable>;

    setMap(ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string, value: Variable): Promise<void>;
    getMap(ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string): Promise<Variable | null>;
    delMap(ctx: SimulateSliceDTO, env: Environment, registerId: string, key: string): Promise<void>;
}