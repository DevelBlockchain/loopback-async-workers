import { Entity } from '@loopback/repository';
export declare class Employees extends Entity {
    id: string;
    address: string;
    name?: string;
    description?: string;
    logo?: string;
    url?: string;
    info?: object;
    created: string;
    walletsId: string;
    companiesId: string;
    constructor(data?: Partial<Employees>);
}
export interface EmployeesRelations {
}
export declare type EmployeesWithRelations = Employees & EmployeesRelations;
