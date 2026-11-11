import { createBrowserRuntime } from '../../packages/renderer/src/browser-runtime.js';

const production = {
  projectId: 'browser-runtime-child',
  revision: 1,
  stage: 'illustrating',
  aspectRatio: '16:9',
  brief: { topic: 'runtime', style: 'warm', language: 'zh' },
  durationMs: 1000,
  artifacts: {},
  events: [],
  scenes: [
    {
      id: 'scene',
      title: '浏览器运行时',
      visual: '一个主体',
      beats: ['主体'],
      cues: [{ id: 'cue', text: '测试。', startMs: 0, endMs: 1000 }],
      artwork: {
        version: 2,
        intent: '故意越界以验证浏览器测量结果',
        elements: [
          {
            id: 'outside',
            type: 'rect',
            x: 300,
            y: 300,
            width: 300,
            height: 300,
            cueIndex: 0,
            transition: 'rise',
            fill: 'accent',
            stroke: 'none',
            strokeWidth: 0,
            opacity: 1,
            radius: 16,
            layer: 0,
          },
        ],
        tracks: [
          {
            elementId: 'outside',
            property: 'move',
            easing: 'linear',
            keyframes: [
              {
                at: { cueId: 'cue', progress: 0, offsetMs: 0 },
                value: { x: 2500, y: 300 },
              },
            ],
          },
        ],
      },
    },
  ],
} as any;

const runtime = createBrowserRuntime({ phase: 'reviewing' });
try {
  const page = await runtime.newFilmPage(production);
  await page.renderAt(0);
  const issues = await page.measure({
    atMs: 0,
    decorativeIds: ['outside', 'item-0', 'item-1', 'item-2', 'item-3'],
  });
  process.stdout.write(JSON.stringify({ count: issues.length }));
  await page.close();
} finally {
  await runtime.close();
}
