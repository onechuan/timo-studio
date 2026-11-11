import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

type TimingRuntime = {
  layout: (
    pages: unknown[],
    options?: Record<string, unknown>,
  ) => {
    duration: number;
    pages: {
      start: number;
      end: number;
      speechEnd: number;
      cues: { start: number; end: number; text: string }[];
    }[];
  };
};

async function runtime(): Promise<TimingRuntime> {
  const url = pathToFileURL(
    resolve('packages/drawing-engine/runtime/timing.js'),
  );
  await import(`${url.href}?test=${Math.random()}`);
  return (globalThis as typeof globalThis & { TIMING: TimingRuntime }).TIMING;
}

afterEach(() => {
  delete (globalThis as typeof globalThis & { TIMING?: TimingRuntime }).TIMING;
});

describe('drawing engine measured timeline', () => {
  it('uses exact page and cue seconds supplied by TimoTV', async () => {
    const timing = await runtime();
    const result = timing.layout(
      [
        { id: 's1', cues: ['第一句', '第二句'] },
        { id: 's2', cues: ['第三句'] },
      ],
      {
        timeline: {
          duration: 7.5,
          pages: [
            {
              start: 0,
              end: 4.2,
              cues: [
                { start: 0, end: 1.7 },
                { start: 1.7, end: 4.2 },
              ],
            },
            {
              start: 4.2,
              end: 7.5,
              cues: [{ start: 4.2, end: 7.5 }],
            },
          ],
        },
      },
    );
    expect(result.duration).toBe(7.5);
    expect(result.pages[0]).toMatchObject({
      start: 0,
      speechEnd: 4.2,
      end: 4.2,
    });
    expect(
      result.pages.flatMap((page) =>
        page.cues.map(({ start, end }) => [start, end]),
      ),
    ).toEqual([
      [0, 1.7],
      [1.7, 4.2],
      [4.2, 7.5],
    ]);
  });

  it('rejects mismatched or discontinuous measured timelines', async () => {
    const timing = await runtime();
    expect(() =>
      timing.layout([{ id: 's1', cues: ['第一句'] }], {
        timeline: {
          duration: 2,
          pages: [
            { start: 0, end: 2, cues: [{ start: 0.2, end: 2 }] },
          ],
        },
      }),
    ).toThrow('invalid measured timeline');
  });

  it('keeps the original estimated timing path when no timeline is supplied', async () => {
    const timing = await runtime();
    const result = timing.layout([{ id: 's1', cues: ['第一句'] }], { gap: 0.7 });
    expect(result.duration).toBeGreaterThan(2);
    expect(result.pages[0].cues[0].start).toBe(0.5);
  });
});
