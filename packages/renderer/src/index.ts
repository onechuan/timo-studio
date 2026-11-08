import type { Timeline } from '@timotv/contracts';
export interface Renderer {
  render(
    timeline: Timeline,
    signal: AbortSignal,
  ): Promise<{ storageKey: string; mimeType: 'video/mp4' }>;
}
