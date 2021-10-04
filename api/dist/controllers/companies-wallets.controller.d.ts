import { Wallets } from '../models';
import { CompaniesRepository } from '../repositories';
export declare class CompaniesWalletsController {
    companiesRepository: CompaniesRepository;
    constructor(companiesRepository: CompaniesRepository);
    getWallets(address: string): Promise<Wallets>;
}
