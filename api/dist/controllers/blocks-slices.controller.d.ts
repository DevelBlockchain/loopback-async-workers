import { Slices } from '../models';
import { BlocksRepository } from '../repositories';
export declare class BlocksSlicesController {
    protected blocksRepository: BlocksRepository;
    constructor(blocksRepository: BlocksRepository);
    find(hash: string): Promise<Slices[]>;
}
