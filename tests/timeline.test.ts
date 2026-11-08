import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { timelineSchema } from '../packages/contracts/src/index.js';
import { fixture, video } from './fixtures/timeline.js';
describe('时间轴契约', () => {
  it('接受空时间轴', () =>
    expect(timelineSchema.safeParse(fixture()).success).toBe(true));
  it.each([-1, 0.5])('拒绝非法时间 %s', (n) => {
    const t = fixture();
    t.videoClips = [{ ...video(), timelineStartMs: n }];
    expect(timelineSchema.safeParse(t).success).toBe(false);
  });
  it.each([0, -1])('拒绝非法出入点 %s', (n) => {
    const t = fixture();
    t.videoClips = [{ ...video(), sourceOutMs: n }];
    expect(timelineSchema.safeParse(t).success).toBe(false);
  });
  it.each([
    [100, 100],
    [100, 99],
    [-1, 10],
  ])('拒绝字幕范围 %s / %s', (startMs, endMs) => {
    const t = fixture();
    t.subtitles = [{ id: randomUUID(), text: '字幕', startMs, endMs }];
    expect(timelineSchema.safeParse(t).success).toBe(false);
  });
  it('相邻片段采用左闭右开，不冲突', () => {
    const t = fixture();
    t.videoClips = [video(), { ...video(), timelineStartMs: 1000 }];
    expect(timelineSchema.safeParse(t).success).toBe(true);
    t.videoClips[1].timelineStartMs = 999;
    expect(timelineSchema.safeParse(t).success).toBe(false);
  });
  it('图片只接受 durationMs', () => {
    const t = fixture();
    const c = {
      id: randomUUID(),
      assetId: randomUUID(),
      kind: 'image',
      timelineStartMs: 0,
      durationMs: 1000,
    };
    expect(timelineSchema.safeParse({ ...t, videoClips: [c] }).success).toBe(
      true,
    );
    expect(
      timelineSchema.safeParse({ ...t, videoClips: [{ ...c, sourceInMs: 0 }] })
        .success,
    ).toBe(false);
  });
});
