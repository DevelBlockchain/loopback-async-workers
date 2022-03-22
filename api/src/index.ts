import { readFileSync } from 'fs';
import { ApplicationConfig, BlockineNodeApplication } from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new BlockineNodeApplication(options);
  await app.boot();
  await app.migrateSchema();
  await app.start();

  const url = app.restServer.url;
  console.log(`Bywise node is running`);
  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: 8080,
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
      // Enable HTTPS
      ...(process.env.KEY_PATH === undefined ? {} : {
        protocol: 'https',
        key: readFileSync(process.env.KEY_PATH + ''),
        cert: readFileSync(process.env.CERT_PATH + '')
      })
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}