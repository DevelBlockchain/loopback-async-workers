import { LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
export declare class BlockchainDataSource extends juggler.DataSource implements LifeCycleObserver {
    static dataSourceName: string;
    static readonly defaultConfig: {
        name: string;
        connector: string;
        url: string;
        host: string;
        port: string;
        user: string | undefined;
        password: string | undefined;
        database: string | undefined;
    };
    constructor(dsConfig?: object);
}
