import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { api } from '../apps/web/src/lib/api.js';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const response = (status: number, body = '') => new Response(body, { status });

it.each([500, 502, 503, 504])(
  'recovers a GET from temporary proxy error %s',
  async (status) => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(status))
      .mockResolvedValueOnce(response(200, '{"ok":true}'));
    vi.stubGlobal('fetch', fetch);
    const check = expect(api('/projects')).resolves.toEqual({ ok: true });
    await vi.runAllTimersAsync();
    await check;
    expect(fetch).toHaveBeenCalledTimes(2);
  },
);
it('retries connection failure but stops after three reads with a useful message', async () => {
  const fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
  vi.stubGlobal('fetch', fetch);
  const check = expect(api('/projects')).rejects.toThrow(
    '服务暂时无法连接，请稍后重试',
  );
  await vi.runAllTimersAsync();
  await check;
  expect(fetch).toHaveBeenCalledTimes(3);
});
it.each(['POST', 'PUT', 'DELETE'])(
  'never automatically repeats %s submissions',
  async (method) => {
    const fetch = vi.fn().mockResolvedValue(response(500));
    vi.stubGlobal('fetch', fetch);
    await expect(api('/projects', { method })).rejects.toThrow(
      '服务暂时无法连接，请稍后重试',
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  },
);
it('preserves structured server errors without retrying', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(response(500, '{"error":{"message":"保存失败"}}'));
  vi.stubGlobal('fetch', fetch);
  await expect(api('/projects')).rejects.toThrow('保存失败');
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('does not repeat an aborted read', async () => {
  const controller = new AbortController();
  const fetch = vi.fn().mockImplementation(async () => {
    controller.abort();
    throw new DOMException('Aborted', 'AbortError');
  });
  vi.stubGlobal('fetch', fetch);
  await expect(
    api('/projects', { signal: controller.signal }),
  ).rejects.toThrow();
  expect(fetch).toHaveBeenCalledTimes(1);
});
