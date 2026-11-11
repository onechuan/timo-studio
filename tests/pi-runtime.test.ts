import { LocalSettingsStore } from '../packages/storage/src/settings.js';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { expect, it } from 'vitest';
import { piGenerator } from '../packages/agent/src/runtime/pi.js';
it.each(['deepseek', 'local-test'])(
  '兼容端点显式控制 DeepSeek 思考模式而不影响 %s 协议',
  async (provider) => {
    let request: Record<string, unknown> = {};
    const server = createServer(async (req, res) => {
      let body = '';
      for await (const chunk of req) body += chunk;
      request = JSON.parse(body);
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({ error: { message: 'test transport boundary' } }),
      );
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    try {
      const port = (server.address() as { port: number }).port;
      await expect(
        piGenerator({
          TIMO_PROVIDER: provider,
          TIMO_MODEL: 'deepseek-flash',
          TIMO_API_KEY: 'test-only',
          TIMO_BASE_URL: `http://127.0.0.1:${port}/v1`,
        }).generate('JSON', '测试'),
      ).rejects.toThrow();
      if (provider === 'deepseek')
        expect(request.thinking).toEqual({ type: 'disabled' });
      else expect(request.thinking).toBeUndefined();
    } finally {
      server.closeAllConnections();
      await new Promise<void>((r) => server.close(() => r()));
    }
  },
);
it.each([
  ['stop', 'MODEL_NO_SUBMISSION'],
  ['length', 'MODEL_OUTPUT_LIMIT'],
  ['unauthorized', 'MODEL_AUTH_FAILED'],
  ['invalid-json', 'MODEL_INVALID_SUBMISSION'],
])('Pi 将 %s 转为可分类错误且不泄露服务原文', async (mode, code) => {
  const server = createServer(async (_req, res) => {
    if (mode === 'unauthorized') {
      res.writeHead(401, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          error: {
            message: 'Incorrect API key: secret-test-key',
            type: 'authentication_error',
          },
        }),
      );
      return;
    }
    res.writeHead(200, { 'content-type': 'text/event-stream' });
    const delta =
      mode === 'invalid-json'
        ? {
            role: 'assistant',
            tool_calls: [
              {
                index: 0,
                id: 'bad-submit',
                type: 'function',
                function: {
                  name: 'submit',
                  arguments: JSON.stringify({ json: '{broken-json' }),
                },
              },
            ],
          }
        : { role: 'assistant', content: 'secret-test-key' };
    res.write(
      'data: ' +
        JSON.stringify({
          id: 'test',
          object: 'chat.completion.chunk',
          created: 1,
          model: 'test-model',
          choices: [{ index: 0, delta, finish_reason: null }],
        }) +
        '\n\n',
    );
    res.end(
      'data: ' +
        JSON.stringify({
          id: 'test',
          object: 'chat.completion.chunk',
          created: 1,
          model: 'test-model',
          choices: [
            {
              index: 0,
              delta: {},
              finish_reason: mode === 'invalid-json' ? 'tool_calls' : mode,
            },
          ],
        }) +
        '\n\ndata: [DONE]\n\n',
    );
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  try {
    const port = (server.address() as { port: number }).port;
    const model = piGenerator({
      TIMO_PROVIDER: 'local-test',
      TIMO_MODEL: 'test-model',
      TIMO_API_KEY: 'test-only',
      TIMO_BASE_URL: `http://127.0.0.1:${port}/v1`,
    });
    await expect(model.generate('只提交JSON', '测试')).rejects.toMatchObject({
      message: code,
    });
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
it('Pi 通过本地兼容端点执行 submit 工具，不调用外部模型', async () => {
  let calls = 0;
  const credentials: string[] = [];
  const dir = await mkdtemp(join(tmpdir(), 'pi-settings-'));
  const server = createServer(async (req, res) => {
    let body = '';
    for await (const b of req) body += b;
    const request = JSON.parse(body);
    calls++;
    credentials.push(req.headers.authorization || '');
    expect(request.tools[0].function.name).toBe('submit');
    res.writeHead(200, { 'content-type': 'text/event-stream' });
    const base = {
      id: 'test',
      object: 'chat.completion.chunk',
      created: 1,
      model: 'test-model',
    };
    res.write(
      'data: ' +
        JSON.stringify({
          ...base,
          choices: [
            {
              index: 0,
              delta: {
                role: 'assistant',
                tool_calls: [
                  {
                    index: 0,
                    id: 'submit-1',
                    type: 'function',
                    function: {
                      name: 'submit',
                      arguments: JSON.stringify({
                        json: JSON.stringify({ title: '本地测试' }),
                      }),
                    },
                  },
                ],
              },
              finish_reason: null,
            },
          ],
        }) +
        '\n\n',
    );
    res.write(
      'data: ' +
        JSON.stringify({
          ...base,
          choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }) +
        '\n\n',
    );
    res.end('data: [DONE]\n\n');
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  try {
    const port = (server.address() as { port: number }).port;
    const writer = new LocalSettingsStore(join(dir, 'settings.json'), {});
    const reader = new LocalSettingsStore(join(dir, 'settings.json'), {});
    await writer.update({
      revision: 0,
      model: {
        provider: 'local-test',
        model: 'test-model',
        apiKey: 'first-key',
        baseUrl: `http://127.0.0.1:${port}/v1`,
      },
    });
    const firstSnapshot = await reader.runtimeEnv();
    const model = piGenerator({
      TIMO_PROVIDER: 'local-test',
      TIMO_MODEL: 'test-model',
      TIMO_API_KEY: 'test-only',
      TIMO_BASE_URL: `http://127.0.0.1:${port}/v1`,
    });
    const result = await model.generate('只提交JSON', '测试');
    expect(result.value).toEqual({ title: '本地测试' });
    await writer.update({ revision: 1, model: { apiKey: 'second-key' } });
    await piGenerator(await reader.runtimeEnv()).generate('JSON', 'second');
    await piGenerator(firstSnapshot).generate('JSON', 'first');
    expect(credentials).toEqual([
      'Bearer test-only',
      'Bearer second-key',
      'Bearer first-key',
    ]);
    expect(calls).toBe(3);
  } finally {
    await rm(dir, { recursive: true, force: true });
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});

it('Pi 结构化生成将完整 Schema 作为 submit 工具参数', async () => {
  let parameters: Record<string, unknown> | undefined;
  const server = createServer(async (req, res) => {
    let body = '';
    for await (const b of req) body += b;
    const request = JSON.parse(body);
    parameters = request.tools[0].function.parameters;
    res.writeHead(200, { 'content-type': 'text/event-stream' });
    const base = {
      id: 'structured-test',
      object: 'chat.completion.chunk',
      created: 1,
      model: 'test-model',
    };
    res.write(
      'data: ' +
        JSON.stringify({
          ...base,
          choices: [
            {
              index: 0,
              delta: {
                role: 'assistant',
                tool_calls: [
                  {
                    index: 0,
                    id: 'submit-structured',
                    type: 'function',
                    function: {
                      name: 'submit',
                      arguments: JSON.stringify({
                        sceneId: 's1',
                        artwork: {
                          elements: [
                            {
                              id: 'subject',
                              type: 'rect',
                              x: 100,
                              y: 200,
                              width: 300,
                              height: 200,
                              cueIndex: 0,
                              layer: 0,
                            },
                          ],
                        },
                      }),
                    },
                  },
                ],
              },
              finish_reason: null,
            },
          ],
        }) +
        '\n\n',
    );
    res.write(
      'data: ' +
        JSON.stringify({
          ...base,
          choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }],
        }) +
        '\n\n',
    );
    res.end('data: [DONE]\n\n');
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  try {
    const port = (server.address() as { port: number }).port;
    const model = piGenerator({
      TIMO_PROVIDER: 'local-test',
      TIMO_MODEL: 'test-model',
      TIMO_API_KEY: 'test-only',
      TIMO_BASE_URL: `http://127.0.0.1:${port}/v1`,
    });
    const schema = {
      type: 'object',
      additionalProperties: false,
      required: ['sceneId', 'artwork'],
      properties: {
        sceneId: { const: 's1', type: 'string' },
        artwork: {
          type: 'object',
          required: ['elements'],
          properties: {
            elements: {
              type: 'array',
              items: {
                type: 'object',
                required: [
                  'id',
                  'type',
                  'x',
                  'y',
                  'width',
                  'height',
                  'cueIndex',
                  'layer',
                ],
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  x: { type: 'number' },
                  y: { type: 'number' },
                  width: { type: 'number' },
                  height: { type: 'number' },
                  cueIndex: { type: 'integer' },
                  layer: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    } as any;
    expect(model.generateStructured).toBeTypeOf('function');
    const result = await model.generateStructured!(
      '提交结构化绘图',
      '测试',
      schema,
    );
    expect(result.value).toMatchObject({ sceneId: 's1' });
    expect(parameters).toMatchObject({
      type: 'object',
      required: ['sceneId', 'artwork'],
      properties: {
        artwork: {
          properties: {
            elements: {
              items: {
                required: [
                  'id',
                  'type',
                  'x',
                  'y',
                  'width',
                  'height',
                  'cueIndex',
                  'layer',
                ],
              },
            },
          },
        },
      },
    });
    expect((parameters as any).properties.json).toBeUndefined();
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
