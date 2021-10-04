import { Entity } from '@loopback/repository';
export declare class Companies extends Entity {
    id: string;
    address: string;
    name?: string;
    description?: string;
    logo?: string;
    url?: string;
    info?: object;
    created: string;
    walletsId: string;
    constructor(data?: Partial<Companies>);
}
export interface CompaniesRelations {
}
export declare type CompaniesWithRelations = Companies & CompaniesRelations;
