import { WorkerJob } from '../types';

const asyncSleep = async function sleep(ms: number) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms + 10);
    });
};

test('Test not timeout', async () => {
    let doneRun = false;
    let work = new WorkerJob({
        name: 'timeout-test',
        onTick: async () => {
            await asyncSleep(50);
            doneRun = true;
        },
        limitTime: 100,
    });
    await work.run();
    await expect(doneRun).toBe(true);
});

test('Test timeout', async () => {
    let work = new WorkerJob({
        name: 'timeout-test',
        onTick: async () => {
            await asyncSleep(200);
        },
        limitTime: 100,
    });
    await expect(work.run).rejects.toThrow();
});

test('Test cron', async () => {
    let count = 0;
    let work = new WorkerJob({
        name: 'cron-test',
        onTick: async () => {
            count++;
        },
        cronTime: '*/1 * * * * *',
    });
    work.start();
    await asyncSleep(3500);
    work.stop();
    await expect(count).toBeGreaterThanOrEqual(3);
    await expect(count).toBeLessThanOrEqual(4);
});

test('Test cron wait', async () => {
    let count = 0;
    let work = new WorkerJob({
        name: 'cron-test',
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
    await expect(count).toBeGreaterThanOrEqual(1);
    await expect(count).toBeLessThanOrEqual(2);
});

test('Test cron non wait', async () => {
    let count = 0;
    let work = new WorkerJob({
        name: 'cron-test',
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
    await expect(count).toBeGreaterThanOrEqual(3);
    await expect(count).toBeLessThanOrEqual(4);
});