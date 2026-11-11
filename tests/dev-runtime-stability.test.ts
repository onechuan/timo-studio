import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { retryStartupCheck } from '../apps/worker/src/bootstrap/index.js';

const json = (path: string) =>
  JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));

it('runs API and worker from workspace sources without watching package dist output', () => {
  const dev = json('tsconfig.dev.json');
  expect(dev.compilerOptions.paths).toMatchObject({
    '@timotv/agent': ['packages/agent/src/index.ts'],
    '@timotv/contracts': ['packages/contracts/src/index.ts'],
    '@timotv/renderer': ['packages/renderer/src/index.ts'],
    '@timotv/renderer/preview': ['packages/renderer/src/preview.ts'],
  });

  for (const app of ['api', 'worker']) {
    const script = json(`apps/${app}/package.json`).scripts.dev as string;
    expect(script).toContain('--tsconfig ../../tsconfig.dev.json');
    expect(script).toContain("--exclude '../../packages/**/dist/**'");
  }
});

it('retries transient startup connections with a bounded backoff', async () => {
  let attempts = 0;
  const delays: number[] = [];
  await retryStartupCheck(
    'database',
    async () => {
      attempts++;
      if (attempts < 3) throw new Error('ECONNREFUSED');
    },
    {
      attempts: 4,
      sleep: async (delay) => {
        delays.push(delay);
      },
    },
  );
  expect(attempts).toBe(3);
  expect(delays).toEqual([500, 1000]);
});

it('does not retry configuration or code failures', async () => {
  let attempts = 0;
  await expect(
    retryStartupCheck(
      'browser',
      async () => {
        attempts++;
        throw new Error('Chrome not found; set CHROME_PATH');
      },
      { attempts: 4, sleep: async () => {} },
    ),
  ).rejects.toThrow('Chrome not found');
  expect(attempts).toBe(1);
});
