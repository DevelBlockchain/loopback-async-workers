import { Count, Filter, Where } from '@loopback/repository';
import { Blocks } from '../models';
import { BlocksRepository } from '../repositories';
export declare class BlocksController {
    blocksRepository: BlocksRepository;
    constructor(blocksRepository: BlocksRepository);
    count(where?: Where<Blocks>): Promise<Count>;
    find(filter?: Filter<Blocks>): Promise<Blocks[]>;
    findById(hash: string): Promise<Blocks>;
    findByIndex(height: number): Promise<Blocks>;
}
