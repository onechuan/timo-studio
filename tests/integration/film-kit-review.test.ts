import { createHash } from 'node:crypto';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

import type { Production } from '../../packages/contracts/src/index.js';
import { captureFilmKitReview } from '../../packages/renderer/src/film-kit-review.js';

it('captures every Film Kit component in a real browser', async () => {
  const root = await mkdtemp(join(tmpdir(), 'timotv-film-kit-review-'));
  const source =
    '(function(){ const B = PV.Builder.prototype; B.coffeeCup = function(x,y,o={}) { return this.circle(x,y,80,o); }; })();';
  const production = {
    projectId: 'film-kit-browser',
    revision: 1,
    stage: 'illustrating',
    aspectRatio: '16:9',
    brief: {
      topic: '咖啡',
      materials: '',
      durationSec: 30,
      language: 'zh',
      style: 'chalk',
      voiceProvider: 'local',
      voice: '',
    },
    scenes: [],
    artifacts: {},
    events: [],
    visual: {
      upstreamRevision: '6145f7e3482628543bd6f2d68fe3b618d366213a',
      engineRevision: `sha256:${'a'.repeat(64)}`,
      style: 'chalkboard',
      filmKit: {
        status: 'checking',
        source,
        sourceHash: createHash('sha256').update(source).digest('hex'),
        components: [
          {
            name: 'coffeeCup',
            what: '同一只咖啡杯',
            pages: ['p01', 'p02'],
            status: 'checking',
            source,
            sourceHash: createHash('sha256').update(source).digest('hex'),
            checkSource:
              "P.coffeeCup(960, 500, { at: P.c(0), color: 'yellow' });",
          },
        ],
      },
    },
  } as Production;

  try {
    const evidence = await captureFilmKitReview(
      production,
      root,
      AbortSignal.timeout(30_000),
    );
    expect(evidence.frames).toHaveLength(1);
    expect(evidence.issues).toEqual([]);
    await access(join(root, evidence.frames[0]!.key));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 40_000);
