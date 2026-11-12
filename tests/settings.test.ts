import { test, expect } from 'vitest';
import { mkdtemp, stat, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalSettingsStore } from '../packages/storage/src/settings.js';
import { settingsRoutes } from '../apps/api/src/routes/settings.js';
import { voiceCacheKey } from '../packages/speech/src/film.js';
import {
  resolveVideoPipeline,
  settingsSchema,
} from '../packages/contracts/src/settings.js';

test('video pipeline defaults safely and accepts the drawing engine explicitly', async () => {
  expect(settingsSchema.parse({}).production.videoPipeline).toBe('legacy-v3');
  expect(
    settingsSchema.parse({
      production: { videoPipeline: 'drawing-engine-v3' },
    }).production.videoPipeline,
  ).toBe('drawing-engine-v3');
  expect(() =>
    settingsSchema.parse({ production: { videoPipeline: 'retired-parity' } }),
  ).toThrow();
  expect(resolveVideoPipeline('legacy-v3', {})).toBe('legacy-v3');
  expect(
    resolveVideoPipeline('legacy-v3', {
      TIMOTV_VIDEO_PIPELINE: 'drawing-engine-v3',
    }),
  ).toBe('drawing-engine-v3');
  expect(
    resolveVideoPipeline('drawing-engine-v3', {
      TIMOTV_VIDEO_PIPELINE: 'legacy-v3',
    }),
  ).toBe('legacy-v3');
  expect(resolveVideoPipeline('retired-parity', {})).toBe('legacy-v3');

  const dir = await mkdtemp(join(tmpdir(), 'pipeline-settings-'));
  try {
    const file = join(dir, 'settings.json');
    const store = new LocalSettingsStore(file, {});
    expect((await store.get()).production.videoPipeline).toBe('legacy-v3');
    const saved = await store.update({
      revision: 0,
      production: { videoPipeline: 'drawing-engine-v3' },
    });
    expect(saved.production.videoPipeline).toBe('drawing-engine-v3');
    expect((await store.runtimeEnv()).TIMO_VIDEO_PIPELINE).toBe(
      'drawing-engine-v3',
    );
    const retired = join(dir, 'retired.json');
    await writeFile(
      retired,
      JSON.stringify({
        revision: 0,
        production: { videoPipeline: 'retired-parity' },
        model: {},
        speech: { volcengine: {}, elevenlabs: {} },
      }),
    );
    expect(
      (await new LocalSettingsStore(retired, {}).get()).production
        .videoPipeline,
    ).toBe('legacy-v3');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test('private persistence, preservation, clearing and concurrent revisions', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'settings-'));
  try {
    const file = join(dir, 'config/settings.json');
    const store = new LocalSettingsStore(file, {
      TIMO_PROVIDER: 'deepseek',
      DEEPSEEK_API_KEY: 'fallback-secret',
      VOLCENGINE_TTS_APP_ID: 'legacy',
      VOLCENGINE_TTS_ACCESS_TOKEN: 'legacy-secret',
    });
    expect((await store.get()).model.apiKeyConfigured).toBe(true);
    const saved = await store.update({
      revision: 0,
      model: { apiKey: 'saved-secret', model: 'test-model' },
    });
    expect(JSON.stringify(saved)).not.toContain('secret');
    await store.update({ revision: 1, model: { apiKey: '' } });
    expect((await store.runtimeEnv()).TIMO_API_KEY).toBe('saved-secret');
    await store.update({
      revision: 2,
      model: { apiKey: null },
      speech: { volcengine: { apiKey: null } },
    });
    expect((await store.get()).model.apiKeyConfigured).toBe(false);
    expect((await store.get()).speech.volcengine.apiKeyConfigured).toBe(false);
    expect((await stat(file)).mode & 0o777).toBe(0o600);
    expect(JSON.parse(await readFile(file, 'utf8')).revision).toBe(3);
    const results = await Promise.allSettled([
      store.update({ revision: 3 }),
      store.update({ revision: 3 }),
    ]);
    expect(results.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test('preview validates boundaries and never leaks upstream errors', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'preview-'));
  try {
    const store = new LocalSettingsStore(join(dir, 'settings.json'), {});
    let calls = 0;
    const app = settingsRoutes(store, async (_text, _voice, options) => {
      calls++;
      expect(options?.env?.VOLCENGINE_TTS_API_KEY).toBe('temporary-key');
      return Buffer.from('audio');
    });
    const request = (body: unknown, origin = 'http://localhost:5173') =>
      app.request('http://localhost/voices/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: origin },
        body: JSON.stringify(body),
      });
    expect(
      (await request({ voice: 'valid' }, 'https://evil.test')).status,
    ).toBe(403);
    expect((await request({ voice: 'bad/path' })).status).toBe(400);
    expect(
      (await request({ voice: 'valid', text: 'x'.repeat(121) })).status,
    ).toBe(400);
    expect((await request({ voice: 'valid' })).status).toBe(422);
    expect(calls).toBe(0);
    await store.update({
      revision: 0,
      speech: { volcengine: { apiKey: 'temporary-key' } },
    });
    expect((await app.request('http://attacker.test/')).status).toBe(403);
    const ok = await request({ voice: 'valid' });
    expect(ok.headers.get('content-type')).toBe('audio/mpeg');
    expect(await ok.text()).toBe('audio');
    expect(calls).toBe(1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test('resource snapshot invalidates speech cache', () => {
  expect(
    voiceCacheKey('hello', 'volcengine', 'voice', {
      VOLCENGINE_TTS_RESOURCE_ID: 'a',
    }),
  ).not.toBe(
    voiceCacheKey('hello', 'volcengine', 'voice', {
      VOLCENGINE_TTS_RESOURCE_ID: 'b',
    }),
  );
});

test('strict validation, automatic resources, legacy override, safe corrupt reads', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'settings-validation-'));
  try {
    const file = join(dir, 'settings.json');
    const store = new LocalSettingsStore(file, {
      VOLCENGINE_TTS_APP_ID: 'legacy',
      VOLCENGINE_TTS_ACCESS_TOKEN: 'old',
    });
    expect((await store.get()).speech.volcengine.resourceId).toBe('');
    await store.update({
      revision: 0,
      speech: { volcengine: { apiKey: '  new-key  ', voice: 'S_custom' } },
    });
    const env = await store.runtimeEnv();
    expect(env.VOLCENGINE_TTS_API_KEY).toBe('new-key');
    expect(env.VOLCENGINE_TTS_APP_ID).toBeUndefined();
    expect(env.VOLCENGINE_TTS_ACCESS_TOKEN).toBeUndefined();
    expect((await store.get()).speech.volcengine.resourceId).toBe('');
    for (const bad of [
      { revision: 1, speech: { volcengine: { voice: 'invalid.voice' } } },
      { revision: 1, speech: { volcengine: { voice: 'invalid voice' } } },
      { revision: -1 },
      { revision: 1, unknown: true },
      { revision: 1, model: { provider: 'bad/provider' } },
      { revision: 1, model: { model: 'x'.repeat(121) } },
      { revision: 1, speech: { volcengine: { voice: 'x'.repeat(121) } } },
      { revision: 1, model: { baseUrl: 'https://user:pass@example.com' } },
      { revision: 1, model: { apiKey: 'a\nb' } },
    ])
      await expect(store.update(bad as never)).rejects.toThrow(
        'SETTINGS_INVALID',
      );
    await writeFile(file, '{"apiKey":"SUPER_SECRET", broken');
    await expect(store.get()).rejects.toThrow(/^SETTINGS_READ_FAILED$/);
    await writeFile(
      file,
      JSON.stringify({
        revision: 1,
        model: { unknown: 'SUPER_SECRET' },
        speech: { volcengine: {}, elevenlabs: {} },
      }),
    );
    await expect(store.runtimeEnv()).rejects.toThrow(/^SETTINGS_READ_FAILED$/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
