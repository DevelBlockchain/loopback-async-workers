import { Entity } from '@loopback/repository';
import { Slices } from './slices.model';
export declare class Blocks extends Entity {
    id: string;
    height: number;
    numberOfTransactions: number;
    version: string;
    merkleRoot: string;
    lastHash: string;
    created: string;
    hash: string;
    sign: string;
    externalHash: string;
    externalURL: string;
    slices: Slices[];
    constructor(data?: Partial<Blocks>);
}
export interface BlocksRelations {
}
export declare type BlockWithRelations = Blocks & BlocksRelations;
