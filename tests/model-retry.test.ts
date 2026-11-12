import { expect, it } from 'vitest';
import { withModelRetry } from '../packages/agent/src/runtime/retry.js';

it('retries a transient model failure once', async () => {
  let calls = 0;
  const result = await withModelRetry(
    async () => {
      calls++;
      if (calls === 1) throw new Error('MODEL_TIMEOUT');
      return 'ok';
    },
    undefined,
    { delayMs: 1 },
  );
  expect(result).toBe('ok');
  expect(calls).toBe(2);
});

it('retries a dropped model connection once', async () => {
  let calls = 0;
  const result = await withModelRetry(
    async () => {
      calls++;
      if (calls === 1) throw new Error('MODEL_CONNECTION');
      return 'ok';
    },
    undefined,
    { delayMs: 1 },
  );
  expect(result).toBe('ok');
  expect(calls).toBe(2);
});

it('does not retry deterministic model failures', async () => {
  let calls = 0;
  await expect(
    withModelRetry(
      async () => {
        calls++;
        throw new Error('MODEL_AUTH_FAILED');
      },
      undefined,
      { delayMs: 1 },
    ),
  ).rejects.toThrow('MODEL_AUTH_FAILED');
  expect(calls).toBe(1);
});

it('stops after the retry budget', async () => {
  let calls = 0;
  await expect(
    withModelRetry(
      async () => {
        calls++;
        throw new Error('MODEL_TIMEOUT');
      },
      undefined,
      { retries: 1, delayMs: 1 },
    ),
  ).rejects.toThrow('MODEL_TIMEOUT');
  expect(calls).toBe(2);
});

it('cancels a pending retry with the job signal', async () => {
  const controller = new AbortController();
  const pending = withModelRetry(
    async () => {
      throw new Error('MODEL_TIMEOUT');
    },
    controller.signal,
    { delayMs: 100 },
  );
  setTimeout(() => controller.abort(), 5);
  await expect(pending).rejects.toThrow('MODEL_CANCELLED');
});
