import { Count, Filter, Where } from '@loopback/repository';
import { Companies } from '../models';
import { CompaniesRepository } from '../repositories';
export declare class CompaniesController {
    companiesRepository: CompaniesRepository;
    constructor(companiesRepository: CompaniesRepository);
    count(where?: Where<Companies>): Promise<Count>;
    find(filter?: Filter<Companies>): Promise<Companies[]>;
    findById(address: string): Promise<Companies>;
}
