import { TransactionsDTO } from '../types/transactions.type';
export declare class VirtualMachineProvider {
    walletsRepository: VirtualMachineProvider;
    constructor(walletsRepository: VirtualMachineProvider);
    executeTransaction(transaction: TransactionsDTO): Promise<void>;
}
