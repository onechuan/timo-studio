import { describe, it, expect } from 'vitest';
import {
  legacyArtworkSchema,
  validateArtworkCues,
} from '../packages/contracts/src/artwork.js';
import {
  evaluateScene,
  compileMotion,
} from '../packages/renderer/src/motion.js';
const element = {
  id: 'tank',
  type: 'component',
  name: 'liquid',
  state: 'active',
  parameter: 0.2,
  layer: 0,
  x: 100,
  y: 200,
  width: 200,
  height: 200,
  cueIndex: 0,
};
const cues = [
  { id: 'c1', startMs: 100, endMs: 1000 },
  { id: 'c2', startMs: 1200, endMs: 2200 },
];
const data = () => ({
  version: 2,
  intent: 'Fill the tank',
  elements: [element],
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
});
describe('artwork motion', () => {
  it('validates bounded tracks and cue references', () => {
    const artwork = legacyArtworkSchema.parse(data());
    expect(validateArtworkCues(artwork, cues)).toEqual([]);
    expect(validateArtworkCues(artwork, []).length).toBeGreaterThan(0);
    expect(
      legacyArtworkSchema.safeParse({
        ...data(),
        tracks: [{ ...data().tracks[0], elementId: 'missing' }],
      }).success,
    ).toBe(false);
  });
  it('evaluates exact time deterministically, holds ends and supports reverse seek', () => {
    const artwork = legacyArtworkSchema.parse(data());
    const scene = compileMotion(artwork, cues);
    const mid = evaluateScene(scene, 1150);
    expect(mid[0].parameter).toBeCloseTo(0.5);
    expect(evaluateScene(scene, 9999)[0].parameter).toBe(0.8);
    expect(evaluateScene(scene, 0)[0].parameter).toBe(0.2);
    expect(evaluateScene(scene, 1150)).toEqual(mid);
  });
  it('rejects parent cycles and incompatible path morphs', () => {
    expect(
      legacyArtworkSchema.safeParse({
        ...data(),
        elements: [
          { ...element, id: 'a', type: 'group', parentId: 'b' },
          { ...element, id: 'b', type: 'group', parentId: 'a' },
        ],
        tracks: [],
      }).success,
    ).toBe(false);
    expect(
      legacyArtworkSchema.safeParse({
        ...data(),
        elements: [{ ...element, type: 'path', d: 'M0 0 L10 10' }],
        tracks: [
          {
            elementId: 'tank',
            property: 'path',
            keyframes: [{ at: { cueId: 'c1' }, value: 'M0 0 C1 1 2 2 3 3' }],
          },
        ],
      }).success,
    ).toBe(false);
  });
  it('reads version 1 unchanged', () => {
    expect(
      legacyArtworkSchema.parse({
        version: 1,
        intent: 'legacy',
        elements: [{ ...element, type: 'ellipse' }],
      }).version,
    ).toBe(1);
  });
});

import {
  compileArtwork,
  renderArtworkFrame,
} from '../packages/renderer/src/artwork.js';
import { fitArtwork } from '../packages/agent/src/director/layout.js';

it('interpolates movement, rotation, scale, opacity, colors and compatible paths; steps states', () => {
  const at = (progress: number) => ({ cueId: 'c1', progress });
  const tracks = [
    ['move', { x: 100, y: 200 }, { x: 300, y: 400 }],
    ['scale', 1, 2],
    ['rotate', 0, 90],
    ['opacity', 1, 0.2],
    ['color', 'accent', 'secondary'],
    ['state', 'idle', 'complete'],
  ].map(([property, a, b]) => ({
    elementId: 'tank',
    property,
    keyframes: [
      { at: at(0), value: a },
      { at: at(1), value: b },
    ],
  }));
  const artwork = legacyArtworkSchema.parse({
    ...data(),
    elements: [
      element,
      { ...element, id: 'outline', type: 'path', d: 'M0 0 L10 10' },
    ],
    tracks: [
      ...tracks,
      {
        elementId: 'outline',
        property: 'path',
        keyframes: [
          { at: at(0), value: 'M0 0 L10 10' },
          { at: at(1), value: 'M10 10 L20 20' },
        ],
      },
    ],
  });
  const compiled = compileMotion(artwork, cues, {
    accent: '#000000',
    secondary: '#ffffff',
  });
  expect(evaluateScene(compiled, 550)[0]).toMatchObject({
    x: 200,
    y: 300,
    scale: 1.5,
    rotation: 45,
    color: '#808080',
    state: 'idle',
  });
  expect(evaluateScene(compiled, 550)[0].opacity).toBeCloseTo(0.6);
  expect(evaluateScene(compiled, 550)[1]).toMatchObject({ d: 'M5 5 L15 15' });
  expect(evaluateScene(compiled, 1000)[0].state).toBe('complete');
  expect(compiled.elements[0].x).toBe(100);
});

it.each(['16:9', '9:16'] as const)(
  'renders a stable first frame, parent-local groups and explicit layers in %s',
  (aspect) => {
    const artwork = legacyArtworkSchema.parse({
      ...data(),
      elements: [
        { ...element, id: 'group', type: 'group', x: 100, y: 300, layer: 2 },
        { ...element, parentId: 'group', x: 0, y: 0, layer: 3 },
        { ...element, id: 'node', name: 'node', x: 400, y: 300, layer: 1 },
      ],
      tracks: data().tracks,
    });
    const frame = compileArtwork(
      {
        id: 's',
        title: '变化',
        visual: '液位',
        beats: ['注入'],
        cues: cues.map((c) => ({ ...c, text: c.id })),
        artwork,
      },
      aspect,
      'warm',
    );
    const first = renderArtworkFrame(frame, 0),
      mid = renderArtworkFrame(frame, 1150);
    expect(first).toContain('data-artwork-id="tank"');
    expect(mid).not.toBe(first);
    expect(mid.indexOf('data-artwork-id="node"')).toBeLessThan(
      mid.indexOf('data-artwork-id="group"'),
    );
    expect(mid).toContain('translate(0 0)');
    expect(renderArtworkFrame(frame, 1150)).toBe(mid);
    expect(renderArtworkFrame(frame, 2200)).toBe(
      renderArtworkFrame(frame, 9999),
    );
    expect(fitArtwork(artwork, aspect)).toEqual(artwork);
  },
);

it('rejects malformed paths, unknown properties, duplicate tracks, out of range values and unordered anchors', () => {
  for (const d of [
    'M0 0 L1',
    'M1e999 0 L1 1',
    'M0 0 A1 1 0 9 0 1 1',
    'M0 0 LNaN 1',
  ])
    expect(
      legacyArtworkSchema.safeParse({
        ...data(),
        elements: [{ ...element, type: 'path', d }],
        tracks: [],
      }).success,
    ).toBe(false);
  for (const [property, value] of [
    ['scale', 0],
    ['opacity', 2],
    ['move', 9],
    ['parameter', -1],
    ['state', 'unknown'],
    ['script', 'alert(1)'],
  ])
    expect(
      legacyArtworkSchema.safeParse({
        ...data(),
        tracks: [
          {
            elementId: 'tank',
            property,
            keyframes: [{ at: { cueId: 'c1' }, value }],
          },
        ],
      }).success,
    ).toBe(false);
  expect(
    legacyArtworkSchema.safeParse({
      ...data(),
      tracks: [...data().tracks, ...data().tracks],
    }).success,
  ).toBe(false);
  const unordered = legacyArtworkSchema.parse({
    ...data(),
    tracks: [
      {
        ...data().tracks[0],
        keyframes: [...data().tracks[0].keyframes].reverse(),
      },
    ],
  });
  expect(validateArtworkCues(unordered, cues)).not.toEqual([]);
});

import { animationScene } from './fixtures/animation-v2.js';
it.each(['16:9', '9:16'] as const)(
  'keeps one semantic assembly across three cues in %s',
  (aspect) => {
    const scene = animationScene(aspect),
      frame = compileArtwork(scene, aspect, 'warm');
    const snapshots = [0, 1000, 3000, 5000, 6000].map((t) =>
      renderArtworkFrame(frame, t),
    );
    for (const svg of snapshots)
      for (const id of ['assembly', 'tank', 'node', 'flow', 'outline'])
        expect(
          svg.match(new RegExp(`data-artwork-id="${id}"`, 'g')),
        ).toHaveLength(1);
    expect(new Set(snapshots).size).toBe(5);
    expect(renderArtworkFrame(frame, 5800)).toBe(
      renderArtworkFrame(frame, 6000),
    );
  },
);

it('rejects a first-frame subject hidden by its parent or opacity track', () => {
  expect(
    legacyArtworkSchema.safeParse({
      ...data(),
      elements: [
        { ...element, id: 'g', type: 'group', cueIndex: 1 },
        { ...element, parentId: 'g' },
      ],
    }).success,
  ).toBe(false);
  expect(
    legacyArtworkSchema.safeParse({
      ...data(),
      tracks: [
        {
          elementId: 'tank',
          property: 'opacity',
          keyframes: [{ at: { cueId: 'c1' }, value: 0 }],
        },
      ],
    }).success,
  ).toBe(false);
});

it('keeps v1 layer optional while requiring an explicit v2 layer', () => {
  const { layer: _layer, ...withoutLayer } = element;
  expect(
    legacyArtworkSchema.safeParse({
      version: 1,
      intent: 'legacy',
      elements: [{ ...withoutLayer, type: 'ellipse' }],
    }).success,
  ).toBe(true);
  expect(
    legacyArtworkSchema.safeParse({ ...data(), elements: [withoutLayer] })
      .success,
  ).toBe(false);
});
