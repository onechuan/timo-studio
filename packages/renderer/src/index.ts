import type { Timeline } from '@timotv/contracts';
export interface Renderer {
  render(
    timeline: Timeline,
    signal: AbortSignal,
  ): Promise<{ storageKey: string; mimeType: 'video/mp4' }>;
}

export * from './film.js';
export * from './artwork.js';
export * from './motion.js';
export * from './review.js';
export * from './program.js';
export * from './program-preview.js';
export * from './film-kit-review.js';
export * from './whole-film-review.js';
export * from './visual-payload.js';
