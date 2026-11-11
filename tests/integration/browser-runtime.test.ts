import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';
import { createBrowserRuntime } from '../../packages/renderer/src/browser-runtime.js';

const test = it.skipIf(process.env.RUN_INTEGRATION !== '1');

test('the TSX loader measures a film page without leaked transform helpers', async () => {
  const fixture = new URL('../fixtures/browser-runtime-child.ts', import.meta.url);
  const { stdout, stderr } = await promisify(execFile)(
    process.execPath,
    ['--import', 'tsx', fixture.pathname],
    {
      cwd: new URL('../..', import.meta.url).pathname,
      env: process.env,
      timeout: 20_000,
    },
  );

  expect(stderr).not.toContain('__name is not defined');
  expect(JSON.parse(stdout)).toMatchObject({ count: expect.any(Number) });
  expect(JSON.parse(stdout).count).toBeGreaterThan(0);
});

test('a review launch failure has a typed browser runtime code', async () => {
  const runtime = createBrowserRuntime({
    phase: 'reviewing',
    executablePath: '/bin/false',
    launch: async () => {
      throw new Error('private browser launch detail');
    },
  });

  await expect(runtime.preflight()).rejects.toMatchObject({
    failure: {
      code: 'REVIEW_BROWSER_RUNTIME_FAILED',
      phase: 'reviewing',
      retryable: true,
    },
  });
});
