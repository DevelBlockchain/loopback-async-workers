import { WinstonLogger } from '@loopback/logging';
import { BscScanDTO } from '../types';
export declare class BscScanProvider {
    private logger;
    constructor(logger: WinstonLogger);
    getLastTransactions(address: string): Promise<BscScanDTO>;
}
