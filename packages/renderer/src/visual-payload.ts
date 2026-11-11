import type { Production } from '@timotv/contracts';

import { projectAudioKey } from './media.js';
import {
  hashProgramSource,
  validateFilmKitSource,
  validateProgramSource,
} from './program.js';

const payloadId = 'timo-visual-payload';
const safeJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c');

export function visualFilmPayload(production: Production) {
  const programs = production.scenes.flatMap((scene) =>
    scene.artwork?.version === 3 ? [scene.artwork] : [],
  );
  const style =
    programs[0]?.style ?? production.visual?.style ?? production.brief.style;
  if (programs.some((program) => program.style !== style))
    throw new Error('A film must use one drawing style');
  for (const scene of production.scenes) {
    if (scene.artwork?.version !== 3) continue;
    validateProgramSource(scene.id, scene.artwork.source);
    if (hashProgramSource(scene.artwork.source) !== scene.artwork.sourceHash)
      throw new Error(`Drawing program hash mismatch: ${scene.id}`);
  }
  const filmKit =
    production.visual?.filmKit?.source &&
    ['checking', 'passed', 'partial'].includes(production.visual.filmKit.status)
      ? {
          status: production.visual.filmKit.status,
          source: validateFilmKitSource(production.visual.filmKit),
          sourceHash: production.visual.filmKit.sourceHash,
        }
      : undefined;
  return {
    timeline: {
      durationMs: production.durationMs,
      pages: production.scenes.map((scene) => ({
        sceneId: scene.id,
        startMs: scene.cues[0]?.startMs,
        endMs: scene.cues.at(-1)?.endMs,
        cues: scene.cues.map(({ id, startMs, endMs }) => ({
          id,
          startMs,
          endMs,
        })),
      })),
    },
    style,
    filmKit,
    pages: production.scenes.map((scene) => ({
      sceneId: scene.id,
      artwork: scene.artwork,
    })),
    media: production.artifacts?.audio
      ? { audio: projectAudioKey(production) }
      : {},
    engineRevision: production.visual?.engineRevision,
  };
}

export function visualPayloadMarkup(production: Production): string {
  return `<script id="${payloadId}" type="application/json">${safeJson(
    visualFilmPayload(production),
  )}</script>`;
}

export function extractVisualPayload(html: string): unknown {
  const match = html.match(
    new RegExp(
      `<script id="${payloadId}" type="application/json">([\\s\\S]*?)<\\/script>`,
    ),
  );
  if (!match) throw new Error('Missing trusted visual payload');
  return JSON.parse(match[1]!);
}
