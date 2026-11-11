import { piVisionGenerator, reviewModelConfig } from '@timotv/agent';
import { Hono } from 'hono';
import { VOLCENGINE_VOICES, VOLCENGINE_VOICES_SOURCE } from '@timotv/contracts';
import type { LocalSettingsStore } from '@timotv/storage';
import { synthesizeVolcengine } from '@timotv/speech';
export function settingsRoutes(
  store: Pick<LocalSettingsStore, 'get' | 'update' | 'runtimeEnv'>,
  synthesize = synthesizeVolcengine,
  vision = piVisionGenerator,
) {
  const app = new Hono();
  app.use('*', async (c, next) => {
    c.header('Cache-Control', 'no-store');
    if (
      !['localhost', '127.0.0.1', '[::1]'].includes(new URL(c.req.url).hostname)
    )
      return c.json(
        { error: { code: 'FORBIDDEN', message: '来源不允许' } },
        403,
      );
    if (['POST', 'PUT'].includes(c.req.method)) {
      const origin = c.req.header('origin');
      if (origin) {
        let allowed = false;
        try {
          const u = new URL(origin);
          allowed =
            origin === new URL(c.req.url).origin ||
            (['localhost', '127.0.0.1', '[::1]'].includes(u.hostname) &&
              ['5173', new URL(c.req.url).port].includes(u.port));
        } catch {}
        if (!allowed)
          return c.json(
            { error: { code: 'FORBIDDEN', message: '来源不允许' } },
            403,
          );
      }
      if (
        !/^application\/json(?:\s*;|$)/i.test(
          c.req.header('content-type') || '',
        )
      )
        return c.json(
          { error: { code: 'INVALID_INPUT', message: '需要 JSON' } },
          415,
        );
    }
    await next();
  });
  app.get('/', async (c) => c.json(await store.get()));
  app.put('/', async (c) => {
    try {
      return c.json(await store.update(await c.req.json()));
    } catch (e) {
      const conflict = e instanceof Error && e.message === 'SETTINGS_CONFLICT';
      return c.json(
        {
          error: {
            code: conflict ? 'SETTINGS_CONFLICT' : 'SETTINGS_INVALID',
            message: conflict ? '设置已更新，请重新加载' : '设置无效，保存失败',
          },
        },
        conflict ? 409 : 400,
      );
    }
  });
  app.post('/reviewer/probe', async (c) => {
    try {
      const env = await store.runtimeEnv();
      const config = reviewModelConfig(env);
      if (!config.enabled || !config.configured)
        throw new Error('REVIEW_NOT_CONFIGURED');
      await vision(env).generate(
        'Inspect the attached image. Use submit to return JSON with a short description field.',
        'Describe the color and shape of the attached test image.',
        [
          {
            mimeType: 'image/png',
            data: 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAeUlEQVR4nO3PQQkAMAzAwEqrfzWTMBF7HINABFzm7H7dcEEDWtCAFjSgBQ1oQQNa0IAWNKAFDWhBA1rQgBY0oAUNaEEDWtCAFjSgBQ1oQQNa0IAWNKAFDWhBA1rQgBY0oAUNaEEDWtCAFjSgBQ1oQQNa0IAWNKAFj1215QFazRONCwAAAABJRU5ErkJggg==',
          },
        ],
        AbortSignal.any([c.req.raw.signal, AbortSignal.timeout(30000)]),
      );
      return c.json({
        accepted: true,
        message: '图片请求已被接受；这不代表审片判断准确。',
      });
    } catch {
      return c.json(
        {
          error: {
            code: 'REVIEW_PROBE_FAILED',
            message: '识图检查失败，请检查视觉模型配置与图片输入支持。',
          },
        },
        422,
      );
    }
  });
  app.get('/voices', (c) =>
    c.json({
      source: 'official-preset',
      sourceUrl: VOLCENGINE_VOICES_SOURCE,
      voices: VOLCENGINE_VOICES,
    }),
  );
  app.post('/voices/preview', async (c) => {
    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json(
        { error: { code: 'INVALID_INPUT', message: '请求无效' } },
        400,
      );
    }
    const voice = body?.voice,
      text = body?.text ?? '你好，这是音色试听。';
    if (
      typeof voice !== 'string' ||
      !/^[a-zA-Z0-9_-]{1,120}$/.test(voice) ||
      typeof text !== 'string' ||
      !text.trim() ||
      Array.from(text).length > 120
    )
      return c.json(
        { error: { code: 'INVALID_INPUT', message: '音色或试听文本无效' } },
        400,
      );
    try {
      const env = await store.runtimeEnv();
      if (!(
        env.VOLCENGINE_TTS_API_KEY ||
        (env.VOLCENGINE_TTS_APP_ID && env.VOLCENGINE_TTS_ACCESS_TOKEN)
      ))
        throw new Error('VOICE_NOT_CONFIGURED');
      const audio = await synthesize(text, voice, {
        env,
        signal: AbortSignal.timeout(20000),
      });
      return new Response(new Uint8Array(audio), {
        headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
      });
    } catch {
      return c.json(
        {
          error: {
            code: 'VOICE_PREVIEW_FAILED',
            message: '试听失败，请检查设置页中的配音配置',
          },
        },
        422,
      );
    }
  });
  return app;
}
