export interface MediaProbe {
  durationMs: number | null;
  width: number | null;
  height: number | null;
  mimeType: string;
}
export interface MediaProcessor {
  probe(storageKey: string): Promise<MediaProbe>;
}
