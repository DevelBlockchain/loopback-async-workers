import { WorkerJob } from '../types';

const asyncSleep = async function sleep(ms: number) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms + 10);
    });
};

test('Test not timeout', async () => {
    let error = '';
    const onError = (message:string) => {
        error = message;
    }
    let doneRun = false;
    let work = new WorkerJob({
        name: 'timeout-test',
        onError: onError,
        onTick: async () => {
            await asyncSleep(50);
            doneRun = true;
        },
        limitTime: 100,
    });
    await work.run();
    expect(doneRun).toBe(true);
    expect(error).toBe('');
});

test('Test timeout', async () => {
    let error = '';
    const onError = (message:string) => {
        error = message;
    }
    let work = new WorkerJob({
        name: 'timeout-test',
        onError: onError,
        onTick: async () => {
            await asyncSleep(200);
        },
        limitTime: 100,
    });
    await work.run();
    expect(error).toBe('timeout worker timeout-test');
});

test('Test onTick throw', async () => {
    let error = '';
    const onError = (message:string) => {
        error = message;
    }
    let work = new WorkerJob({
        name: 'timeout-test',
        onError: onError,
        onTick: async () => {
            throw new Error('random error')
        },
        limitTime: 100,
    });
    await work.run();
    expect(error).toBe('random error');
});

test('Test cron', async () => {
    let error = '';
    const onError = (message:string) => {
        error = message;
    }
    let count = 0;
    let work = new WorkerJob({
        name: 'cron-test',
        onError: onError,
        onTick: async () => {
            count++;
        },
        cronTime: '*/1 * * * * *',
    });
    work.start();
    await asyncSleep(3500);
    work.stop();
    expect(count).toBeGreaterThanOrEqual(3);
    expect(count).toBeLessThanOrEqual(4);
    expect(error).toBe('');
});

test('Test cron wait', async () => {
    let error = '';
    const onError = (message:string) => {
        error = message;
    }
    let count = 0;
    let work = new WorkerJob({
        name: 'cron-test',
        onError: onError,
        onTick: async () => {
            count++;
            await asyncSleep(1500);
        },
        cronTime: '*/1 * * * * *',
        waitRun: true,
    });
    work.start();
    await asyncSleep(3500);
    work.stop();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(2);
    expect(error).toBe('');
});

test('Test cron non wait', async () => {
    let count = 0;
    let error = '';
    const onError = (message:string) => {
        error = message;
    }
    let work = new WorkerJob({
        name: 'cron-test',
        onError: onError,
        onTick: async () => {
            count++;
            await asyncSleep(1500);
        },
        cronTime: '*/1 * * * * *',
        waitRun: false,
    });
    work.start();
    await asyncSleep(3500);
    work.stop();
    expect(count).toBeGreaterThanOrEqual(3);
    expect(count).toBeLessThanOrEqual(4);
    expect(error).toBe('');
});
