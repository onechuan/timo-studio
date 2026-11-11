import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';

import type { Production } from '../packages/contracts/src/index.js';
import {
  filmKitFingerprint,
  filmKitReviewProduction,
} from '../packages/renderer/src/film-kit-review.js';
import { programFilmHtml } from '../packages/renderer/src/program-preview.js';
import { filmKitReviewer } from '../apps/worker/src/handlers/film-kit.js';

const part = (name: string) => {
  const source = `(function(){ const B = PV.Builder.prototype; B.${name} = function(x,y,o={}) { return this.circle(x,y,80,o); }; })();`;
  return {
    name,
    what: `同一个 ${name}`,
    pages: ['p01', 'p02'],
    status: 'checking' as const,
    source,
    sourceHash: createHash('sha256').update(source).digest('hex'),
    checkSource: `P.${name}(960, 500, { at: P.c(0), color: 'yellow' });`,
  };
};

const fixture = (): Production => {
  const components = [part('coffeeCup'), part('coffeeMachine')];
  const source = components.map((component) => component.source).join('\n');
  return {
    projectId: 'film-kit-review',
    revision: 2,
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
        components,
      },
    },
  };
};

it('builds an isolated check film with the Film Kit loaded before init', () => {
  const production = fixture();
  const review = filmKitReviewProduction(production);
  const html = programFilmHtml(review, { controls: false });
  expect(review.scenes[0]?.cues).toHaveLength(2);
  expect(html.indexOf('B.coffeeCup')).toBeLessThan(html.indexOf('ENGINE.init'));
  expect(filmKitFingerprint(production)).toMatch(/^[a-f0-9]{64}$/);
});

it('drops only a broken component and preserves passed component source', async () => {
  const production = fixture();
  const reviewer = filmKitReviewer('/tmp', {}, undefined, async () => ({
    fingerprint: filmKitFingerprint(production),
    frames: [
      { key: 'one.png', timeMs: 2300, cueId: 'coffeeCup' },
      { key: 'two.png', timeMs: 4900, cueId: 'coffeeMachine' },
    ],
    issues: [
      {
        kind: 'runtime',
        severity: 'error',
        atMs: 4900,
        elementIds: [],
        what: 'coffeeMachine crashed',
        fix: '修复组件',
      },
    ],
  }));
  const checkpoints: Production[] = [];
  const reviewed = await reviewer(
    production,
    AbortSignal.timeout(5000),
    async (next) => void checkpoints.push(structuredClone(next)),
  );

  expect(checkpoints).toHaveLength(1);
  expect(reviewed.visual?.filmKit?.status).toBe('partial');
  expect(
    reviewed.visual?.filmKit?.components.map((component) => component.status),
  ).toEqual(['passed', 'failed']);
  expect(reviewed.visual?.filmKit?.source).toContain('B.coffeeCup');
  expect(reviewed.visual?.filmKit?.source).not.toContain('B.coffeeMachine');
});
