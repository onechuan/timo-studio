import { createServer } from 'node:http';
import { test, expect } from 'vitest';
import {
  piVisionGenerator,
  reviewModelConfig,
} from '../packages/agent/src/runtime/vision.js';
const image = {
  mimeType: 'image/png',
  data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=',
};
test('director credentials never configure the reviewer', () => {
  expect(
    reviewModelConfig({
      TIMO_API_KEY: 'secret',
      OPENAI_API_KEY: 'secret',
      TIMO_MODEL: 'model',
    }).configured,
  ).toBe(false);
});
test.each(['openai', 'anthropic'])(
  'real %s request carries image blocks and sanitized rejection',
  async (protocol) => {
    let request: any;
    const server = createServer(async (req, res) => {
      let body = '';
      for await (const chunk of req) body += chunk;
      request = JSON.parse(body);
      res.writeHead(401, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          error: { type: 'authentication_error', message: 'secret-test-key' },
        }),
      );
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    try {
      const env = {
        TIMO_REVIEW_ENABLED: 'true',
        TIMO_REVIEW_PROVIDER: 'local',
        TIMO_REVIEW_MODEL: 'vision',
        TIMO_REVIEW_API_KEY: 'secret-test-key',
        TIMO_REVIEW_PROTOCOL: protocol,
        TIMO_REVIEW_BASE_URL: `http://127.0.0.1:${(server.address() as any).port}/v1`,
      };
      await expect(
        piVisionGenerator(env).generate('submit JSON', 'inspect', [image]),
      ).rejects.toThrow('MODEL_AUTH_FAILED');
      const content = request.messages.find(
        (m: any) => m.role === 'user',
      ).content;
      expect(content).toEqual(
        expect.arrayContaining([
          expect.objectContaining(
            protocol === 'openai'
              ? {
                  type: 'image_url',
                  image_url: { url: `data:image/png;base64,${image.data}` },
                }
              : {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/png',
                    data: image.data,
                  },
                },
          ),
        ]),
      );
      await expect(
        piVisionGenerator(env).generate('s', 'u', []),
      ).rejects.toThrow('REVIEW_IMAGES_REQUIRED');
    } finally {
      server.closeAllConnections();
      await new Promise<void>((r) => server.close(() => r()));
    }
  },
);
