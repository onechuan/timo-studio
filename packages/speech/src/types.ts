export interface SpeechAudio {
  storageKey: string;
  durationMs: number;
  mimeType: string;
}
export interface TranscriptSegment {
  startMs: number;
  endMs: number;
  text: string;
}
