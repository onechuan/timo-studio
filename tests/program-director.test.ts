import { expect, it } from 'vitest';
import { illustrateFilmSceneProgram } from '../packages/agent/src/director/index.js';
import type { Production } from '../packages/contracts/src/index.js';
import { createHash } from 'node:crypto';

const production = (): Production => ({
  projectId: 'program-director',
  revision: 1,
  stage: 'illustrating',
  aspectRatio: '16:9',
  brief: {
    topic: '第一性原理',
    materials: '',
    durationSec: 30,
    language: 'zh',
    style: 'chalk',
    voiceProvider: 'local',
    voice: '',
  },
  scenes: [
    {
      id: 'p01',
      title: '拆开假设',
      visual: '把假设逐层剥离，留下事实',
      beats: ['假设', '事实'],
      cues: [
        { id: 'q1', text: '先拆开默认假设。', startMs: 0, endMs: 1000 },
        { id: 'q2', text: '再从事实重构。', startMs: 1000, endMs: 2000 },
      ],
    },
  ],
  durationMs: 2000,
  artifacts: { audio: 'audio.wav' },
  events: [],
});

it('stores a trusted-hash V3 drawing program with the mapped engine style', async () => {
  const source =
    "TIMO.visual('p01', P => { P.title('第一性原理', { accent: 'yellow' }); P.ring(960, 540, 300, 300, { at: P.c(0), color: 'yellow' }); });";
  let system = '';
  const next = await illustrateFilmSceneProgram(production(), 0, {
    generate: async () => ({ value: {}, usage: { input: 0, output: 0 } }),
    generateStructured: async (received) => {
      system = received;
      return {
        value: {
          sceneId: 'p01',
          artwork: {
            version: 3,
            runtime: 'timotv-dsl-1',
            intent: '黄色圆环聚焦事实',
            source,
            style: 'chalkboard',
            extras: [],
          },
        },
        usage: { input: 10, output: 20 },
      };
    },
  });
  expect(next.scenes[0]!.artwork).toMatchObject({
    version: 3,
    runtime: 'timotv-dsl-1',
    style: 'chalkboard',
    source,
    sourceHash: createHash('sha256').update(source).digest('hex'),
  });
  expect(system).toContain('TIMO.visual');
  expect(system).toContain('P.c(0)');
  expect(next.usage).toEqual({ input: 10, output: 20 });
});

it('retries unsafe or wrong-style program output without persisting it', async () => {
  const outputs = [
    {
      sceneId: 'p01',
      artwork: {
        version: 3,
        runtime: 'timotv-dsl-1',
        intent: '不安全',
        source:
          "TIMO.visual('p01', P => { fetch('https://example.com'); P.title('x'); });",
        style: 'warm-story',
        extras: [],
      },
    },
    {
      sceneId: 'p01',
      artwork: {
        version: 3,
        runtime: 'timotv-dsl-1',
        intent: '安全页面',
        source: "TIMO.visual('p01', P => P.title('事实'));",
        style: 'chalkboard',
        extras: [],
      },
    },
  ];
  const users: string[] = [];
  const next = await illustrateFilmSceneProgram(production(), 0, {
    generate: async () => ({ value: {}, usage: { input: 0, output: 0 } }),
    generateStructured: async (_system, user) => {
      users.push(user);
      return {
        value: outputs.shift(),
        usage: { input: 1, output: 1 },
      };
    },
  });
  expect(next.scenes[0]!.artwork).toMatchObject({
    version: 3,
    style: 'chalkboard',
  });
  expect(users).toHaveLength(2);
  expect(users[1]).toContain('repair');
  expect(users[1]).not.toContain('https://example.com');
});

it('sends the checked Film Kit, continuity summary, and local cue timing', async () => {
  const p = production();
  const firstSource = "TIMO.visual('p01', P => P.title('同一只咖啡杯'));";
  const kitSource =
    'PV.Builder.prototype.coffeeCup=function(){};B.coffeeCup=function(){};';
  p.scenes[0]!.artwork = {
    version: 3,
    runtime: 'timotv-dsl-1',
    intent: '白色咖啡杯放在左侧，橙色代表热量',
    source: firstSource,
    sourceHash: createHash('sha256').update(firstSource).digest('hex'),
    style: 'chalkboard',
    extras: [],
  };
  p.scenes.push({
    id: 'p02',
    title: '热量流动',
    visual: '同一只杯子旁出现热量箭头',
    beats: ['杯子', '热量'],
    cues: [{ id: 'q3', text: '热量从杯中散出。', startMs: 2000, endMs: 3000 }],
  });
  p.visual = {
    upstreamRevision: '6145f7e3482628543bd6f2d68fe3b618d366213a',
    engineRevision: `sha256:${'a'.repeat(64)}`,
    style: 'chalkboard',
    filmKit: {
      status: 'passed',
      source: kitSource,
      sourceHash: createHash('sha256').update(kitSource).digest('hex'),
      components: [
        {
          name: 'coffeeCup',
          what: '同一只白色咖啡杯',
          pages: ['p01', 'p02'],
          status: 'passed',
          source: kitSource,
          sourceHash: createHash('sha256').update(kitSource).digest('hex'),
        },
      ],
    },
  };
  let request: Record<string, any> = {};
  let system = '';
  const source =
    "TIMO.visual('p02', P => { P.coffeeCup(600,500,{at:P.c(0)}); });";
  await illustrateFilmSceneProgram(p, 1, {
    generate: async () => ({ value: {}, usage: { input: 0, output: 0 } }),
    generateStructured: async (receivedSystem, user) => {
      system = receivedSystem;
      request = JSON.parse(user);
      return {
        value: {
          sceneId: 'p02',
          artwork: {
            version: 3,
            runtime: 'timotv-dsl-1',
            intent: '延续上一页的杯子并展示热量流动',
            source,
            style: 'chalkboard',
            extras: [],
          },
        },
        usage: { input: 1, output: 1 },
      };
    },
  });

  expect(request.filmKit.components).toContain('coffeeCup');
  expect(request.previousPage.sceneId).toBe('p01');
  expect(request.cues[0].localStartSec).toBe(0);
  expect(request.standingDirections.engineStyle).toBe('chalkboard');
  expect(system).toContain('黑板');
});
