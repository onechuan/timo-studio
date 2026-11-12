import { describe, expect, it } from 'vitest';
import {
  buildEditSource,
  defaultEditClips,
  deriveEditTimeline,
  isEditCurrent,
  productionEditInputSchema,
  productionUpdateSchema,
  type EditClip,
  type EditSource,
  type Production,
} from '../packages/contracts/src/index.js';

const source: EditSource = {
  videoKey: 'production/p/r0/video.mp4',
  durationMs: 4000,
  fps: 12,
  cues: [
    { id: 'c1', text: '第一句', startMs: 0, endMs: 1500 },
    { id: 'c2', text: '第二句', startMs: 1500, endMs: 3000 },
    { id: 'c3', text: '第三句', startMs: 3000, endMs: 4000 },
  ],
};
const clip = (
  id: string,
  sourceInMs: number,
  sourceOutMs: number,
  extra: Partial<EditClip> = {},
): EditClip => ({
  id,
  sourceInMs,
  sourceOutMs,
  volume: 1,
  muted: false,
  ...extra,
});

describe('edit contracts', () => {
  it('rejects invalid clip input', () => {
    expect(() => productionEditInputSchema.parse({ clips: [] })).toThrow();
    expect(() =>
      productionEditInputSchema.parse({
        clips: [{ id: 'a', sourceInMs: 1000, sourceOutMs: 1000 }],
      }),
    ).toThrow();
    expect(() =>
      productionEditInputSchema.parse({
        clips: [
          {
            id: 'a',
            sourceInMs: 0,
            sourceOutMs: 1000,
            volume: 2.5,
          },
        ],
      }),
    ).toThrow();
    expect(() =>
      productionEditInputSchema.parse({
        clips: [
          { id: 'a', sourceInMs: 0, sourceOutMs: 1000, timelineStartMs: 0 },
        ],
      }),
    ).toThrow();
  });

  it('accepts edit: null as a production update and rejects an empty update', () => {
    expect(
      productionUpdateSchema.parse({ revision: 0, edit: null }).edit,
    ).toBeNull();
    expect(() => productionUpdateSchema.parse({ revision: 0 })).toThrow();
  });

  it('derives trimmed subtitles and output duration', () => {
    const timeline = deriveEditTimeline(source, [clip('a', 1000, 3000)]);
    expect(timeline.durationMs).toBe(2000);
    expect(timeline.clips[0]).toMatchObject({
      id: 'a',
      timelineStartMs: 0,
      durationMs: 2000,
    });
    expect(timeline.subtitles).toEqual([
      { cueId: 'c1', text: '第一句', startMs: 0, endMs: 500 },
      { cueId: 'c2', text: '第二句', startMs: 500, endMs: 2000 },
    ]);
  });

  it('reorders clips and remaps each subtitle piece', () => {
    const timeline = deriveEditTimeline(source, [
      clip('late', 2000, 4000),
      clip('early', 0, 2000),
    ]);
    expect(timeline.clips.map((c) => c.timelineStartMs)).toEqual([0, 2000]);
    expect(timeline.subtitles).toEqual([
      { cueId: 'c2', text: '第二句', startMs: 0, endMs: 1000 },
      { cueId: 'c3', text: '第三句', startMs: 1000, endMs: 2000 },
      { cueId: 'c1', text: '第一句', startMs: 2000, endMs: 3500 },
      { cueId: 'c2', text: '第二句', startMs: 3500, endMs: 4000 },
    ]);
  });

  it('merges a cue cut across a contiguous join', () => {
    const timeline = deriveEditTimeline(source, [
      clip('one', 0, 2000),
      clip('two', 2000, 4000),
    ]);
    expect(timeline.subtitles).toEqual([
      { cueId: 'c1', text: '第一句', startMs: 0, endMs: 1500 },
      { cueId: 'c2', text: '第二句', startMs: 1500, endMs: 3000 },
      { cueId: 'c3', text: '第三句', startMs: 3000, endMs: 4000 },
    ]);
  });

  it('snaps boundaries to frames and rejects duplicate or out-of-range clips', () => {
    const timeline = deriveEditTimeline(source, [clip('a', 41, 2042)]);
    expect(timeline.durationMs).toBe(2083);
    expect(timeline.clips[0]).toMatchObject({
      sourceInMs: 0,
      sourceOutMs: 2083,
    });
    expect(() =>
      deriveEditTimeline(source, [clip('a', 0, 1000), clip('a', 1000, 2000)]),
    ).toThrow(/ID 重复/);
    expect(() => deriveEditTimeline(source, [clip('a', 0, 5000)])).toThrow(
      /超出原片范围/,
    );
    expect(() => deriveEditTimeline(source, [clip('a', 1000, 1000)])).toThrow(
      /入点必须早于出点/,
    );
  });

  it('keeps volume and mute decisions on derived clips', () => {
    const timeline = deriveEditTimeline(source, [
      clip('quiet', 0, 2000, { volume: 0.4 }),
      clip('muted', 2000, 4000, { muted: true }),
    ]);
    expect(timeline.clips.map((c) => [c.volume, c.muted])).toEqual([
      [0.4, false],
      [1, true],
    ]);
  });

  it('builds contiguous default clips from scene starts', () => {
    const production = {
      durationMs: 4000,
      scenes: [
        { cues: [{ startMs: 0, endMs: 900 }] },
        { cues: [{ startMs: 1000, endMs: 2400 }] },
        { cues: [{ startMs: 2500, endMs: 4000 }] },
      ],
    } as unknown as Production;
    expect(defaultEditClips(production)).toEqual([
      {
        id: 'clip-1',
        sourceInMs: 0,
        sourceOutMs: 1000,
        volume: 1,
        muted: false,
      },
      {
        id: 'clip-2',
        sourceInMs: 1000,
        sourceOutMs: 2500,
        volume: 1,
        muted: false,
      },
      {
        id: 'clip-3',
        sourceInMs: 2500,
        sourceOutMs: 4000,
        volume: 1,
        muted: false,
      },
    ]);
  });

  it('treats an edit as current only while the exported source matches', () => {
    const production = {
      projectId: 'p',
      revision: 3,
      stage: 'ready',
      durationMs: 4000,
      artifacts: { video: source.videoKey },
      scenes: [
        {
          id: 's',
          cues: [
            { id: 'c1', text: '第一句', startMs: 0, endMs: 1500 },
            { id: 'c2', text: '第二句', startMs: 1500, endMs: 3000 },
            { id: 'c3', text: '第三句', startMs: 3000, endMs: 4000 },
          ],
        },
      ],
      events: [],
    } as unknown as Production;
    expect(buildEditSource(production)).toEqual(source);
    const edit = {
      source,
      ...deriveEditTimeline(source, [clip('a', 0, 2000)]),
    };
    expect(isEditCurrent({ ...production, edit })).toBe(true);
    // jsonb reorders keys by length; a reloaded snapshot must stay current.
    expect(
      isEditCurrent({
        ...production,
        edit: {
          ...edit,
          source: {
            ...source,
            cues: source.cues.map(({ id, text, startMs, endMs }) => ({
              id,
              text,
              endMs,
              startMs,
            })),
          },
        },
      }),
    ).toBe(true);
    expect(
      isEditCurrent({
        ...production,
        edit,
        scenes: production.scenes.map((scene) => ({
          ...scene,
          cues: scene.cues.map((cue) =>
            cue.id === 'c2' ? { ...cue, text: '改过的口播' } : cue,
          ),
        })),
      }),
    ).toBe(false);
    expect(
      isEditCurrent({
        ...production,
        edit,
        artifacts: { video: 'production/p/r3/video.mp4' },
      }),
    ).toBe(false);
    expect(isEditCurrent({ ...production, edit, durationMs: 3000 })).toBe(
      false,
    );
  });
});
