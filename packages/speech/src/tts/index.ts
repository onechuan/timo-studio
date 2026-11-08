import type { SpeechAudio } from '../types.js';
export interface TTSProvider {
  synthesize(input: {
    text: string;
    voice: string;
    signal: AbortSignal;
  }): Promise<SpeechAudio>;
}
