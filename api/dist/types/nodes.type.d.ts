import { Model } from '@loopback/repository';
export declare class NodeDTO extends Model {
    host: string;
    fullNode: boolean;
    constructor(data?: Partial<NodeDTO>);
}
