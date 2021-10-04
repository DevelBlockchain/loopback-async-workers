import { Transactions } from '../models';
import { SlicesRepository } from '../repositories';
export declare class SlicesTransactionsController {
    protected slicesRepository: SlicesRepository;
    constructor(slicesRepository: SlicesRepository);
    find(hash: string): Promise<Transactions[]>;
}
