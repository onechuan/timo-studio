import { describe, expect, it } from 'vitest';
import {
  isLegacyArtwork,
  legacyArtworkSchema,
  type FilmScene,
} from '../packages/contracts/src/index.js';
import {
  compileArtwork,
  renderArtworkFrame,
} from '../packages/renderer/src/artwork.js';
import { filmHtml } from '../packages/renderer/src/preview.js';
import { productionBriefSchema } from '../packages/contracts/src/index.js';
const scene: FilmScene = {
  id: 's',
  title: '一碗热面',
  visual: '牛肉面',
  beats: ['长长的面条与新鲜香草'],
  cues: [
    { id: 'a', text: '面条', startMs: 0, endMs: 8000 },
    { id: 'b', text: '香草', startMs: 8000, endMs: 10000 },
  ],
  artwork: legacyArtworkSchema.parse({
    version: 1,
    intent: '食材分解',
    elements: [
      {
        id: 'bowl',
        type: 'illustration',
        name: 'bowl',
        x: 80,
        y: 190,
        width: 700,
        height: 490,
        cueIndex: 0,
      },
      {
        id: 'label',
        type: 'text',
        text: '新鲜香草让这一碗热腾腾的牛肉面香气更丰富',
        x: 850,
        y: 250,
        width: 500,
        height: 300,
        cueIndex: 1,
        fontSize: 40,
      },
    ],
  }),
};
const legacy = (value: FilmScene) => {
  if (!isLegacyArtwork(value.artwork)) throw new Error('Expected legacy artwork');
  return value.artwork;
};
describe('cue-driven artwork', () => {
  it('keeps labels above panels even when a later panel is submitted last', () => {
    const s = structuredClone(scene);
    s.artwork = legacyArtworkSchema.parse({
      ...s.artwork,
      elements: [
        ...legacy(s).elements,
        {
          id: 'panel',
          type: 'rect',
          x: 850,
          y: 250,
          width: 500,
          height: 300,
          cueIndex: 1,
          fill: 'panel',
        },
      ],
    });
    const frame = compileArtwork(s, '16:9', 'warm');
    expect(frame.layers.at(-1)?.id).toBe('label');
    expect(frame.layers[0]?.id).toBe('panel');
  });
  it('opens with the lead object and reveals later objects on measured cue starts', () => {
    const frame = compileArtwork(scene, '16:9', 'warm');
    expect(renderArtworkFrame(frame, 0)).toContain('data-artwork-id="bowl"');
    expect(renderArtworkFrame(frame, 7999)).not.toContain(
      'data-artwork-id="label"',
    );
    expect(renderArtworkFrame(frame, 8250)).toContain(
      'data-artwork-id="label"',
    );
    expect(renderArtworkFrame(frame, 8800)).toBe(
      renderArtworkFrame(frame, 9999),
    );
  });
  it('wraps full text without truncation and escapes markup', () => {
    const s = structuredClone(scene);
    s.title = '<script>alert(1)</script>';
    legacy(s).elements[1] = {
      ...legacy(s).elements[1],
      type: 'text',
      text: '<img src=x onerror=alert(1)> & words',
      fontSize: 40,
      align: 'left',
    };
    const svg = renderArtworkFrame(compileArtwork(s, '16:9', 'warm'), 9000);
    expect(svg).not.toContain('<script>');
    expect(svg).not.toContain('<img');
    expect(svg).toContain('&lt;');
    expect(svg).not.toContain('…');
  });
  it('keeps portrait content inside reserved bands', () => {
    const s = structuredClone(scene);
    s.artwork = undefined;
    const frame = compileArtwork(s, '9:16', 'chalk');
    const svg = renderArtworkFrame(frame, 0);
    expect(svg).toContain('viewBox="0 0 900 1600"');
    expect(
      frame.layers.every(
        (l) => l.x >= 48 && l.y >= 250 && l.y + l.height <= 1280,
      ),
    ).toBe(true);
  });
  it('provides clean export and retains player hooks', () => {
    const p: any = {
      aspectRatio: '16:9',
      brief: { style: 'warm', language: 'zh' },
      scenes: [scene],
      durationMs: 10000,
    };
    const clean = filmHtml(p, { controls: false });
    expect(clean).toContain('window.renderAt');
    expect(clean).not.toContain('id="player-controls"');
    expect(clean).not.toContain('requestAnimationFrame');
    expect(filmHtml(p)).toContain('id="audio"');
  });
});

import { composeFilm } from '../packages/renderer/src/film.js';
import { projectAudioKey } from '../packages/renderer/src/media.js';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
it('composes an artwork revision using the existing measured audio', async () => {
  const root = await mkdtemp(join(tmpdir(), 'artwork-audio-'));
  const p: any = {
    projectId: 'demo',
    revision: 5,
    aspectRatio: '16:9',
    brief: { style: 'warm', language: 'zh' },
    scenes: [scene],
    durationMs: 10000,
    artifacts: {
      audio: 'production/demo/r2/audio.wav',
      subtitles: 'production/demo/r2/subtitles.srt',
    },
  };
  try {
    const result = await composeFilm({ root, production: p });
    expect(result.artifacts.audio).toBe(p.artifacts.audio);
    expect(
      await readFile(join(root, result.artifacts.preview!), 'utf8'),
    ).toContain('src="../r2/audio.wav"');
    for (const key of [
      'production/other/r2/audio.wav',
      'production/demo/r6/audio.wav',
      'production/demo/r2/../audio.wav',
    ])
      expect(() =>
        projectAudioKey({ ...p, artifacts: { audio: key } }),
      ).toThrow();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it('keeps text readable on the page without recoloring illustrations', () => {
  const s = structuredClone(scene);
  for (const role of ['warning', 'paper'] as const) {
    legacy(s).elements[1]!.fill = role;
    const frame = compileArtwork(s, '16:9', 'warm');
    expect(frame.layers[1]!.svg).toContain('<text fill="#352e29"');
    expect(frame.layers[0]!.svg).toContain('fill="#d9ad51"');
  }
  legacy(s).elements[1]!.fill = 'accent';
  for (const [style, color] of [
    ['chalk', '#ecc36d'],
    ['tech', '#6cc7c6'],
  ] as const) {
    expect(compileArtwork(s, '16:9', style).layers[1]!.svg).toContain(
      `<text fill="${color}"`,
    );
  }
});

it('supports a distinct charcoal brand palette and renderer-owned wordmark', () => {
  const brief = productionBriefSchema.parse({ topic: '测试', style: 'brand' });
  const frame = compileArtwork(scene, '16:9', brief.style);
  expect(frame.paper).toBe('#111514');
  expect(frame.heading).toContain('TimoTV');
  expect(frame.heading).toContain('#c8ee8a');
  expect(renderArtworkFrame(frame, 100)).not.toContain('undefined');
});

import {
  illustration,
  palettes,
} from '../packages/renderer/src/illustrations.js';
it('renders each historical-food subject as a distinct detailed illustration in all palettes', () => {
  const names = ['cow', 'cook', 'worker', 'cauldron', 'tofu', 'factory'];
  for (const palette of Object.values(palettes)) {
    const drawings = names.map((name) => illustration(name, palette));
    expect(new Set(drawings).size).toBe(names.length);
    for (const drawing of drawings) {
      expect(drawing).toContain('viewBox="0 0 400 300"');
      expect(drawing.match(/<path /g)!.length).toBeGreaterThanOrEqual(8);
      expect(drawing).not.toMatch(/undefined|NaN|<script|href=/);
    }
  }
});
