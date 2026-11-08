import { randomUUID } from 'node:crypto';
import { emptyTimeline } from '../../packages/contracts/src/index.js';
export const fixture = () => emptyTimeline(randomUUID(), '16:9');
export const video = () => ({
  id: randomUUID(),
  assetId: randomUUID(),
  kind: 'video' as const,
  sourceInMs: 0,
  sourceOutMs: 1000,
  timelineStartMs: 0,
  volume: 1,
});
