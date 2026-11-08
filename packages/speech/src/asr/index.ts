import type { TranscriptSegment } from '../types.js';
export interface ASRProvider {
  transcribe(input: {
    storageKey: string;
    signal: AbortSignal;
  }): Promise<TranscriptSegment[]>;
}
