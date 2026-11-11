import { afterEach, expect, it } from 'vitest';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Production } from '../../packages/contracts/src/index.js';
import { captureWholeFilmReview } from '../../packages/renderer/src/whole-film-review.js';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

it('captures one labelled representative frame per page plus transitions', async () => {
  const root = await mkdtemp(join(tmpdir(), 'timotv-whole-film-'));
  roots.push(root);
  const scenes = ['p01', 'p02', 'p03'].map((id, index) => ({
    id,
    title: `Page ${index + 1}`,
    visual: `Subject state ${index + 1}`,
    beats: [`beat ${index + 1}`],
    cues: [
      {
        id: `c0${index + 1}`,
        text: `Page ${index + 1}`,
        startMs: index * 1000,
        endMs: (index + 1) * 1000,
      },
    ],
    artwork: {
      version: 1 as const,
      intent: `State ${index + 1}`,
      elements: [
        {
          id: `box${index + 1}`,
          type: 'rect' as const,
          x: 300 + index * 80,
          y: 260,
          width: 600,
          height: 300,
          cueIndex: 0,
        },
      ],
    },
  }));
  const film = {
    projectId: 'whole-film-capture',
    revision: 0,
    aspectRatio: '16:9',
    brief: { topic: 'Contact sheet', style: 'warm', language: 'en' },
    scenes,
    durationMs: 3000,
    artifacts: {},
    events: [],
  } as unknown as Production;

  const evidence = await captureWholeFilmReview(
    film,
    root,
    AbortSignal.timeout(30_000),
  );
  expect(evidence.pages.map((page) => page.sceneId)).toEqual([
    'p01',
    'p02',
    'p03',
  ]);
  expect(evidence.transitions).toHaveLength(2);
  expect(evidence.sheetKey).toMatch(/whole-film-r0\.jpg$/);
  expect((await stat(join(root, evidence.sheetKey))).size).toBeGreaterThan(
    1000,
  );
  expect(evidence.sheet?.mimeType).toBe('image/jpeg');
}, 60_000);
