import { expect, it } from 'vitest';
import { sceneSchema } from '../packages/contracts/src/production.js';
import {
  drawingStyleIds,
  filmKitItemSchema,
  filmKitStateSchema,
  isLegacyArtwork,
  sceneArtworkSchema,
} from '../packages/contracts/src/artwork.js';

const scene = {
  id: 's1',
  title: '汤的做法',
  visual: '汤碗与食材',
  beats: ['熬汤'],
  cues: [{ id: 'c1', text: '先熬汤。' }],
};
const artwork = {
  version: 1,
  intent: '大汤碗作为视觉主体',
  elements: [
    {
      id: 'bowl',
      type: 'illustration',
      name: 'bowl',
      x: 300,
      y: 220,
      width: 700,
      height: 420,
      cueIndex: 0,
    },
  ],
};
it.each([1, 2])(
  'supports opacity 0..1 while rejecting invisible first frames in v%s',
  (version) => {
    const candidate = (opacity: number) => ({
      ...artwork,
      version,
      elements: [
        { ...artwork.elements[0], layer: 0 },
        { ...artwork.elements[0], id: 'faint', cueIndex: 1, layer: 1, opacity },
      ],
    });
    for (const opacity of [0, 0.05, 0.1, 1])
      expect(sceneArtworkSchema.safeParse(candidate(opacity)).success).toBe(
        true,
      );
    for (const opacity of [-0.01, 1.01])
      expect(sceneArtworkSchema.safeParse(candidate(opacity)).success).toBe(
        false,
      );
    const hidden = candidate(0);
    hidden.elements = hidden.elements.map((e) => ({ ...e, opacity: 0 }));
    expect(sceneArtworkSchema.safeParse(hidden).success).toBe(false);
  },
);
it('keeps the v2 hard limit at 48 objects including groups', () => {
  const candidate = (count: number) => ({
    ...artwork,
    version: 2,
    elements: Array.from({ length: count }, (_, i) => ({
      ...artwork.elements[0],
      id: `object${i}`,
      layer: 0,
    })),
  });
  expect(sceneArtworkSchema.safeParse(candidate(48)).success).toBe(true);
  expect(sceneArtworkSchema.safeParse(candidate(49)).success).toBe(false);
});
it('保留逐页画面及构图，兼容没有画面的旧场景', () => {
  expect(
    sceneSchema.parse({ ...scene, layout: 'hero', artwork }),
  ).toMatchObject({ layout: 'hero', artwork });
  expect(sceneSchema.parse(scene).artwork).toBeUndefined();
});
it('拒绝不存在的口播锚点和重复的绘图对象 ID', () => {
  expect(
    sceneSchema.safeParse({
      ...scene,
      artwork: {
        ...artwork,
        elements: [{ ...artwork.elements[0], cueIndex: 9 }],
      },
    }).success,
  ).toBe(false);
  expect(
    sceneSchema.safeParse({
      ...scene,
      artwork: {
        ...artwork,
        elements: [artwork.elements[0], artwork.elements[0]],
      },
    }).success,
  ).toBe(false);
});
it('拒绝脚本注入和无边界路径', () => {
  const element = {
    id: 'path',
    type: 'path',
    x: 0,
    y: 160,
    width: 400,
    height: 300,
    cueIndex: 0,
    d: '<script>alert(1)</script>',
  };
  expect(
    sceneSchema.safeParse({
      ...scene,
      artwork: { ...artwork, elements: [element] },
    }).success,
  ).toBe(false);
});

it('accepts bounded V3 programs while preserving V1 and V2 guards', () => {
  const v3 = sceneArtworkSchema.parse({
    version: 3,
    runtime: 'timotv-dsl-1',
    intent: '画出一颗火箭逐级拆解',
    source: "TIMO.visual('s1', P => P.title('第一性原理'));",
    sourceHash: 'a'.repeat(64),
    style: 'chalkboard',
    extras: ['timeline'],
  });
  expect(v3.version).toBe(3);
  expect(isLegacyArtwork(v3)).toBe(false);
  expect(isLegacyArtwork(sceneArtworkSchema.parse(artwork))).toBe(true);
  expect(
    isLegacyArtwork(
      sceneArtworkSchema.parse({
        ...artwork,
        version: 2,
        elements: artwork.elements.map((element) => ({ ...element, layer: 0 })),
      }),
    ),
  ).toBe(true);
  expect(drawingStyleIds).toContain('warm-story');
  expect(drawingStyleIds).toHaveLength(42);
});

it.each([
  { sourceHash: 'A'.repeat(64) },
  { sourceHash: 'a'.repeat(63) },
  { style: 'not-a-style' },
  { extras: ['../timeline'] },
  { extras: ['timeline.js'] },
  { source: '界'.repeat(34_000) },
])('rejects invalid V3 program boundary %#', (patch) => {
  expect(
    sceneArtworkSchema.safeParse({
      version: 3,
      runtime: 'timotv-dsl-1',
      intent: '第一性原理',
      source: "TIMO.visual('s1', P => P.title('第一性原理'));",
      sourceHash: 'a'.repeat(64),
      style: 'chalkboard',
      extras: [],
      ...patch,
    }).success,
  ).toBe(false);
});

it('does not apply legacy element cue validation to V3 programs', () => {
  expect(
    sceneSchema.safeParse({
      ...scene,
      artwork: {
        version: 3,
        runtime: 'timotv-dsl-1',
        intent: '第一性原理',
        source: "TIMO.visual('s1', P => P.title('第一性原理'));",
        sourceHash: 'a'.repeat(64),
        style: 'chalkboard',
        extras: [],
      },
    }).success,
  ).toBe(true);
});

it('accepts a bounded reusable Film Kit and rejects one-page components', () => {
  expect(
    filmKitStateSchema.parse({
      status: 'partial',
      source:
        '(function(B){ B.coffeeCup = function(){}; })(PV.Builder.prototype);',
      sourceHash: 'b'.repeat(64),
      components: [
        {
          name: 'coffeeCup',
          what: '同一只白色陶瓷咖啡杯',
          pages: ['p01', 'p03'],
          status: 'passed',
        },
      ],
    }).components[0],
  ).toMatchObject({ name: 'coffeeCup', status: 'passed' });

  expect(
    filmKitItemSchema.safeParse({
      name: 'coffeeCup',
      what: '同一只白色陶瓷咖啡杯',
      pages: ['p01'],
    }).success,
  ).toBe(false);
});
