import { useEffect, useMemo, useRef, useState } from 'react';
import { locateEditClip, type EditTimeline } from '@timotv/contracts';

/**
 * One <video> plays the exported film while we jump across clip boundaries and
 * apply each clip's audio level. The exported MP4, not this preview, is final.
 */
export function EditPreview({
  src,
  timeline,
  aspectRatio,
  outputMs,
  onOutputMs,
  playing,
  onPlayingChange,
  onTogglePlay,
  seekRequest,
}: {
  src: string;
  timeline: EditTimeline;
  aspectRatio: string;
  outputMs: number;
  onOutputMs: (ms: number) => void;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  onTogglePlay: () => void;
  seekRequest?: { ms: number; nonce: number };
}) {
  const video = useRef<HTMLVideoElement>(null);
  const outputRef = useRef(outputMs);
  outputRef.current = outputMs;
  const callback = useRef(onOutputMs);
  callback.current = onOutputMs;
  const setPlaying = useRef(onPlayingChange);
  setPlaying.current = onPlayingChange;
  const [activeIndex, setActiveIndex] = useState(0);
  const subtitle = useMemo(
    () =>
      timeline.subtitles.find(
        (cue) => cue.startMs <= outputMs && cue.endMs > outputMs,
      ),
    [timeline.subtitles, outputMs],
  );
  const position = timeline.clips.length
    ? locateEditClip(
        timeline,
        Math.max(0, Math.min(outputMs, timeline.durationMs - 1)),
      )
    : undefined;

  const seek = (ms: number) => {
    if (!timeline.clips.length) return;
    const clamped = Math.max(0, Math.min(ms, timeline.durationMs));
    const target = locateEditClip(
      timeline,
      Math.min(clamped, timeline.durationMs - 1),
    );
    setActiveIndex(target.index);
    outputRef.current = clamped;
    callback.current(clamped);
    if (video.current) video.current.currentTime = target.sourceMs / 1000;
  };

  // A trim or reorder changes the timeline under a still playhead. Keep the
  // moment, but move the source to whatever clip now plays there.
  useEffect(() => {
    const element = video.current;
    if (!element || !timeline.clips.length) return;
    const clamped = Math.max(
      0,
      Math.min(outputRef.current, timeline.durationMs),
    );
    const target = locateEditClip(
      timeline,
      Math.min(clamped, timeline.durationMs - 1),
    );
    setActiveIndex(target.index);
    element.currentTime = target.sourceMs / 1000;
    if (clamped !== outputRef.current) {
      outputRef.current = clamped;
      callback.current(clamped);
    }
  }, [timeline]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const clip = timeline.clips[activeIndex];
    if (!clip) return;
    element.muted = clip.muted;
    // HTMLMediaElement cannot amplify above 1; export still applies volume > 1.
    element.volume = clip.muted ? 0 : Math.min(1, clip.volume);
  }, [activeIndex, timeline]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (!playing) {
      element.pause();
      return;
    }
    const clip = timeline.clips[activeIndex];
    if (!clip) {
      setPlaying.current(false);
      return;
    }
    if (element.currentTime * 1000 >= clip.sourceOutMs - 20)
      element.currentTime = clip.sourceInMs / 1000;
    void element.play().catch(() => setPlaying.current(false));
  }, [playing, activeIndex, timeline]);

  useEffect(() => {
    if (!playing) return;
    let handle = 0;
    const tick = () => {
      const element = video.current;
      const clip = timeline.clips[activeIndex];
      if (!element || !clip) return setPlaying.current(false);
      const sourceMs = element.currentTime * 1000;
      if (sourceMs >= clip.sourceOutMs - 12) {
        const next = timeline.clips[activeIndex + 1];
        if (next) {
          setActiveIndex(activeIndex + 1);
          element.currentTime = next.sourceInMs / 1000;
          outputRef.current = next.timelineStartMs;
          callback.current(next.timelineStartMs);
          handle = requestAnimationFrame(tick);
          return;
        }
        element.pause();
        outputRef.current = timeline.durationMs;
        callback.current(timeline.durationMs);
        setPlaying.current(false);
        return;
      }
      const ms = clip.timelineStartMs + Math.max(0, sourceMs - clip.sourceInMs);
      if (Math.abs(ms - outputRef.current) >= 40) {
        outputRef.current = ms;
        callback.current(ms);
      }
      handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [playing, activeIndex, timeline]);

  useEffect(() => {
    if (seekRequest) seek(seekRequest.ms);
    // Seek only when the timeline asks for a new position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekRequest?.nonce]);

  return (
    <div className="edit-preview">
      <div className="edit-screen">
        <video
          ref={video}
          aria-label="剪辑预览"
          playsInline
          preload="metadata"
          src={src}
          title={playing ? '点击暂停' : '点击播放'}
          style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}
          onClick={onTogglePlay}
          onEnded={() => setPlaying.current(false)}
        />
        {position && (
          <span className="edit-preview-badge">
            片段 {String(position.index + 1).padStart(2, '0')}
          </span>
        )}
      </div>
      <div className="edit-preview-foot">
        <small className="edit-preview-note">
          原片自带字幕；这里的字幕按剪辑点重新计算。
        </small>
        <p className="edit-subtitle" aria-live="polite">
          {subtitle?.text ?? ''}
        </p>
      </div>
    </div>
  );
}
