import { expect, it } from 'vitest';
import {
  synthesizeVolcengine,
  volcengineResource,
} from '../packages/speech/src/tts/volcengine.js';
import { productionBriefSchema } from '../packages/contracts/src/production.js';
it('默认火山配音，按音色匹配资源', () => {
  expect(productionBriefSchema.parse({ topic: '复利' }).voiceProvider).toBe(
    'volcengine',
  );
  expect(volcengineResource('zh_male_yuanboxiaoshu_uranus_bigtts')).toBe(
    'seed-tts-2.0',
  );
  expect(volcengineResource('S_test')).toBe('seed-icl-2.0');
});
it('正确鉴权并合并 HTTP 流式音频，保持密钥在服务端', async () => {
  let called = false;
  const fetcher: typeof fetch = async (url, init) => {
    called = true;
    expect(url).toBe(
      'https://openspeech.bytedance.com/api/v3/tts/unidirectional',
    );
    const headers = new Headers(init?.headers);
    expect(headers.get('X-Api-Key')).toBe('test-key');
    expect(headers.get('X-Api-Resource-Id')).toBe('seed-tts-2.0');
    const body = JSON.parse(init?.body as string);
    expect(body.req_params.text).toBe('你好');
    expect(body.req_params.audio_params.format).toBe('mp3');
    return new Response(
      [
        JSON.stringify({ code: 0, data: Buffer.from('a').toString('base64') }),
        JSON.stringify({
          code: 20000000,
          data: Buffer.from('b').toString('base64'),
        }),
      ].join('\n'),
    );
  };
  const audio = await synthesizeVolcengine(
    '你好',
    'zh_male_yuanboxiaoshu_uranus_bigtts',
    { env: { VOLCENGINE_TTS_API_KEY: 'test-key' }, fetcher },
  );
  expect(called).toBe(true);
  expect(audio.toString()).toBe('ab');
});
it('缺配置、接口错误、非法或空响应均明确失败，不泄漏响应中的敏感信息', async () => {
  await expect(
    synthesizeVolcengine('你好', 'voice', {
      env: {},
      fetcher: async () => {
        throw new Error('must not call');
      },
    }),
  ).rejects.toThrow('VOLCENGINE_TTS_API_KEY');
  const errorFetch: typeof fetch = async () =>
    new Response(JSON.stringify({ code: 45000000, message: 'secret-key' }));
  await expect(
    synthesizeVolcengine('你好', 'voice', {
      env: { VOLCENGINE_TTS_API_KEY: 'secret-key' },
      fetcher: errorFetch,
    }),
  ).rejects.toThrow('45000000');
  await expect(
    synthesizeVolcengine('你好', 'voice', {
      env: { VOLCENGINE_TTS_API_KEY: 'secret-key' },
      fetcher: async () => new Response('not-json'),
    }),
  ).rejects.toThrow('响应格式');
  await expect(
    synthesizeVolcengine('你好', 'voice', {
      env: { VOLCENGINE_TTS_API_KEY: 'secret-key' },
      fetcher: async () => new Response('{}'),
    }),
  ).rejects.toThrow('音频');
});

it('接受音频流中的空字幕消息和结束消息，不把 null 当成损坏音频', async () => {
  const frames = [
    { code: 0, data: Buffer.from('audio-a').toString('base64') },
    { code: 0, data: null, sentence: { text: '你好' } },
    { code: 0, data: Buffer.from('audio-b').toString('base64') },
    { code: 0, data: null, sentence: { words: [] } },
    { code: 20000000, data: null },
  ];
  const bytes = new TextEncoder().encode(
    frames.map((v) => JSON.stringify(v)).join('\n'),
  );
  const audio = await synthesizeVolcengine(
    '你好',
    'zh_male_yuanboxiaoshu_uranus_bigtts',
    {
      env: { VOLCENGINE_TTS_API_KEY: 'test-key' },
      fetcher: async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              // Transport chunks may cut through JSON and UTF-8 characters.
              for (let i = 0; i < bytes.length; i += 7)
                controller.enqueue(bytes.slice(i, i + 7));
              controller.close();
            },
          }),
        ),
    },
  );
  expect(audio.toString()).toBe('audio-aaudio-b');
});
