import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import { createProductionRunner } from '../../packages/core/src/production/runner.js';
import type { Job, Production } from '../../packages/contracts/src/index.js';

const test = it.skipIf(process.env.RUN_INTEGRATION !== '1');

test('measured correction re-synthesizes only changed cue fingerprints', async () => {
  let saved = {
    projectId: 'duration-cache',
    revision: 1,
    jobId: 'job',
    stage: 'narrating',
    brief: { durationSec: 300, narrationMode: 'ai' },
    scenes: [
      {
        id: 'p01',
        cues: Array.from({ length: 6 }, (_, index) => ({
          id: `c${index}`,
          text: `原句${index}`,
        })),
        artwork: { version: 1, intent: 'test', elements: [] },
      },
    ],
    artifacts: {},
    events: [],
  } as unknown as Production;
  const cache = new Set<string>();
  let synthesized = 0;
  let narrationRound = 0;
  const unchanged = async (production: Production) => production;

  await createProductionRunner(
    {
      load: async () => ({
        job: { type: 'produce', status: 'queued' } as Job,
        production: saved,
      }),
      start: async () => {},
      checkpoint: async (production) => {
        saved = production;
      },
      complete: async (production) => {
        saved = production;
      },
      fail: async () => {},
    },
    () => ({
      plan: unchanged,
      script: unchanged,
      illustrateScene: unchanged,
      compose: unchanged,
      render: unchanged,
      narrate: async (production) => {
        for (const cue of production.scenes.flatMap((scene) => scene.cues)) {
          const fingerprint = createHash('sha256').update(cue.text).digest('hex');
          if (!cache.has(fingerprint)) {
            cache.add(fingerprint);
            synthesized++;
          }
        }
        return {
          ...production,
          durationMs: ++narrationRound === 1 ? 95_000 : 285_000,
          artifacts: { ...production.artifacts, audio: 'audio.wav' },
        };
      },
      reviseDuration: async (production) => ({
        ...production,
        artifacts: {},
        scenes: production.scenes.map((scene) => ({
          ...scene,
          cues: scene.cues.map((cue, index) =>
            index < 2 ? { ...cue, text: `${cue.text}补充` } : cue,
          ),
        })),
      }),
    }),
    () => 'safe',
  )('job');

  expect(synthesized).toBe(8);
  expect(narrationRound).toBe(2);
  expect(saved.durationState).toMatchObject({
    status: 'accepted',
    measuredMs: 285_000,
    correctionRound: 1,
  });
});
