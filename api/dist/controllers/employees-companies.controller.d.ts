import { Companies } from '../models';
import { EmployeesRepository } from '../repositories';
export declare class EmployeesCompaniesController {
    employeesRepository: EmployeesRepository;
    constructor(employeesRepository: EmployeesRepository);
    getCompanies(address: string): Promise<Companies>;
}
