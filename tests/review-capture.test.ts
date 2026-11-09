import { expect, it } from 'vitest';
import type { FilmScene, Production } from '../packages/contracts/src/index.js';
import {
  planReviewSamples,
  reviewFingerprint,
  captureSceneReview,
} from '../packages/renderer/src/review.js';
import { hashProgramSource } from '../packages/renderer/src/program.js';
export const reviewFixture = (): Production => ({
  projectId: 'capture-test',
  revision: 1,
  stage: 'illustrating',
  aspectRatio: '16:9',
  brief: {
    topic: 'test',
    style: 'warm',
    language: 'en',
  } as Production['brief'],
  durationMs: 2000,
  artifacts: {},
  events: [],
  scenes: [
    {
      id: 'scene',
      title: 'Visible title',
      visual: 'a tree',
      beats: ['Grow'],
      cues: [{ id: 'cue', text: 'A growing tree', startMs: 0, endMs: 2000 }],
    },
  ],
});
it('samples global boundaries and uniformly limits cues with omissions', () => {
  const scene = {
    ...reviewFixture().scenes[0],
    cues: Array.from({ length: 40 }, (_, i) => ({
      id: `q${i}`,
      text: 't',
      startMs: 5000 + i * 100,
      endMs: 5100 + i * 100,
    })),
  } as FilmScene;
  const result = planReviewSamples(scene);
  expect(result.times).toHaveLength(24);
  expect(result.times[0]).toBe(5000);
  expect(result.times.at(-1)).toBe(8999);
  expect(result.omittedCueIds).toHaveLength(18);
  expect(result.omittedCueIds).not.toContain('q0');
  expect(result.omittedCueIds).not.toContain('q39');
});
it('fingerprints content/config but not revision, job, or prior reports', () => {
  const p = reviewFixture();
  const hash = reviewFingerprint(p, 0);
  expect(reviewFingerprint({ ...p, revision: 99, jobId: 'new' }, 0)).toBe(hash);
  expect(reviewFingerprint(p, 0, 'new-config')).not.toBe(hash);
  expect(reviewFingerprint({ ...p, aspectRatio: '9:16' }, 0)).not.toBe(hash);
  const changed = structuredClone(p);
  changed.scenes[0]!.cues[0]!.text = 'changed';
  expect(reviewFingerprint(changed, 0)).not.toBe(hash);
});
it('fingerprints V3 source, source hash, style and component extras', () => {
  const p = reviewFixture();
  const source = "TIMO.visual('scene', P => P.title('Facts'));";
  p.scenes[0]!.artwork = {
    version: 3,
    runtime: 'timotv-dsl-1',
    intent: 'Show the facts',
    source,
    sourceHash: hashProgramSource(source),
    style: 'chalkboard',
    extras: [],
  };
  const original = reviewFingerprint(p, 0);
  const variants = [
    { source: source.replace('Facts', 'Evidence') },
    { sourceHash: '0'.repeat(64) },
    { style: 'warm-story' as const },
    { extras: ['timeline'] },
  ];
  for (const patch of variants) {
    const changed = structuredClone(p);
    changed.scenes[0]!.artwork = {
      ...(changed.scenes[0]!.artwork as Extract<
        NonNullable<FilmScene['artwork']>,
        { version: 3 }
      >),
      ...patch,
    };
    expect(reviewFingerprint(changed, 0)).not.toBe(original);
  }
  expect(planReviewSamples(p.scenes[0]!).times).toEqual([0, 1000, 1999]);
});
it('rejects unsafe identity and aborted requests before capture', async () => {
  const p = reviewFixture();
  p.projectId = '../escape';
  await expect(captureSceneReview(p, 0, '/tmp')).rejects.toThrow();
  const c = new AbortController();
  c.abort();
  await expect(
    captureSceneReview(reviewFixture(), 0, '/tmp', c.signal),
  ).rejects.toThrow();
});
