export interface FilmGateResult {
  file: string; duration: number; red: boolean;
  gates: { key: string; name: string; level: 'red' | 'green'; value: { at: number; seconds: number }[] }[];
  report: { key: string; name: string; value: number; unit?: string; note?: string; level?: string }[];
}
export declare function measure(file: string, opts?: { subBand?: number }): FilmGateResult;
