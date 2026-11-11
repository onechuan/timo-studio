import { test, expect } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalSettingsStore } from '../packages/storage/src/settings.js';
test('reviewer secrets stay independent, blank retains and null clears env fallback', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vision-settings-'));
  try {
    const store = new LocalSettingsStore(join(dir, 'settings.json'), {
      TIMO_API_KEY: 'director-secret',
      OPENAI_API_KEY: 'global-secret',
    });
    expect((await store.get()).reviewer?.apiKeyConfigured).toBe(false);
    await store.update({
      revision: 0,
      reviewer: {
        enabled: true,
        model: 'vision-test',
        apiKey: 'review-secret',
      },
    });
    const before = await store.runtimeEnv();
    expect(before.TIMO_REVIEW_API_KEY).toBe('review-secret');
    expect(JSON.stringify(await store.get())).not.toContain('secret');
    await store.update({ revision: 1, reviewer: { apiKey: ' ' } });
    expect((await store.runtimeEnv()).TIMO_REVIEW_API_KEY).toBe(
      'review-secret',
    );
    await store.update({ revision: 2, reviewer: { apiKey: null } });
    expect((await store.get()).reviewer?.apiKeyConfigured).toBe(false);
    expect((await store.runtimeEnv()).TIMO_API_KEY).toBe('director-secret');
    expect((await store.runtimeEnv()).TIMO_REVIEW_REVISION).not.toBe(
      before.TIMO_REVIEW_REVISION,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('probe is manual, uses real fixture image and sanitizes failures', async () => {
  const { settingsRoutes } = await import('../apps/api/src/routes/settings.js');
  const dir = await mkdtemp(join(tmpdir(), 'vision-probe-'));
  try {
    const store = new LocalSettingsStore(join(dir, 'settings.json'), {});
    let calls = 0;
    const app = settingsRoutes(store, undefined, () => ({
      generate: async (_system, _user, images) => {
        calls++;
        expect(images[0]?.mimeType).toBe('image/png');
        expect(
          Buffer.from(images[0]!.data, 'base64').subarray(1, 4).toString(),
        ).toBe('PNG');
        throw new Error('sensitive-provider-secret');
      },
    }));
    const probe = () =>
      app.request('http://localhost/reviewer/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
    expect((await probe()).status).toBe(422);
    expect(calls).toBe(0);
    await store.update({
      revision: 0,
      reviewer: { enabled: true, model: 'v', apiKey: 'private' },
    });
    const result = await probe();
    expect(result.status).toBe(422);
    expect(await result.text()).not.toContain('secret');
    expect(calls).toBe(1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('legacy settings load; reviewer revision ignores speech edits and null blocks review env key', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vision-legacy-'));
  try {
    const file = join(dir, 'settings.json');
    const { writeFile } = await import('node:fs/promises');
    await writeFile(
      file,
      JSON.stringify({
        revision: 4,
        model: {},
        speech: { volcengine: {}, elevenlabs: {} },
      }),
    );
    const store = new LocalSettingsStore(file, {
      TIMO_REVIEW_ENABLED: 'true',
      TIMO_REVIEW_MODEL: 'v',
      TIMO_REVIEW_API_KEY: 'fallback-review-secret',
    });
    expect((await store.get()).reviewer?.apiKeyConfigured).toBe(true);
    const revision = (await store.runtimeEnv()).TIMO_REVIEW_REVISION;
    await store.update({
      revision: 4,
      speech: { elevenlabs: { voice: 'new-voice' } },
    });
    expect((await store.runtimeEnv()).TIMO_REVIEW_REVISION).toBe(revision);
    await store.update({ revision: 5, reviewer: { apiKey: null } });
    expect((await store.runtimeEnv()).TIMO_REVIEW_API_KEY).toBe('');
    expect((await store.get()).reviewer?.apiKeyConfigured).toBe(false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
