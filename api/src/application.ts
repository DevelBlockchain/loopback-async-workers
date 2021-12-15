import { BootMixin } from '@loopback/boot';
import {
  AuthenticationComponent,
  registerAuthenticationStrategy
} from '@loopback/authentication';
import {
  JWTAuthenticationComponent
} from '@loopback/authentication-jwt';
import {
  JWTStrategy,
} from './authorization';
import { ApplicationConfig, createBindingFromClass } from '@loopback/core';
import { CronComponent } from '@loopback/cron';
import {
  LoggingBindings,
  LoggingComponent
} from '@loopback/logging';
import { RepositoryMixin, SchemaMigrationOptions } from '@loopback/repository';
import { RestApplication, Router } from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent
} from '@loopback/rest-explorer';
import { ServiceMixin } from '@loopback/service-proxy';
import path from 'path';
import { MySequence } from './sequence';
import {Populate} from './scripts';
import * as tasks from './tasks';
import { UsersRepository } from './repositories';

require('dotenv').config()
const winston = require('winston');
require('winston-daily-rotate-file');

export { ApplicationConfig };

export class BlockineNodeApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Logger
    this.configure(LoggingBindings.COMPONENT).to({
      enableFluent: false,
      enableHttpAccessLog: true,
    });
    this.configure(LoggingBindings.WINSTON_LOGGER).to({
      transports: [
        new (winston.transports.DailyRotateFile)({
          filename: './logs/node-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.json()),
        }),
        new (winston.transports.DailyRotateFile)({
          filename: './logs/node-error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
          format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.json()),
        }),
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ]
    });
    this.component(LoggingComponent);

    // Mount authentication system
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    registerAuthenticationStrategy(this as any, JWTStrategy);

    // Set up the custom sequence
    this.sequence(MySequence);

    // CronJobs
    this.component(CronComponent);
    Object.entries(tasks).forEach((task: [string, any]) => {
      this.add(createBindingFromClass(task[1]));
    });

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));
    const router = Router();
    router.get('/panel/*', async (req: any, res: any, next: any) => {
      res.sendFile(path.join(__dirname, '../public', 'index.html'));
    });
    this.expressMiddleware('middleware.express.panel', router);

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  async migrateSchema(options?: SchemaMigrationOptions) {
    await super.migrateSchema(options);
    await Populate(await this.getRepository(UsersRepository));
  }
}
