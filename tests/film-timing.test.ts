import { expect, it } from 'vitest';
import { filmHtml, validateFilmTiming } from '../packages/renderer/src/film.js';
import { extractVisualPayload } from '../packages/renderer/src/visual-payload.js';
import type { Production } from '../packages/contracts/src/production.js';
const film: Production = {
  projectId: 'test',
  aspectRatio: '16:9',
  revision: 0,
  stage: 'ready',
  brief: {
    topic: 'x',
    materials: '',
    language: 'zh',
    style: 'warm',
    durationSec: 15,
    voiceProvider: 'local',
    voice: '',
  },
  durationMs: 1000,
  scenes: [
    {
      id: 'p01',
      title: 'x',
      visual: 'x',
      beats: ['x'],
      cues: [{ id: 'c0', text: 'x', startMs: 0, endMs: 1000 }],
    },
  ],
  artifacts: {},
  events: [],
};
it('真实配音时间连续，且与总时长一致', () => {
  expect(() => validateFilmTiming(film)).not.toThrow();
  expect(() => validateFilmTiming({ ...film, durationMs: 999 })).toThrow();
  expect(() =>
    validateFilmTiming({
      ...film,
      scenes: [
        {
          ...film.scenes[0],
          cues: [{ ...film.scenes[0].cues[0], startMs: 1 }],
        },
      ],
    }),
  ).toThrow();
  expect(() => validateFilmTiming({ ...film, scenes: [] })).toThrow();
});

it('uses the same visual document for preview, review, and export', () => {
  const preview = filmHtml(film, { mode: 'preview' });
  const review = filmHtml(film, { mode: 'review' });
  const exported = filmHtml(film, { mode: 'export' });
  expect(extractVisualPayload(review)).toEqual(extractVisualPayload(preview));
  expect(extractVisualPayload(exported)).toEqual(extractVisualPayload(preview));
  expect(preview).toContain('player-controls');
  expect(review).not.toContain('player-controls');
  expect(exported).not.toContain('player-controls');
});
