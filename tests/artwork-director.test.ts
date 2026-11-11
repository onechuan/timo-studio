import { expect, it, vi } from 'vitest';
import {
  illustrateFilmScene,
  writeFilmScript,
} from '../packages/agent/src/director/index.js';
import {
  isLegacyArtwork,
  productionBriefSchema,
  type Production,
} from '../packages/contracts/src/index.js';
const scene = {
  id: 's1',
  title: '冷杯',
  visual: '杯外水滴',
  layout: 'hero' as const,
  beats: ['杯壁', '水滴'],
  cues: [
    { id: 'c1', text: '杯子没有漏水。', startMs: 0, endMs: 1400 },
    { id: 'c2', text: '水汽凝结了。', startMs: 1400, endMs: 3000 },
  ],
};
const p: Production = {
  projectId: 'p',
  revision: 1,
  aspectRatio: '16:9',
  stage: 'illustrating',
  brief: productionBriefSchema.parse({ topic: '冷杯' }),
  scenes: [scene],
  artifacts: { audio: 'audio.wav' },
  events: [],
};
const generatedArtwork = (value: Production, index = 0) => {
  const result = value.scenes[index]?.artwork;
  if (!isLegacyArtwork(result)) throw new Error('Expected legacy artwork');
  return result;
};
const artwork = {
  version: 1,
  intent: '中央大杯，杯外凝结',
  elements: [
    {
      id: 'cup',
      type: 'illustration',
      name: 'cup',
      x: 500,
      y: 200,
      width: 400,
      height: 400,
      cueIndex: 0,
    },
  ],
};
it('accepts faint artwork and fits a static label overflowing by two pixels without regenerating', async () => {
  const value = {
    sceneId: 's1',
    artwork: {
      ...artwork,
      version: 2,
      elements: [
        ...artwork.elements,
        {
          id: 'shade',
          type: 'rect',
          x: 920,
          y: 500,
          width: 100,
          height: 100,
          cueIndex: 1,
          opacity: 0.05,
        },
        {
          id: 'label',
          type: 'text',
          text: '常见做法',
          fontSize: 28,
          x: 920,
          y: 636,
          width: 350,
          height: 56,
          cueIndex: 1,
        },
      ].map((e) => ({ ...e, layer: 0 })),
      tracks: [],
    },
  };
  const generate = vi.fn(async () => ({
    value,
    usage: { input: 1, output: 1 },
  }));
  const next = await illustrateFilmScene(p, 0, { generate });
  expect(generate).toHaveBeenCalledTimes(1);
  expect(generatedArtwork(next).elements[1].opacity).toBe(0.05);
  expect(generatedArtwork(next).elements[2]).toMatchObject({
    x: 920,
    y: 634,
    width: 350,
    height: 56,
  });
  expect(value.artwork.elements[2].y).toBe(636);
  expect(next.artifacts).toEqual(p.artifacts);
});
it('does not count an invisible object as the required opening subject', async () => {
  const generate = vi.fn(async () => ({
    value: {
      sceneId: 's1',
      artwork: {
        ...artwork,
        version: 2,
        elements: [
          { ...artwork.elements[0], layer: 0, opacity: 0 },
          {
            id: 'label',
            type: 'text',
            text: '标题',
            fontSize: 28,
            x: 100,
            y: 200,
            width: 200,
            height: 56,
            cueIndex: 0,
            layer: 1,
          },
        ],
      },
    },
    usage: { input: 1, output: 1 },
  }));
  await expect(illustrateFilmScene(p, 0, { generate })).rejects.toThrow(
    '主体绘图对象',
  );
});
it('accepts v2 compositions above the legacy 24-object budget without dropping objects or tracks', async () => {
  const elements = Array.from({ length: 32 }, (_, i) => ({
    ...artwork.elements[0],
    id: `part${i}`,
    type: 'rect',
    layer: i,
    x: 100 + (i % 8) * 160,
    y: 200 + Math.floor(i / 8) * 110,
    width: 100,
    height: 100,
  }));
  const tracks = [
    {
      elementId: 'part31',
      property: 'opacity',
      keyframes: [{ at: { cueId: 'c1', progress: 0 }, value: 1 }],
    },
  ];
  const generate = vi.fn(async () => ({
    value: {
      sceneId: 's1',
      artwork: { version: 2, intent: '组合图形', elements, tracks },
    },
    usage: { input: 1, output: 1 },
  }));
  const next = await illustrateFilmScene(p, 0, { generate });
  expect(generatedArtwork(next).elements).toHaveLength(32);
  expect(next.scenes[0].artwork).toMatchObject({ tracks });
  expect(generate).toHaveBeenCalledTimes(1);
});
it('passes actual timing and approved visual plan and preserves audio/script', async () => {
  const generate = vi.fn(async (_system: string, _user: string) => ({
    value: { sceneId: 's1', artwork },
    usage: { input: 2, output: 4 },
  }));
  const next = await illustrateFilmScene(p, 0, { generate });
  expect(JSON.parse(generate.mock.calls[0]![1]!)).toMatchObject({
    cues: [
      { startMs: 0, endMs: 1400 },
      { startMs: 1400, endMs: 3000 },
    ],
    layout: 'hero',
    visual: '杯外水滴',
  });
  expect(generatedArtwork(next).elements).toHaveLength(1);
  expect(next.artifacts).toEqual(p.artifacts);
  expect(next.scenes[0].cues).toEqual(scene.cues);
  expect(p.scenes[0].artwork).toBeUndefined();
});

it('prefers structured generation and normalizes an oversized text font before Zod validation', async () => {
  const generate = vi.fn(async () => {
    throw new Error('legacy generator should not be used');
  });
  const generateStructured = vi.fn(
    async (_system: string, _user: string, _schema: unknown) => ({
      value: {
        sceneId: 's1',
        artwork: {
          ...artwork,
          version: 2,
          elements: [
            { ...artwork.elements[0], layer: 0 },
            {
              id: 'verdict',
              type: 'text',
              text: '结论',
              fontSize: 140,
              x: 100,
              y: 530,
              width: 1000,
              height: 130,
              cueIndex: 1,
              layer: 1,
            },
          ],
          tracks: [],
        },
      },
      usage: { input: 2, output: 3 },
    }),
  );
  const next = await illustrateFilmScene(p, 0, {
    generate,
    generateStructured,
  });
  expect(generate).not.toHaveBeenCalled();
  expect(generateStructured).toHaveBeenCalledTimes(1);
  const schema = generateStructured.mock.calls[0]![2] as any;
  const element = schema.properties.artwork.properties.elements.items;
  expect(element.required).toEqual(
    expect.arrayContaining(['x', 'y', 'width', 'height']),
  );
  expect(element.properties.fontSize.maximum).toBe(100);
  expect(
    generatedArtwork(next).elements.find((e) => e.id === 'verdict'),
  ).toMatchObject({ fontSize: 100 });
});

it('expands a text box to the minimum line height before semantic validation', async () => {
  const generate = vi.fn(async () => ({
    value: {
      sceneId: 's1',
      artwork: {
        ...artwork,
        version: 2,
        elements: [
          { ...artwork.elements[0], layer: 0 },
          {
            id: 'analogy-label',
            type: 'text',
            text: '大家都这么做',
            fontSize: 34,
            x: 100,
            y: 500,
            width: 400,
            height: 30,
            cueIndex: 1,
            layer: 1,
          },
        ],
        tracks: [],
      },
    },
    usage: { input: 1, output: 1 },
  }));
  const next = await illustrateFilmScene(p, 0, { generate });
  expect(generate).toHaveBeenCalledTimes(1);
  expect(
    generatedArtwork(next).elements.find((e) => e.id === 'analogy-label'),
  ).toMatchObject({ fontSize: 34, height: 41 });
});

it('retains only a safe structural draft when required geometry is missing', async () => {
  const generate = vi
    .fn()
    .mockResolvedValueOnce({
      value: {
        sceneId: 's1',
        artwork: {
          version: 2,
          intent: 'provider free text must not return',
          elements: [
            {
              id: 'assembly',
              type: 'group',
              cueIndex: 0,
              layer: 0,
              unknown: 'provider-secret',
            },
          ],
          tracks: [],
        },
      },
      usage: { input: 1, output: 1 },
    })
    .mockResolvedValueOnce({
      value: { sceneId: 's1', artwork },
      usage: { input: 1, output: 1 },
    });
  await illustrateFilmScene(p, 0, { generate });
  const repair = JSON.parse(generate.mock.calls[1]![1]!).repair;
  expect(repair.draft).toEqual({
    sceneId: 's1',
    artwork: {
      version: 2,
      elements: [{ id: 'assembly', type: 'group', cueIndex: 0, layer: 0 }],
      tracks: [],
    },
  });
  expect(JSON.stringify(repair)).not.toContain('provider-secret');
  expect(JSON.stringify(repair)).not.toContain('provider free text');
});
it.each([
  { x: 1530, type: 'rect' },
  { cueIndex: 2 },
  { cueIndex: 1 },
  { type: 'text', text: '文字不能代替画', fontSize: 24 },
])(
  'repairs invalid geometry/cue/initial object/text once: %j',
  async (invalid) => {
    const generate = vi
      .fn()
      .mockResolvedValueOnce({
        value: {
          sceneId: 's1',
          artwork: {
            ...artwork,
            elements: [{ ...artwork.elements[0], ...invalid }],
          },
        },
        usage: { input: 2, output: 3 },
      })
      .mockResolvedValueOnce({
        value: { sceneId: 's1', artwork },
        usage: { input: 2, output: 3 },
      });
    const next = await illustrateFilmScene(p, 0, { generate });
    expect(generate).toHaveBeenCalledTimes(2);
    expect(
      JSON.parse(generate.mock.calls[1][1]).repair.issues.length,
    ).toBeGreaterThan(0);
    expect(next.usage).toEqual({ input: 4, output: 6 });
  },
);
it('fails safely after one bounded repair without reflecting provider content', async () => {
  const generate = vi.fn(async (_system: string, _user: string) => ({
    value: { secret: 'provider-secret' },
    usage: { input: 1, output: 1 },
  }));
  await expect(illustrateFilmScene(p, 0, { generate })).rejects.toThrow(
    '绘图格式校验失败',
  );
  expect(generate).toHaveBeenCalledTimes(2);
  expect(JSON.stringify(generate.mock.calls[1])).not.toContain(
    'provider-secret',
  );
});
it('restores approved composition when script model changes visual decisions', async () => {
  const next = await writeFilmScript(
    {
      ...p,
      storyboard: {
        title: '冷杯',
        summary: '来源',
        scenes: [{ ...scene, say: '来源' }],
      },
    },
    {
      generate: async () => ({
        value: {
          scenes: [
            {
              ...scene,
              title: '错误',
              visual: '机器人',
              layout: 'comparison',
              beats: ['错误'],
            },
          ],
        },
        usage: { input: 1, output: 1 },
      }),
    },
  );
  expect(next.scenes[0]).toMatchObject({
    title: scene.title,
    visual: scene.visual,
    layout: scene.layout,
    beats: scene.beats,
  });
  expect(next.scenes[0].cues[0].startMs).toBeUndefined();
});

it('limits newly generated object counts and intent before accepting a page', async () => {
  const oversized = {
    ...artwork,
    intent: '长'.repeat(201),
    elements: Array.from({ length: 25 }, (_, i) => ({
      ...artwork.elements[0],
      id: `object-${i}`,
    })),
  };
  const generate = vi
    .fn()
    .mockResolvedValueOnce({
      value: { sceneId: 's1', artwork: oversized },
      usage: { input: 1, output: 1 },
    })
    .mockResolvedValueOnce({
      value: { sceneId: 's1', artwork },
      usage: { input: 1, output: 1 },
    });
  await illustrateFilmScene(p, 0, { generate });
  expect(generate).toHaveBeenCalledTimes(2);
  expect(
    JSON.parse(generate.mock.calls[1][1]).repair.issues.join(' '),
  ).toContain('24');
  expect(
    JSON.parse(generate.mock.calls[1][1]).repair.issues.join(' '),
  ).toContain('200');
});

it('retries output-limit failure once with compact composition instructions', async () => {
  const generate = vi
    .fn()
    .mockRejectedValueOnce(new Error('MODEL_OUTPUT_LIMIT'))
    .mockResolvedValueOnce({
      value: { sceneId: 's1', artwork },
      usage: { input: 1, output: 1 },
    });
  await illustrateFilmScene(p, 0, { generate });
  expect(generate).toHaveBeenCalledTimes(2);
  expect(
    JSON.parse(generate.mock.calls[1][1]).repair.issues.join(' '),
  ).toContain('4–8');
  const fails = vi.fn().mockRejectedValue(new Error('MODEL_OUTPUT_LIMIT'));
  await expect(illustrateFilmScene(p, 0, { generate: fails })).rejects.toThrow(
    'MODEL_OUTPUT_LIMIT',
  );
  expect(fails).toHaveBeenCalledTimes(2);
});
it('retries a missing structured tool submission once', async () => {
  const generate = vi
    .fn()
    .mockRejectedValueOnce(new Error('MODEL_NO_SUBMISSION'))
    .mockResolvedValueOnce({
      value: { sceneId: 's1', artwork },
      usage: { input: 1, output: 1 },
    });
  await illustrateFilmScene(p, 0, { generate });
  expect(generate).toHaveBeenCalledTimes(2);
  expect(
    JSON.parse(generate.mock.calls[1]![1]!).repair.issues.join(' '),
  ).toContain('submit');
});
it('does not retry authentication failures', async () => {
  const generate = vi.fn().mockRejectedValue(new Error('MODEL_AUTH_FAILED'));
  await expect(illustrateFilmScene(p, 0, { generate })).rejects.toThrow(
    'MODEL_AUTH_FAILED',
  );
  expect(generate).toHaveBeenCalledTimes(1);
});

it('repairs a validated draft with precise safe object bounds instead of regenerating blind', async () => {
  const outOfBounds = {
    ...artwork,
    elements: [
      {
        ...artwork.elements[0],
        id: 'noRecord',
        type: 'rect',
        y: 500,
        height: 200,
      },
    ],
  };
  const generate = vi
    .fn()
    .mockResolvedValueOnce({
      value: { sceneId: 's1', artwork: outOfBounds },
      usage: { input: 1, output: 1 },
    })
    .mockResolvedValueOnce({
      value: { sceneId: 's1', artwork },
      usage: { input: 1, output: 1 },
    });
  await illustrateFilmScene(p, 0, { generate });
  const repair = JSON.parse(generate.mock.calls[1][1]).repair;
  expect(repair.draft.artwork.elements[0]).toMatchObject({
    id: 'noRecord',
    y: 500,
    height: 200,
  });
  expect(repair.issues.join(' ')).toContain('对象 noRecord');
  expect(repair.issues.join(' ')).toContain('y+height<=690');
  expect(repair.issues.join(' ')).toContain('下边=700');
});
it.each([
  { sceneId: 'wrong', artwork },
  {
    sceneId: 's1',
    artwork: {
      ...artwork,
      elements: [{ ...artwork.elements[0], id: '<script>secret</script>' }],
    },
  },
  {
    sceneId: 's1',
    artwork: {
      ...artwork,
      elements: [
        { ...artwork.elements[0], type: 'path', d: '<script>secret</script>' },
      ],
    },
  },
])(
  'never echoes invalid draft or arbitrary object IDs in repair data',
  async (invalid) => {
    const generate = vi
      .fn()
      .mockResolvedValueOnce({ value: invalid, usage: { input: 1, output: 1 } })
      .mockResolvedValueOnce({
        value: { sceneId: 's1', artwork },
        usage: { input: 1, output: 1 },
      });
    await illustrateFilmScene(p, 0, { generate });
    const user = generate.mock.calls[1][1];
    expect(JSON.parse(user).repair.draft).toBeUndefined();
    expect(user).not.toContain('<script>');
    expect(user).not.toContain('secret');
  },
);

it.each(['illustration', 'path', 'ellipse', 'text'] as const)(
  'fits text overlapping %s even when its cue is later',
  async (type) => {
    const subject =
      type === 'illustration'
        ? artwork.elements[0]
        : {
            ...artwork.elements[0],
            id: 'subject',
            type,
            ...(type === 'path' ? { d: 'M0 0 L100 100' } : {}),
            ...(type === 'text' ? { text: '主体', fontSize: 36 } : {}),
          };
    const label = {
      id: 'verdict',
      type: 'text',
      text: '结论',
      fontSize: 36,
      x: 550,
      y: 300,
      width: 200,
      height: 60,
      cueIndex: 1,
    };
    const overlapping = {
      ...artwork,
      elements: [
        artwork.elements[0],
        ...(type === 'illustration' ? [] : [subject]),
        label,
      ],
    };
    const generate = vi
      .fn()
      .mockResolvedValueOnce({
        value: { sceneId: 's1', artwork: overlapping },
        usage: { input: 1, output: 1 },
      })
      .mockResolvedValueOnce({
        value: {
          sceneId: 's1',
          artwork: {
            ...artwork,
            elements: [artwork.elements[0], { ...label, x: 100, y: 300 }],
          },
        },
        usage: { input: 1, output: 1 },
      });
    const next = await illustrateFilmScene(p, 0, { generate });
    expect(generate).toHaveBeenCalledTimes(1);
    const fittedLabel = generatedArtwork(next).elements.find(
      (e) => e.id === 'verdict',
    )!;
    expect(fittedLabel).toMatchObject({ text: '结论', cueIndex: 1 });
    expect([fittedLabel.x, fittedLabel.y]).not.toEqual([label.x, label.y]);
  },
);
it('allows text on background rects and keeps overlapping custom object parts valid', async () => {
  const value = {
    sceneId: 's1',
    artwork: {
      ...artwork,
      elements: [
        artwork.elements[0],
        {
          id: 'bowl-detail',
          type: 'path',
          d: 'M0 0 L100 100',
          x: 550,
          y: 250,
          width: 200,
          height: 200,
          cueIndex: 0,
        },
        {
          id: 'panel',
          type: 'rect',
          x: 100,
          y: 300,
          width: 250,
          height: 100,
          cueIndex: 0,
        },
        {
          id: 'label',
          type: 'text',
          text: '注释',
          fontSize: 36,
          x: 120,
          y: 320,
          width: 200,
          height: 50,
          cueIndex: 0,
        },
      ],
    },
  };
  const generate = vi
    .fn()
    .mockResolvedValue({ value, usage: { input: 1, output: 1 } });
  await illustrateFilmScene(p, 0, { generate });
  expect(generate).toHaveBeenCalledTimes(1);
});

it('fits independent illustrations and border labels without rewriting words or custom geometry', async () => {
  const original = {
    ...artwork,
    elements: [
      { ...artwork.elements[0], x: 1400, y: 600 },
      {
        id: 'caption',
        type: 'text',
        text: '完整的原文不截断',
        fontSize: 36,
        x: 1500,
        y: 720,
        width: 120,
        height: 50,
        cueIndex: 1,
      },
      {
        id: 'detail',
        type: 'path',
        d: 'M0 0 L100 100',
        x: 80,
        y: 200,
        width: 100,
        height: 100,
        cueIndex: 0,
      },
    ],
  };
  const generate = vi.fn().mockResolvedValue({
    value: { sceneId: 's1', artwork: original },
    usage: { input: 1, output: 1 },
  });
  const next = await illustrateFilmScene(p, 0, { generate });
  expect(generate).toHaveBeenCalledTimes(1);
  const items = generatedArtwork(next).elements;
  for (const e of items) {
    expect(e.x + e.width).toBeLessThanOrEqual(1536);
    expect(e.y + e.height).toBeLessThanOrEqual(690);
  }
  expect(items.find((e) => e.id === 'caption')).toMatchObject({
    text: '完整的原文不截断',
    cueIndex: 1,
  });
  expect(items.find((e) => e.id === 'detail')).toMatchObject(
    original.elements[2],
  );
});
it('keeps impossible crowded pages rejected without silently dropping text', async () => {
  const crowded = {
    ...artwork,
    elements: [
      {
        id: 'solid',
        type: 'path',
        d: 'M0 0 L100 0 L100 100 L0 100 Z',
        x: 64,
        y: 180,
        width: 1472,
        height: 510,
        cueIndex: 0,
      },
      {
        id: 'caption',
        type: 'text',
        text: '必须保留',
        fontSize: 36,
        x: 200,
        y: 300,
        width: 200,
        height: 60,
        cueIndex: 0,
      },
    ],
  };
  const generate = vi.fn().mockResolvedValue({
    value: { sceneId: 's1', artwork: crowded },
    usage: { input: 1, output: 1 },
  });
  await expect(illustrateFilmScene(p, 0, { generate })).rejects.toThrow(
    '绘图格式校验失败',
  );
  expect(generate).toHaveBeenCalledTimes(2);
  expect(
    JSON.parse(generate.mock.calls[1][1]).repair.draft.artwork.elements,
  ).toHaveLength(2);
});

it('retains original artwork for feedback repair and preserves v2 groups and tracks', async () => {
  const v2 = {
    version: 2,
    intent: '液位上升',
    elements: [
      {
        id: 'assembly',
        type: 'group',
        x: 500,
        y: 200,
        width: 400,
        height: 400,
        cueIndex: 0,
        layer: 0,
      },
      {
        id: 'tank',
        parentId: 'assembly',
        type: 'component',
        name: 'liquid',
        state: 'active',
        parameter: 0.2,
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        cueIndex: 0,
        layer: 1,
      },
    ],
    tracks: [
      {
        elementId: 'tank',
        property: 'parameter',
        keyframes: [
          { at: { cueId: 'c1', progress: 0 }, value: 0.2 },
          { at: { cueId: 'c2', progress: 1 }, value: 0.8 },
        ],
      },
    ],
  };
  const original = { ...p, scenes: [{ ...scene, artwork: artwork as any }] };
  const generate = vi.fn(async (_system: string, _user: string) => ({
    value: { sceneId: 's1', artwork: v2 },
    usage: { input: 1, output: 1 },
  }));
  const next = await illustrateFilmScene(
    original,
    0,
    { generate },
    undefined,
    '液位必须持续上升',
  );
  expect(JSON.parse(generate.mock.calls[0][1])).toMatchObject({
    originalArtwork: artwork,
    feedback: '液位必须持续上升',
  });
  expect(next.scenes[0].artwork).toMatchObject(v2);
  expect(next.scenes[0].cues).toEqual(scene.cues);
  expect(next.artifacts).toEqual(p.artifacts);
  expect(generate.mock.calls[0][0]).toContain('"version":2');
});

it('reports the failing page and nested field without raw provider values', async () => {
  const generate = vi.fn(async () => ({
    value: {
      sceneId: 's1',
      artwork: {
        ...artwork,
        version: 2,
        elements: [
          { ...artwork.elements[0], layer: 0, width: 'provider-secret' },
        ],
      },
    },
    usage: { input: 1, output: 1 },
  }));
  const error = await illustrateFilmScene({ ...p, scenes: [scene, scene] }, 1, {
    generate,
  }).catch((e) => e as Error);
  if (!(error instanceof Error)) throw new Error('Expected validation failure');
  expect(error.message).toContain('第 2 页');
  expect(error.message).toContain('已尝试 2 次');
  expect(error.message).toContain('artwork.elements[0].width');
  expect(error.message).toContain('字段类型不正确');
  expect(error.message).not.toContain('provider-secret');
  expect(error.message).not.toContain('version');
  expect(generate).toHaveBeenCalledTimes(2);
});
it('reports missing required fields and unsupported values without echoing them', async () => {
  const generate = vi.fn(async () => ({
    value: {
      sceneId: 's1',
      artwork: {
        version: 2,
        elements: [
          { ...artwork.elements[0], layer: 0, fill: 'secret-key-value' },
        ],
      },
    },
    usage: { input: 1, output: 1 },
  }));
  const error = await illustrateFilmScene(p, 0, { generate }).catch(
    (e) => e as Error,
  );
  if (!(error instanceof Error)) throw new Error('Expected validation failure');
  expect(error.message).toContain('artwork.intent：缺少必填字段');
  expect(error.message).toContain('artwork.elements[0].fill：不是支持的选项');
  expect(error.message).not.toContain('secret-key-value');
});
