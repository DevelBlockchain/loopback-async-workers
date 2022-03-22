import { CronJob, cronJob } from '@loopback/cron';

@cronJob()
export class Test extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/1 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}

@cronJob()
export class Test1 extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/2 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}

@cronJob()
export class Test2 extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/3 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}

@cronJob()
export class Test3 extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/4 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}

@cronJob()
export class Test4 extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/5 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}

@cronJob()
export class Test5 extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/6 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}

@cronJob()
export class Test6 extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/7 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}

@cronJob()
export class Test7 extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/8 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}

@cronJob()
export class Test8 extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/9 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}

@cronJob()
export class Test9 extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/11 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}

@cronJob()
export class Test10 extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/12 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}

@cronJob()
export class Test11 extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/13 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}

@cronJob()
export class Test12 extends CronJob {

  constructor() {
    super({
      name: 'task-connection-p2p',
      onTick: async () => {
        await this.stop();
        try {
          await this.runProcess();
        } catch (err) {
          console.error(`${this.name} ${JSON.stringify(err)}`, err);
        }
        await this.start();
      },
      cronTime: '*/14 * * * * *',
    });
  }

  runProcess = async () => {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += i;
    }
  }
}