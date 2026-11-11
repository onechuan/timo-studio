import { it, expect } from 'vitest';
import {
  planFilm,
  reviseScriptForDuration,
  writeFilmScript,
} from '../packages/agent/src/director/index.js';
import type { Production } from '../packages/contracts/src/index.js';
import { productionBriefSchema } from '../packages/contracts/src/production.js';
const p: Production = {
  aspectRatio: '16:9',
  projectId: 'test',
  revision: 0,
  stage: 'draft',
  brief: {
    topic: '复利',
    materials: '',
    durationSec: 60,
    language: 'zh',
    style: 'warm',
    voiceProvider: 'local',
    voice: '',
  },
  scenes: [],
  artifacts: {},
  events: [],
};
it.each([
  [undefined, '通用讲解'],
  ['general', '通用讲解'],
  ['explainer', '科普口播'],
  ['product', '产品介绍'],
])(
  '按创作方向 %s 加载对应 Skill 和当前阶段参考',
  async (contentType, label) => {
    const brief = productionBriefSchema.parse({ ...p.brief, contentType });
    const storyboard = {
      title: '测试',
      summary: '核心问题',
      scenes: [
        {
          id: 'p01',
          title: '开始',
          say: '解释原因',
          visual: '树',
          beats: ['发芽'],
        },
      ],
    };
    const prompts: string[] = [];
    const planned = await planFilm(
      { ...p, brief },
      {
        generate: async (system) => {
          prompts.push(system);
          return { value: storyboard, usage: { input: 1, output: 1 } };
        },
      },
    );
    await writeFilmScript(planned, {
      generate: async (system) => {
        prompts.push(system);
        return {
          value: {
            scenes: [
              {
                ...storyboard.scenes[0],
                cues: [{ id: 'c01', text: '种子会发芽。' }],
              },
            ],
          },
          usage: { input: 1, output: 1 },
        };
      },
    });
    for (const system of prompts) {
      expect(system).toContain(`# ${label}`);
      expect(system).toContain('submit');
      for (const other of ['通用讲解', '科普口播', '产品介绍'].filter(
        (x) => x !== label,
      ))
        expect(system).not.toContain(`# ${other}`);
    }
    expect(prompts[0]).toContain('## 分镜参考');
    expect(prompts[0]).toContain('## 导演方法');
    expect(prompts[0]).not.toContain('## 口播打磨');
    expect(prompts[0]).not.toContain('## 口播参考');
    expect(prompts[1]).toContain('## 口播参考');
    expect(prompts[1]).toContain('## 口播打磨');
    expect(prompts[1]).not.toContain('## 导演方法');
    expect(prompts[1]).not.toContain('## 分镜参考');
  },
);
it('写稿保留主题中的创作要求及原始资料，不只传递分镜摘要', async () => {
  const topic = '冷杯凝结；逐字保留资料中的 VO，不念 Visual。';
  const materials = 'VO: 杯子没有漏水。\nVisual: 杯壁上出现水滴。';
  const scene = {
    id: 'p01',
    title: '冷杯',
    say: '说明水滴来源',
    visual: '杯壁水滴示意',
    beats: ['冷杯壁', '水蒸气凝结'],
  };
  let received: Record<string, unknown> = {};
  await writeFilmScript(
    {
      ...p,
      brief: { ...p.brief, topic, materials },
      storyboard: { title: '冷杯', summary: '水来自空气', scenes: [scene] },
    },
    {
      generate: async (_system, user) => {
        received = JSON.parse(user);
        return {
          value: {
            scenes: [
              { ...scene, cues: [{ id: 'c01', text: '杯子没有漏水。' }] },
            ],
          },
          usage: { input: 1, output: 1 },
        };
      },
    },
  );
  expect(received.topic).toBe(topic);
  expect(received.materials).toBe(materials);
  expect(received.storyboard).toMatchObject({ scenes: [scene] });
});
it('模型分镜结果必须经过结构校验', async () => {
  await expect(
    planFilm(p, {
      generate: async () => ({
        value: { title: 'x' },
        usage: { input: 1, output: 1 },
      }),
    }),
  ).rejects.toThrow();
});
it('写稿必须完整覆盖批准分镜，禁止漏页', async () => {
  const plan = {
    title: '复利',
    summary: '收益再投入',
    scenes: [
      {
        id: 'p01',
        title: '开始',
        say: '本金',
        visual: '一棵树',
        beats: ['发芽'],
      },
      {
        id: 'p02',
        title: '之后',
        say: '收益',
        visual: '两棵树',
        beats: ['生长'],
      },
    ],
  };
  await expect(
    writeFilmScript(
      { ...p, storyboard: plan },
      {
        generate: async () => ({
          value: {
            scenes: [
              {
                id: 'p01',
                title: '开始',
                visual: '树',
                beats: ['发芽'],
                cues: [{ id: 'c0', text: '本金会产生利息。' }],
              },
            ],
          },
          usage: { input: 1, output: 1 },
        }),
      },
    ),
  ).rejects.toThrow('分镜');
});

it('five-minute AI scripts receive one deficit-aware estimate correction', async () => {
  const storyboard = {
    title: '长期管理',
    summary: '解释管理循环',
    scenes: [
      {
        id: 'p01',
        title: '循环',
        say: '目标、执行和反馈',
        visual: '三个节点形成循环',
        beats: ['目标', '执行', '反馈'],
        targetDurationSec: 300,
      },
    ],
  };
  const users: string[] = [];
  let calls = 0;
  const result = await writeFilmScript(
    {
      ...p,
      brief: { ...p.brief, durationSec: 300 },
      storyboard,
    },
    {
      generate: async (_system, user) => {
        users.push(user);
        calls++;
        const text =
          calls === 1
            ? '目标明确以后，团队开始执行，并根据反馈调整。'.repeat(12)
            : '目标明确以后，团队开始执行，并根据真实反馈调整下一轮行动。'.repeat(
                48,
              );
        return {
          value: {
            scenes: [
              {
                ...storyboard.scenes[0],
                cues: Array.from({ length: calls === 1 ? 3 : 12 }, (_, i) => ({
                  id: `p01-c${i}`,
                  text: text.slice(
                    i * Math.ceil(text.length / (calls === 1 ? 3 : 12)),
                    (i + 1) * Math.ceil(text.length / (calls === 1 ? 3 : 12)),
                  ),
                })).filter((cue) => cue.text),
              },
            ],
          },
          usage: { input: 1, output: 1 },
        };
      },
    },
  );

  expect(calls).toBe(2);
  expect(users[1]).toContain('estimatedDeficitMs');
  expect(result.durationState?.estimatedMs).toBeGreaterThanOrEqual(255_000);
});

it('verbatim mode preserves every code point and never calls the model', async () => {
  const source = '第一句，保持原样。\n第二句也不能改！';
  const generated = await writeFilmScript(
    {
      ...p,
      brief: {
        ...p.brief,
        narrationMode: 'verbatim',
        sourceNarration: source,
      },
      storyboard: {
        title: '原稿',
        summary: '逐字',
        scenes: [
          {
            id: 'p01',
            title: '第一段',
            say: '第一段',
            visual: '第一页',
            beats: ['一'],
            targetDurationSec: 30,
          },
          {
            id: 'p02',
            title: '第二段',
            say: '第二段',
            visual: '第二页',
            beats: ['二'],
            targetDurationSec: 30,
          },
        ],
      },
    },
    {
      generate: async () => {
        throw new Error('model must not be called');
      },
    },
  );

  expect(
    generated.scenes
      .flatMap((scene) => scene.cues)
      .map((cue) => cue.text)
      .join(''),
  ).toBe(source);
});

it('calibrates correction with actual audio timing and supplies per-scene length budgets', async () => {
  const scene = {
    id: 'p01',
    title: '咖啡',
    say: '认识咖啡',
    visual: '杯',
    beats: ['杯'],
    targetDurationSec: 300,
    cues: [
      {
        id: 'p01-c0',
        text: '认识咖啡。'.repeat(100),
        startMs: 0,
        endMs: 175000,
      },
    ],
  };
  let request: any;
  const source = {
    ...p,
    brief: { ...p.brief, durationSec: 300 },
    durationMs: 175000,
    artifacts: { audio: 'old.wav' },
    storyboard: { title: '咖啡', summary: '咖啡', scenes: [scene] },
    scenes: [scene],
  };
  await reviseScriptForDuration(source, 300000, {
    generate: async (_system, user) => {
      request = JSON.parse(user);
      return {
        value: {
          scenes: [
            {
              ...scene,
              cues: [0, 1].map((i) => ({
                id: `p01-c${i}`,
                text: '认识咖啡。'.repeat(85),
              })),
            },
          ],
        },
        usage: { input: 1, output: 1 },
      };
    },
  });
  expect(request.measuredMs).toBe(175000);
  expect(request.measuredDeficitMs).toBe(125000);
  expect(request.expansionRatio).toBeCloseTo(300 / 175);
  expect(request.perScene[0]).toMatchObject({
    measuredMs: 175000,
    targetTextUnits: 686,
  });
});
it('retains existing audio when a rewrite moves farther from the target', async () => {
  const scene = {
    id: 'p01',
    title: '咖啡',
    say: '认识咖啡',
    visual: '杯',
    beats: ['杯'],
    targetDurationSec: 300,
    cues: [
      {
        id: 'p01-c0',
        text: '认识咖啡。'.repeat(100),
        startMs: 0,
        endMs: 175000,
      },
    ],
  };
  const source = {
    ...p,
    brief: { ...p.brief, durationSec: 300 },
    durationMs: 175000,
    artifacts: { audio: 'old.wav' },
    storyboard: { title: '咖啡', summary: '咖啡', scenes: [scene] },
    scenes: [scene],
  };
  const result = await reviseScriptForDuration(source, 300000, {
    generate: async () => ({
      value: {
        scenes: [
          { ...scene, cues: [{ id: 'p01-c0', text: '认识咖啡。'.repeat(80) }] },
        ],
      },
      usage: { input: 1, output: 1 },
    }),
  });
  expect(result.scenes).toEqual(source.scenes);
  expect(result.artifacts.audio).toBe('old.wav');
});
