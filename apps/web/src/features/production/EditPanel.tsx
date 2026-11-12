import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Captions,
  Download,
  Film,
  Layers,
  Redo2,
  RotateCcw,
  Save,
  Scissors,
  Trash2,
  Undo2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  buildEditSource,
  defaultEditClips,
  deriveEditTimeline,
  locateEditClip,
  type EditClip,
  type Production,
} from '@timotv/contracts';
import { EditPreview } from './EditPreview.js';
import { EditTimeline } from './EditTimeline.js';
import { useClipThumbnails } from './useClipThumbnails.js';

const pad = (value: number) => String(value).padStart(2, '0');

const clock = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
};

const toInput = (
  clip: Pick<
    EditClip,
    'id' | 'sourceInMs' | 'sourceOutMs' | 'volume' | 'muted'
  >,
): EditClip => ({
  id: clip.id,
  sourceInMs: clip.sourceInMs,
  sourceOutMs: clip.sourceOutMs,
  volume: clip.volume,
  muted: clip.muted,
});

const signature = (clips: EditClip[]) =>
  JSON.stringify(
    clips.map((clip) => [
      clip.id,
      clip.sourceInMs,
      clip.sourceOutMs,
      clip.volume,
      clip.muted,
    ]),
  );

function timedRange(scene: Production['scenes'][number]) {
  const starts = scene.cues
    .map((cue) => cue.startMs)
    .filter((value): value is number => value !== undefined);
  const ends = scene.cues
    .map((cue) => cue.endMs)
    .filter((value): value is number => value !== undefined);
  if (!starts.length || !ends.length) return undefined;
  return { startMs: Math.min(...starts), endMs: Math.max(...ends) };
}

export function EditPanel({
  doc,
  locked,
  error,
  saveEdit,
  exportEdit,
  resetEdit,
  file,
}: {
  doc: Production;
  locked: boolean;
  error?: string;
  saveEdit: (clips: EditClip[]) => void;
  exportEdit: (clips: EditClip[]) => void;
  resetEdit: () => void;
  file: (key: string) => string;
}) {
  const stored = () =>
    doc.edit?.clips.map((clip) => toInput(clip)) ?? defaultEditClips(doc);
  const [clips, setClips] = useState<EditClip[]>(stored);
  const [selectedId, setSelectedId] = useState(clips[0]?.id ?? '');
  const [outputMs, setOutputMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [seekRequest, setSeekRequest] = useState<{
    ms: number;
    nonce: number;
  }>();
  const seekNonce = useRef(0);
  const clipsRef = useRef(clips);
  const historyRef = useRef<EditClip[][]>([]);
  const futureRef = useRef<EditClip[][]>([]);
  const lastCommit = useRef<{ key: string; at: number } | null>(null);
  const [, setRevisionTick] = useState(0);
  const bump = () => setRevisionTick((value) => value + 1);

  useEffect(() => {
    const next = stored();
    clipsRef.current = next;
    setClips(next);
    setSelectedId(next[0]?.id ?? '');
    setOutputMs(0);
    setPlaying(false);
    historyRef.current = [];
    futureRef.current = [];
    lastCommit.current = null;
    seekNonce.current += 1;
    setSeekRequest({ ms: 0, nonce: seekNonce.current });
    bump();
  }, [
    doc.revision,
    doc.artifacts.video,
    doc.edit?.source.videoKey,
    doc.edit?.output?.exportedAt,
  ]);

  const source = useMemo(() => {
    try {
      return buildEditSource(doc);
    } catch {
      return undefined;
    }
  }, [
    doc.projectId,
    doc.revision,
    doc.artifacts.video,
    doc.durationMs,
    doc.scenes,
  ]);
  const derived = useMemo(() => {
    if (!source) return undefined;
    try {
      return { timeline: deriveEditTimeline(source, clips), error: '' };
    } catch (cause) {
      return {
        timeline: undefined,
        error: cause instanceof Error ? cause.message : '剪辑范围无效',
      };
    }
  }, [source, clips]);
  const scenes = useMemo(
    () =>
      doc.scenes.flatMap((scene) => {
        const range = timedRange(scene);
        return range ? [{ title: scene.title, ...range }] : [];
      }),
    [doc.scenes],
  );
  const labels = useMemo(() => {
    const timelineClips = derived?.timeline?.clips ?? [];
    return timelineClips.map((clip, index) => {
      // PostgreSQL jsonb reorders keys, so match on the clip's midpoint rather
      // than object identity; a sliver of the previous scene must not win.
      const midpoint = (clip.sourceInMs + clip.sourceOutMs) / 2;
      const scene = scenes.find(
        (candidate) =>
          midpoint >= candidate.startMs && midpoint < candidate.endMs,
      );
      return scene?.title ?? `原片 ${index + 1}`;
    });
  }, [scenes, derived]);
  const thumbnails = useClipThumbnails(
    source ? file(source.videoKey) : '',
    clips,
  );

  const timeline = derived?.timeline;
  const durationMs = timeline?.durationMs ?? 0;
  const fps = source?.fps ?? 12;
  const frameMs = 1000 / fps;
  const saved =
    doc.edit?.clips.map((clip) => toInput(clip)) ?? defaultEditClips(doc);
  const dirty = signature(clips) !== signature(saved);
  const canExport = !locked && !dirty && !!timeline && clips.length > 0;
  const scaled = clips.find((clip) => clip.id === selectedId) ?? clips[0];
  const index = scaled ? clips.findIndex((clip) => clip.id === scaled.id) : -1;
  const maxIn = scaled ? Math.max(0, scaled.sourceOutMs - frameMs) : 0;
  const minOut =
    scaled && source
      ? Math.min(source.durationMs, scaled.sourceInMs + frameMs)
      : 0;

  const commit = (next: EditClip[], key?: string) => {
    if (locked) return;
    const now = Date.now();
    const coalesce =
      !!key &&
      lastCommit.current?.key === key &&
      now - lastCommit.current.at < 800;
    if (!coalesce) {
      historyRef.current.push(clipsRef.current);
      if (historyRef.current.length > 80) historyRef.current.shift();
      futureRef.current = [];
    }
    lastCommit.current = key ? { key, at: now } : null;
    clipsRef.current = next;
    setClips(next);
    bump();
  };
  const undo = () => {
    const previous = historyRef.current.pop();
    if (!previous) return;
    futureRef.current.push(clipsRef.current);
    clipsRef.current = previous;
    setClips(previous);
    if (!previous.some((clip) => clip.id === selectedId))
      setSelectedId(previous[0]?.id ?? '');
    lastCommit.current = null;
    bump();
  };
  const redo = () => {
    const next = futureRef.current.pop();
    if (!next) return;
    historyRef.current.push(clipsRef.current);
    clipsRef.current = next;
    setClips(next);
    if (!next.some((clip) => clip.id === selectedId))
      setSelectedId(next[0]?.id ?? '');
    lastCommit.current = null;
    bump();
  };

  const seekTo = (ms: number) => {
    const clamped = Math.max(
      0,
      Math.min(durationMs || ms, Number.isFinite(ms) ? ms : 0),
    );
    setPlaying(false);
    setOutputMs(clamped);
    seekNonce.current += 1;
    setSeekRequest({ ms: clamped, nonce: seekNonce.current });
  };
  const togglePlay = () => {
    if (locked || !timeline) return;
    if (!playing && outputMs >= durationMs - 10) seekTo(0);
    setPlaying((current) => !current);
  };
  const selectAndSeek = (id: string) => {
    setSelectedId(id);
    const layout = timeline?.clips.find((clip) => clip.id === id);
    if (layout) seekTo(layout.timelineStartMs);
  };

  const changeSelected = (patch: Partial<EditClip>, key?: string) => {
    if (!scaled) return;
    commit(
      clips.map((clip) =>
        clip.id === scaled.id ? { ...clip, ...patch } : clip,
      ),
      key,
    );
  };
  const updateSelected = (patch: Partial<EditClip>) => {
    if (!scaled) return;
    commit(
      clips.map((clip) =>
        clip.id === scaled.id ? { ...clip, ...patch } : clip,
      ),
    );
  };

  const split = () => {
    if (!timeline || !scaled) return;
    const position = locateEditClip(
      timeline,
      Math.max(0, Math.min(outputMs, timeline.durationMs - 1)),
    );
    const at = clips.findIndex((clip) => clip.id === position.clip.id);
    if (at < 0) return;
    const sourceMs = Math.round((position.sourceMs * fps) / 1000) * frameMs;
    const target = clips[at]!;
    if (
      sourceMs - target.sourceInMs < frameMs * 0.9 ||
      target.sourceOutMs - sourceMs < frameMs * 0.9
    )
      return;
    const id = `clip-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const next = [...clips];
    next.splice(
      at,
      1,
      { ...target, sourceOutMs: sourceMs },
      {
        id,
        sourceInMs: sourceMs,
        sourceOutMs: target.sourceOutMs,
        volume: target.volume,
        muted: target.muted,
      },
    );
    commit(next);
    setSelectedId(id);
  };
  const remove = () => {
    if (locked || clips.length < 2 || !scaled) return;
    const next = clips.filter((clip) => clip.id !== scaled.id);
    commit(next);
    setSelectedId(next[Math.max(0, index - 1)]!.id);
  };
  const move = (direction: -1 | 1) => {
    if (locked || !scaled) return;
    const target = index + direction;
    if (target < 0 || target >= clips.length) return;
    const next = [...clips];
    [next[index], next[target]] = [next[target]!, next[index]!];
    commit(next);
    setSelectedId(scaled.id);
  };
  const resetClip = (id: string) => {
    if (locked) return;
    const clip = clips.find((candidate) => candidate.id === id);
    if (!clip || !doc.durationMs) return;
    const midpoint = (clip.sourceInMs + clip.sourceOutMs) / 2;
    const scene = scenes.find(
      (candidate) =>
        midpoint >= candidate.startMs && midpoint <= candidate.endMs,
    );
    const sourceInMs = Math.max(0, scene?.startMs ?? 0);
    const sourceOutMs = Math.min(
      doc.durationMs,
      scene?.endMs ?? doc.durationMs,
    );
    if (sourceOutMs <= sourceInMs) return;
    commit(
      clips.map((candidate) =>
        candidate.id === id
          ? { ...candidate, sourceInMs, sourceOutMs, volume: 1, muted: false }
          : candidate,
      ),
    );
  };
  const reset = () => {
    if (locked) return;
    const next = defaultEditClips(doc);
    clipsRef.current = next;
    setClips(next);
    setSelectedId(next[0]?.id ?? '');
    setOutputMs(0);
    setPlaying(false);
    historyRef.current = [];
    futureRef.current = [];
    lastCommit.current = null;
    seekNonce.current += 1;
    setSeekRequest({ ms: 0, nonce: seekNonce.current });
    if (doc.edit) resetEdit();
    bump();
  };

  // keys: Space plays, arrows seek, Delete removes, ⌘Z / ⇧⌘Z undo and redo
  const keyHandler = useRef<(event: KeyboardEvent) => void>(() => {});
  keyHandler.current = (event) => {
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
    )
      return;
    const mod = event.metaKey || event.ctrlKey;
    if (mod && (event.key === 'z' || event.key === 'Z')) {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if (mod && (event.key === 'y' || event.key === 'Y')) {
      event.preventDefault();
      redo();
      return;
    }
    if (mod || event.altKey) return;
    if (event.code === 'Space') {
      if (target?.closest('button, a, [role="button"]')) return;
      event.preventDefault();
      togglePlay();
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      remove();
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const step = event.shiftKey ? 1000 : frameMs;
      seekTo(outputMs + (event.key === 'ArrowLeft' ? -step : step));
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      seekTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      seekTo(durationMs);
    }
  };
  useEffect(() => {
    const handle = (event: KeyboardEvent) => keyHandler.current(event);
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  if (!source)
    return (
      <div className="editor-empty">
        <Film size={22} />
        <p>先完成制作并导出 MP4，才能开始剪辑。</p>
      </div>
    );

  const status = dirty
    ? '有未保存的剪辑修改'
    : doc.stage === 'rendering' && doc.jobId
      ? '后台正在处理剪辑点…'
      : doc.edit
        ? '剪辑已保存'
        : '当前为初始剪辑';

  return (
    <div className="edit-studio">
      <header className="edit-studio-bar">
        <div className="edit-studio-title">
          <Scissors size={15} />
          <strong>剪辑成片</strong>
          <small>
            {clips.length} 段 · {clock(durationMs)} · {fps}fps
          </small>
        </div>
        <div className="edit-history" role="group" aria-label="编辑历史">
          <button
            className="edit-icon-button"
            aria-label="撤销"
            title="撤销 ⌘Z"
            disabled={locked || historyRef.current.length === 0}
            onClick={undo}
          >
            <Undo2 size={15} />
          </button>
          <button
            className="edit-icon-button"
            aria-label="重做"
            title="重做 ⇧⌘Z"
            disabled={locked || futureRef.current.length === 0}
            onClick={redo}
          >
            <Redo2 size={15} />
          </button>
        </div>
        <span
          className={'edit-save-state' + (dirty ? ' is-dirty' : '')}
          role="status"
        >
          {status}
        </span>
        <div className="edit-studio-actions">
          <button
            className="text-button"
            disabled={locked}
            onClick={reset}
            title="回到按场景生成的初始剪辑"
          >
            <RotateCcw size={14} />
            重置剪辑
          </button>
          <button
            className="secondary"
            disabled={locked || !dirty}
            onClick={() => saveEdit(clips)}
          >
            <Save size={15} />
            保存剪辑
          </button>
          <button
            disabled={!canExport}
            onClick={() => {
              setPlaying(false);
              exportEdit(clips);
            }}
            title={dirty ? '请先保存剪辑' : undefined}
          >
            <Download size={15} />
            {doc.jobId && doc.stage === 'rendering'
              ? '正在导出剪辑…'
              : '导出剪辑 MP4'}
          </button>
        </div>
      </header>

      <div className="edit-studio-body">
        <aside className="edit-library" aria-label="片段列表">
          <div className="edit-pane-head">
            <Layers size={14} />
            片段
            <small>{clips.length}</small>
          </div>
          <ol className="edit-layer-list">
            {timeline?.clips.map((layout, position) => {
              const clip = clips.find((item) => item.id === layout.id);
              if (!clip) return null;
              const isSelected = clip.id === scaled?.id;
              return (
                <li key={clip.id}>
                  <button
                    className={'edit-layer' + (isSelected ? ' is-on' : '')}
                    aria-pressed={isSelected}
                    aria-label={`片段 ${position + 1}：${
                      labels[position] ?? ''
                    }`}
                    onClick={() => selectAndSeek(clip.id)}
                  >
                    <span
                      className="edit-layer-thumb"
                      style={
                        thumbnails[clip.id]?.[0]
                          ? {
                              backgroundImage: `url(${thumbnails[clip.id]?.[0]})`,
                            }
                          : undefined
                      }
                    >
                      {pad(position + 1)}
                    </span>
                    <span className="edit-layer-copy">
                      <strong>{labels[position] ?? '原片片段'}</strong>
                      <small>
                        {clock(layout.timelineStartMs)} ·{' '}
                        {(layout.durationMs / 1000).toFixed(1)}s
                      </small>
                    </span>
                    {clip.muted || clip.volume === 0 ? (
                      <VolumeX size={12} aria-label="已静音" />
                    ) : (
                      <Volume2 size={12} className="edit-layer-volume" />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="edit-library-hint">
            在时间轴上拖动片段可重新排序；拖动黄色手柄裁剪入点与出点。
          </p>
        </aside>

        <main className="edit-canvas">
          {timeline ? (
            <EditPreview
              src={file(source.videoKey)}
              timeline={timeline}
              aspectRatio={doc.aspectRatio}
              outputMs={outputMs}
              onOutputMs={setOutputMs}
              playing={playing}
              onPlayingChange={setPlaying}
              onTogglePlay={togglePlay}
              seekRequest={seekRequest}
            />
          ) : (
            <div className="error" role="alert">
              {derived?.error}
            </div>
          )}
          {derived?.error && timeline && (
            <div className="error" role="alert">
              {derived.error}
            </div>
          )}
        </main>

        <aside className="edit-inspector" aria-label="片段属性">
          <div className="edit-pane-head">
            <Scissors size={14} />
            片段属性
          </div>
          {scaled && (
            <>
              <div className="edit-inspector-title">
                <span>片段 {pad(index + 1)}</span>
                <strong>{labels[index] ?? '原片片段'}</strong>
                <small>
                  {(scaled.sourceInMs / 1000).toFixed(2)}s →{' '}
                  {(scaled.sourceOutMs / 1000).toFixed(2)}s · 成片{' '}
                  {clock(timeline?.clips[index]?.timelineStartMs ?? 0)}
                </small>
              </div>
              <label className="edit-field">
                <span>入点</span>
                <input
                  aria-label="片段入点"
                  type="range"
                  min={0}
                  max={maxIn}
                  step={frameMs}
                  value={Math.min(scaled.sourceInMs, maxIn)}
                  disabled={locked}
                  onChange={(event) =>
                    changeSelected(
                      {
                        sourceInMs: Math.min(
                          Math.max(0, +event.target.value),
                          maxIn,
                        ),
                      },
                      `in:${scaled.id}`,
                    )
                  }
                />
                <output>{(scaled.sourceInMs / 1000).toFixed(2)}s</output>
              </label>
              <label className="edit-field">
                <span>出点</span>
                <input
                  aria-label="片段出点"
                  type="range"
                  min={minOut}
                  max={source.durationMs}
                  step={frameMs}
                  value={Math.max(
                    Math.min(scaled.sourceOutMs, source.durationMs),
                    minOut,
                  )}
                  disabled={locked}
                  onChange={(event) =>
                    changeSelected(
                      {
                        sourceOutMs: Math.max(
                          Math.min(+event.target.value, source.durationMs),
                          minOut,
                        ),
                      },
                      `out:${scaled.id}`,
                    )
                  }
                />
                <output>{(scaled.sourceOutMs / 1000).toFixed(2)}s</output>
              </label>
              <label className="edit-field edit-volume">
                <span>
                  {scaled.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  音量
                </span>
                <input
                  aria-label="片段音量"
                  type="range"
                  min={0}
                  max={2}
                  step={0.05}
                  value={scaled.volume}
                  disabled={locked || scaled.muted}
                  onChange={(event) =>
                    changeSelected(
                      { volume: +event.target.value },
                      `volume:${scaled.id}`,
                    )
                  }
                />
                <output>{Math.round(scaled.volume * 100)}%</output>
              </label>
              <label className="edit-mute">
                <input
                  type="checkbox"
                  checked={scaled.muted}
                  disabled={locked}
                  onChange={(event) =>
                    updateSelected({ muted: event.target.checked })
                  }
                />
                静音本段
              </label>
              <div
                className="edit-clip-actions"
                role="toolbar"
                aria-label="片段工具"
              >
                <button
                  className="edit-tool"
                  disabled={locked || !timeline}
                  onClick={split}
                  title="在播放头处分割片段"
                >
                  <Scissors size={14} />
                  分割
                </button>
                <button
                  className="edit-tool"
                  disabled={locked || index <= 0}
                  onClick={() => move(-1)}
                  aria-label="片段左移"
                  title="片段左移"
                >
                  <ArrowLeft size={15} />
                </button>
                <button
                  className="edit-tool"
                  disabled={locked || index === clips.length - 1}
                  onClick={() => move(1)}
                  aria-label="片段右移"
                  title="片段右移"
                >
                  <ArrowRight size={15} />
                </button>
                <button
                  className="edit-tool"
                  disabled={locked}
                  onClick={() => resetClip(scaled.id)}
                  title="恢复本段的场景范围"
                >
                  <RotateCcw size={14} />
                  恢复本段
                </button>
                <button
                  className="edit-tool danger"
                  disabled={locked || clips.length < 2}
                  onClick={remove}
                  title="删除选中的片段"
                >
                  <Trash2 size={14} />
                  删除
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      {timeline && (
        <EditTimeline
          clips={clips}
          timeline={timeline}
          labels={labels}
          selectedId={scaled?.id ?? ''}
          onSelect={setSelectedId}
          onChange={commit}
          onSeek={seekTo}
          sourceDurationMs={source.durationMs}
          fps={fps}
          playheadMs={outputMs}
          locked={locked}
          playing={playing}
          onTogglePlay={togglePlay}
          thumbnails={thumbnails}
        />
      )}

      <div className="edit-studio-foot">
        <span>
          <Captions size={13} />
          字幕会跟随裁剪与重排自动重算
        </span>
        <small>
          {doc.edit
            ? '导出使用已保存的剪辑点。'
            : '当前为初始剪辑；保存后会记录剪辑点。修改口播或画面后需重新剪辑。'}
        </small>
      </div>

      {doc.edit?.output && (
        <div className="edit-output">
          <div className="edit-pane-head">
            <Film size={14} />
            成片
            <small>{(doc.edit.output.durationMs / 1000).toFixed(1)} 秒</small>
          </div>
          <video
            aria-label="剪辑后的 MP4"
            controls
            playsInline
            preload="metadata"
            src={file(doc.edit.output.videoKey)}
            style={{ aspectRatio: doc.aspectRatio.replace(':', ' / ') }}
          />
          <div className="edit-output-links">
            <a
              className="download-file"
              href={file(doc.edit.output.videoKey)}
              download
            >
              <Download size={16} />
              <span>下载剪辑成片</span>
              <small>MP4</small>
            </a>
            <a
              className="download-file"
              href={file(doc.edit.output.subtitlesKey)}
              download
            >
              <Download size={16} />
              <span>下载更新后的字幕</span>
              <small>SRT</small>
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
