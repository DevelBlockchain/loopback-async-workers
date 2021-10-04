import { Count, Filter, Where } from '@loopback/repository';
import { Employees } from '../models';
import { EmployeesRepository } from '../repositories';
export declare class EmployeesController {
    employeesRepository: EmployeesRepository;
    constructor(employeesRepository: EmployeesRepository);
    count(where?: Where<Employees>): Promise<Count>;
    find(filter?: Filter<Employees>): Promise<Employees[]>;
    findById(address: string): Promise<Employees>;
}
