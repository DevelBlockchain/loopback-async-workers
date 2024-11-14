# Loopback Async Workers

This module provides a component for cron integration and asynchronous execution of scripts using LoopBack. It is designed to leverage the robust LoopBack framework for scheduling and executing worker jobs reliably and efficiently.

## Key Features

- Asynchronous execution of worker jobs.
- Integration with LoopBack components for easy and seamless setup.
- Cron job scheduling with fine-grained control over time intervals.
- Comprehensive logging with support for Winston Logger.

## Installation

To get started, add the library in your LoopBack project by running:

```bash
npm install loopback-async-workers
```

## Configuration

### Application Setup

In your `application.ts`, configure `Loopback Async Workers` as a component:

```typescript
import { WorkerComponent } from 'loopback-async-workers';

export class ApiApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Other configurations...

    // Add the WorkerComponent
    this.component(WorkerComponent);
    
    // Other configurations...
  }
}
```

### Creating a Worker

To create a worker, define a class extending `WorkerJob` and use the `@workerJob()` decorator:

```typescript
import { inject, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { WorkerJob, workerJob } from 'loopback-async-workers';
import { ExampleRepository } from '../repositories';
import { ExampleProvider } from '../services';

@workerJob()
export class ExampleWorker extends WorkerJob {
  constructor(
    @repository(ExampleRepository) private exampleRepository: ExampleRepository,
    @service(ExampleProvider) public exampleProvider: ExampleProvider,
  ) {
    super({
      name: 'example-worker',
      onError: (message) => console.error(message),
      onTick: async () => {
        try {
          await this.runProcess();
        } catch (err: any) {
          console.error(`${this.name} ${err.message}`, err);
        }
      },
      limitTime: 600000,
      cronTime: '*/1 * * * *',
    });
  }

  runProcess = async () => {
    // ...run some process
  }
}
```

## Usage

Once you have set up your workers, they will execute based on the cron jobs defined. Each worker job can be independently configured with different intervals and timeout settings.

## Testing

To test the workers, use the following command:

```bash
npm test
```

This command will run all the unit tests defined for your worker jobs.

## Contributing

If you would like to contribute, please refer to our [contribution guidelines](https://github.com/DevelBlockchain/loopback-async-workers/blob/main/CONTRIBUTING.md).

## License

This project is licensed under the terms of the ISC license. See [LICENSE](LICENSE) for more details.

## Support

For any issues, please open a [GitHub issue](https://github.com/DevelBlockchain/loopback-async-workers/issues).
