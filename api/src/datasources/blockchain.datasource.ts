import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
require('dotenv/config');

const config = {
  name: 'db',
  connector: 'postgresql',
  url: '',
  host: 'bywise-db',
  port: '5432',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class BlockchainDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'blockchain';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.blockchain', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
