import { Wallets } from '../models';
import { EmployeesRepository } from '../repositories';
export declare class EmployeesWalletsController {
    employeesRepository: EmployeesRepository;
    constructor(employeesRepository: EmployeesRepository);
    getWallets(address: string): Promise<Wallets>;
}
