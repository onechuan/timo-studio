import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Captions, Film, Pause, Play, ZoomIn, ZoomOut } from 'lucide-react';
import type {
  EditClip,
  EditTimeline as DerivedTimeline,
} from '@timotv/contracts';
import type { ClipThumbs } from './useClipThumbnails.js';

const pad = (value: number) => String(value).padStart(2, '0');

function clock(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
}

function timecode(ms: number, fps: number) {
  const total = Math.max(0, Math.round(ms));
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  const frames = Math.floor((total % 1000) / (1000 / fps));
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}

/** Room before 0 and after the end of the film, in pixels. */
const EDGE = 14;
/** The closest zoom: pixels a second. */
const MAX_PPS = 240;
/** Ruler steps, in seconds. */
const STEPS = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300];

/** A ruler step that leaves about 90px between labels. */
function stepFor(pps: number) {
  return STEPS.find((step) => step * pps >= 90) ?? 600;
}

type Drag = {
  id: string;
  startX: number;
  dx: number;
  active: boolean;
  target: number;
};

export function EditTimeline({
  clips,
  timeline,
  labels,
  selectedId,
  onSelect,
  onChange,
  onSeek,
  sourceDurationMs,
  fps,
  playheadMs,
  locked,
  playing,
  onTogglePlay,
  thumbnails,
}: {
  clips: EditClip[];
  timeline: DerivedTimeline;
  labels: string[];
  selectedId: string;
  onSelect: (id: string) => void;
  onChange: (clips: EditClip[], key?: string) => void;
  onSeek: (ms: number) => void;
  sourceDurationMs: number;
  fps: number;
  playheadMs: number;
  locked: boolean;
  playing: boolean;
  onTogglePlay: () => void;
  thumbnails: ClipThumbs;
}) {
  const frameMs = 1000 / fps;
  const durationMs = Math.max(1, timeline.durationMs);
  const scroller = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState(0);
  const [drag, setDrag] = useState<Drag | undefined>(undefined);
  const dragRef = useRef<Drag | undefined>(undefined);
  const selected = clips.find((clip) => clip.id === selectedId) ?? clips[0];
  const selectedLayout = selected
    ? timeline.clips.find((clip) => clip.id === selected.id)
    : undefined;

  useLayoutEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(element.clientWidth));
    observer.observe(element);
    setWidth(element.clientWidth);
    return () => observer.disconnect();
  }, []);

  // zoom 0 fits the whole film; between 0 and 1 the scale is geometric, so
  // every step of the slider feels the same.
  const fitPps = width > 0 ? (width - 2 * EDGE) / (durationMs / 1000) : 40;
  const pps = fitPps * Math.pow(Math.max(1, MAX_PPS / fitPps), zoom);
  const inner = Math.max(width, (durationMs / 1000) * pps + 2 * EDGE);
  const x = (ms: number) => EDGE + (ms / 1000) * pps;
  const snap = (ms: number) =>
    Math.round(Math.round((ms * fps) / 1000) * frameMs);
  const playheadLeft = Math.min(
    inner - 1,
    Math.max(0, x(Math.min(playheadMs, durationMs))),
  );

  // keep the moment under the pointer (or the playhead) fixed while zooming
  const anchor = useRef<{ ms: number; at: number } | null>(null);
  useLayoutEffect(() => {
    const element = scroller.current;
    const pinned = anchor.current;
    if (!element || !pinned) return;
    anchor.current = null;
    element.scrollLeft = Math.max(0, x(pinned.ms) - pinned.at);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pps]);
  const zoomTo = (next: number, clientX?: number) => {
    const element = scroller.current;
    if (element) {
      const rect = element.getBoundingClientRect();
      const at =
        clientX != null
          ? clientX - rect.left
          : Math.max(
              0,
              Math.min(rect.width, x(playheadMs) - element.scrollLeft),
            );
      anchor.current = {
        ms: Math.max(
          0,
          Math.min(durationMs, ((element.scrollLeft + at - EDGE) / pps) * 1000),
        ),
        at,
      };
    }
    setZoom(Math.max(0, Math.min(1, next)));
  };
  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      zoomTo(zoom - event.deltaY * 0.004, event.clientX);
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  });

  // while playing, keep the playhead in view
  useEffect(() => {
    const element = scroller.current;
    if (!element || !playing) return;
    if (
      playheadLeft < element.scrollLeft + 24 ||
      playheadLeft > element.scrollLeft + element.clientWidth - 48
    )
      element.scrollLeft = Math.max(
        0,
        playheadLeft - element.clientWidth * 0.2,
      );
  }, [playheadLeft, playing]);

  const timeAt = (clientX: number) => {
    const element = scroller.current;
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    return Math.max(
      0,
      Math.min(
        durationMs,
        ((clientX - rect.left + element.scrollLeft - EDGE) / pps) * 1000,
      ),
    );
  };

  // one seek a frame while scrubbing
  const scrub = useRef<{ ms: number; raf: number } | null>(null);
  const seekAt = (clientX: number) => {
    const ms = snap(timeAt(clientX));
    if (scrub.current) {
      scrub.current.ms = ms;
      return;
    }
    scrub.current = {
      ms,
      raf: requestAnimationFrame(() => {
        const pending = scrub.current;
        scrub.current = null;
        if (pending) onSeek(pending.ms);
      }),
    };
  };
  useEffect(
    () => () => {
      if (scrub.current) cancelAnimationFrame(scrub.current.raf);
    },
    [],
  );

  const scrubDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (locked || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('.edit-clip, .edit-sub, .edit-trim-handle')) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    seekAt(event.clientX);
  };
  const scrubMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId))
      seekAt(event.clientX);
  };
  const scrubUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      /* the pointer already left the element */
    }
  };

  // pressing a clip picks it; dragging it moves it to another place
  const startDrag = (event: ReactPointerEvent<HTMLElement>, clip: EditClip) => {
    if (locked || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const next: Drag = {
      id: clip.id,
      startX: event.clientX,
      dx: 0,
      active: false,
      target: timeline.clips.findIndex((item) => item.id === clip.id),
    };
    dragRef.current = next;
    setDrag(next);
  };
  const moveDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const current = dragRef.current;
    if (!current) return;
    const dx = event.clientX - current.startX;
    if (!current.active && Math.abs(dx) < 4) return;
    const at = timeAt(event.clientX);
    const rest = timeline.clips.filter((clip) => clip.id !== current.id);
    let target = rest.findIndex(
      (clip) => at < clip.timelineStartMs + clip.durationMs / 2,
    );
    if (target < 0) target = rest.length;
    const next = { ...current, dx, active: true, target };
    dragRef.current = next;
    setDrag(next);
  };
  const endDrag = () => {
    const current = dragRef.current;
    dragRef.current = undefined;
    setDrag(undefined);
    if (!current) return;
    if (!current.active) {
      const layout = timeline.clips.find((clip) => clip.id === current.id);
      onSelect(current.id);
      if (layout) onSeek(layout.timelineStartMs);
      return;
    }
    const moved = clips.find((clip) => clip.id === current.id);
    if (!moved) return;
    const next = clips.filter((clip) => clip.id !== current.id);
    next.splice(Math.max(0, Math.min(current.target, next.length)), 0, moved);
    if (next.some((clip, at) => clip.id !== clips[at]?.id)) onChange(next);
  };
  const cancelDrag = () => {
    dragRef.current = undefined;
    setDrag(undefined);
  };

  const trim = (edge: 'in' | 'out') => (event: ReactPointerEvent) => {
    if (locked || !selected) return;
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startIn = selected.sourceInMs;
    const startOut = selected.sourceOutMs;
    const apply = (clientX: number) => {
      const delta = ((clientX - startX) / pps) * 1000;
      if (edge === 'in') {
        const nextIn = snap(
          Math.min(Math.max(startIn + delta, 0), startOut - frameMs),
        );
        onChange(
          clips.map((clip) =>
            clip.id === selected.id ? { ...clip, sourceInMs: nextIn } : clip,
          ),
          `trim:${selected.id}:in`,
        );
      } else {
        const nextOut = snap(
          Math.min(
            Math.max(startOut + delta, startIn + frameMs),
            sourceDurationMs,
          ),
        );
        onChange(
          clips.map((clip) =>
            clip.id === selected.id ? { ...clip, sourceOutMs: nextOut } : clip,
          ),
          `trim:${selected.id}:out`,
        );
      }
    };
    const move = (moveEvent: PointerEvent) => apply(moveEvent.clientX);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const nudge = (edge: 'in' | 'out', direction: -1 | 1, coarse: boolean) => {
    if (locked || !selected) return;
    const delta = direction * (coarse ? 1000 : frameMs);
    if (edge === 'in') {
      const nextIn = snap(
        Math.min(
          Math.max(selected.sourceInMs + delta, 0),
          selected.sourceOutMs - frameMs,
        ),
      );
      onChange(
        clips.map((clip) =>
          clip.id === selected.id ? { ...clip, sourceInMs: nextIn } : clip,
        ),
        `trim:${selected.id}:in`,
      );
    } else {
      const nextOut = snap(
        Math.min(
          Math.max(selected.sourceOutMs + delta, selected.sourceInMs + frameMs),
          sourceDurationMs,
        ),
      );
      onChange(
        clips.map((clip) =>
          clip.id === selected.id ? { ...clip, sourceOutMs: nextOut } : clip,
        ),
        `trim:${selected.id}:out`,
      );
    }
  };

  const step = stepFor(pps);
  const ticks = useMemo(() => {
    const result: { ms: number; major: boolean }[] = [];
    const minor = step / 5;
    for (let at = 0; at <= durationMs / 1000 + 1e-6; at += minor) {
      const index = Math.round(at / minor);
      result.push({ ms: at * 1000, major: index % 5 === 0 });
    }
    return result;
  }, [step, durationMs]);

  const dropLine = (() => {
    if (!drag?.active) return undefined;
    const rest = timeline.clips.filter((clip) => clip.id !== drag.id);
    if (!rest.length) return EDGE;
    if (drag.target <= 0) return EDGE;
    if (drag.target >= rest.length) {
      const last = rest[rest.length - 1]!;
      return x(last.timelineStartMs + last.durationMs);
    }
    return x(rest[drag.target]!.timelineStartMs);
  })();

  return (
    <section className="edit-timeline" aria-label="剪辑时间轴">
      <div className="edit-transport">
        <span className="edit-timecode" aria-label="当前时间">
          <strong>{timecode(playheadMs, fps)}</strong>
          <span>/ {timecode(durationMs, fps)}</span>
        </span>
        <button
          className="edit-play"
          aria-label={playing ? '暂停' : '播放'}
          title="空格播放 / 暂停"
          onClick={onTogglePlay}
          disabled={locked}
        >
          {playing ? (
            <Pause size={14} fill="currentColor" />
          ) : (
            <Play size={14} fill="currentColor" />
          )}
        </button>
        <span className="edit-transport-hint">
          {clips.length} 段 · 12fps · 拖动手柄裁剪，拖动片段重排
        </span>
        <div className="edit-zoom">
          <button
            className="edit-zoom-step"
            aria-label="缩小时间轴"
            title="缩小时间轴"
            onClick={() => zoomTo(zoom - 0.15)}
          >
            <ZoomOut size={14} />
          </button>
          <input
            aria-label="时间轴缩放"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={zoom}
            onChange={(event) => zoomTo(Number(event.target.value))}
          />
          <button
            className="edit-zoom-step"
            aria-label="放大时间轴"
            title="放大时间轴"
            onClick={() => zoomTo(zoom + 0.15)}
          >
            <ZoomIn size={14} />
          </button>
          <button
            className="edit-zoom-fit"
            onClick={() => zoomTo(0)}
            title="让整部影片适应时间轴"
          >
            适应
          </button>
        </div>
      </div>

      <div className="edit-timeline-grid">
        <div className="edit-track-labels" aria-hidden="true">
          <span className="edit-key-ruler" />
          <span className="edit-key-picture">
            <Film size={13} />
            画面
          </span>
          <span className="edit-key-subtitle">
            <Captions size={13} />
            字幕
          </span>
        </div>
        <div className="edit-track-scroll" ref={scroller}>
          <div
            className={
              'edit-track-content' + (drag?.active ? ' is-dragging' : '')
            }
            style={{ width: inner }}
            onPointerDown={scrubDown}
            onPointerMove={scrubMove}
            onPointerUp={scrubUp}
            onPointerCancel={scrubUp}
          >
            <div className="edit-ruler" aria-hidden="true">
              {ticks.map(({ ms, major }) => (
                <i
                  key={ms}
                  className={major ? 'is-major' : undefined}
                  style={{ left: x(ms) }}
                >
                  {major && <b>{clock(ms)}</b>}
                </i>
              ))}
            </div>

            <div className="edit-lane edit-picture-lane" aria-label="视频轨道">
              <ol className="edit-strip" aria-label="剪辑片段顺序">
                {timeline.clips.map((layout, position) => {
                  const clip = clips.find((item) => item.id === layout.id);
                  if (!clip) return null;
                  const isSelected = layout.id === selected?.id;
                  const isDragged = drag?.id === layout.id;
                  const left = x(layout.timelineStartMs);
                  const clipWidth = Math.max(
                    4,
                    (layout.durationMs / 1000) * pps - 2,
                  );
                  const short = clipWidth < 92;
                  const frames = thumbnails[layout.id] ?? [];
                  return (
                    <li
                      key={layout.id}
                      style={{
                        left,
                        width: clipWidth,
                        transform:
                          isDragged && drag?.active
                            ? `translateX(${drag.dx}px)`
                            : undefined,
                      }}
                    >
                      <button
                        className={
                          'edit-clip' +
                          (isSelected ? ' selected' : '') +
                          (isDragged && drag?.active ? ' dragging' : '') +
                          (short ? ' compact' : '')
                        }
                        aria-pressed={isSelected}
                        aria-label={`片段 ${position + 1}：${
                          labels[position] ?? ''
                        }，${(layout.durationMs / 1000).toFixed(1)} 秒`}
                        title="单击选中，左右拖动可调整顺序"
                        onPointerDown={(event) => startDrag(event, clip)}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={cancelDrag}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onSelect(clip.id);
                            onSeek(layout.timelineStartMs);
                          }
                        }}
                      >
                        {frames.length > 0 ? (
                          <span className="edit-clip-strip" aria-hidden="true">
                            {frames.map((frame, at) => (
                              <span
                                key={at}
                                style={{ backgroundImage: `url(${frame})` }}
                              />
                            ))}
                          </span>
                        ) : (
                          <span className="edit-clip-wash" aria-hidden="true" />
                        )}
                        <span className="edit-clip-index">
                          {pad(position + 1)}
                        </span>
                        {(clip.muted || clip.volume === 0) && (
                          <span className="edit-clip-mute" title="已静音">
                            <VolumeOffGlyph />
                          </span>
                        )}
                        <span className="edit-clip-meta">
                          <strong>{labels[position] ?? '原片片段'}</strong>
                          <small>
                            {(layout.durationMs / 1000).toFixed(1)}s
                          </small>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              {!locked && selectedLayout && selected && (
                <>
                  <button
                    className="edit-trim-handle in"
                    aria-label="裁剪入点"
                    title="拖动调整入点 · ←/→ 一帧，Shift 一秒"
                    style={{
                      left: x(selectedLayout.timelineStartMs) + 1,
                    }}
                    onPointerDown={trim('in')}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowLeft') {
                        event.preventDefault();
                        event.stopPropagation();
                        nudge('in', -1, event.shiftKey);
                      } else if (event.key === 'ArrowRight') {
                        event.preventDefault();
                        event.stopPropagation();
                        nudge('in', 1, event.shiftKey);
                      }
                    }}
                  >
                    <span />
                  </button>
                  <button
                    className="edit-trim-handle out"
                    aria-label="裁剪出点"
                    title="拖动调整出点 · ←/→ 一帧，Shift 一秒"
                    style={{
                      left:
                        x(
                          selectedLayout.timelineStartMs +
                            selectedLayout.durationMs,
                        ) - 11,
                    }}
                    onPointerDown={trim('out')}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowLeft') {
                        event.preventDefault();
                        event.stopPropagation();
                        nudge('out', -1, event.shiftKey);
                      } else if (event.key === 'ArrowRight') {
                        event.preventDefault();
                        event.stopPropagation();
                        nudge('out', 1, event.shiftKey);
                      }
                    }}
                  >
                    <span />
                  </button>
                </>
              )}
            </div>

            <div className="edit-lane edit-subtitle-lane" aria-label="字幕轨道">
              {timeline.subtitles.map((cue) => {
                const left = x(cue.startMs);
                const cueWidth = Math.max(
                  6,
                  ((cue.endMs - cue.startMs) / 1000) * pps - 2,
                );
                return (
                  <button
                    key={`${cue.startMs}-${cue.text}`}
                    className="edit-sub"
                    style={{ left, width: cueWidth }}
                    title={`${clock(cue.startMs)} · ${cue.text}`}
                    aria-label={`字幕：${cue.text}`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSeek(cue.startMs);
                    }}
                  >
                    {cueWidth > 38 && <span>{cue.text}</span>}
                  </button>
                );
              })}
            </div>

            {dropLine !== undefined && (
              <i
                className="edit-drop-line"
                style={{ left: dropLine }}
                aria-hidden="true"
              />
            )}

            <i
              className="edit-playhead"
              style={{ transform: `translateX(${playheadLeft}px)` }}
              aria-hidden="true"
            >
              <span className="edit-playhead-grip" />
            </i>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A small volume-off mark that keeps the clip header compact. */
function VolumeOffGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
      <path
        d="M2.5 6v4h2.2L8 12.5v-9L4.7 6H2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="m10.5 6.5 3 3m0-3-3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
