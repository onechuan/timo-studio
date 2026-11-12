import {
  Clapperboard,
  FileText,
  Film,
  MonitorPlay,
  Volume2,
  Paintbrush,
  ScanEye,
  Scissors,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Production, StoryboardPlan } from '@timotv/contracts';
import type { StudioTab } from './SceneEditor.js';
const tabs = [
  { id: 'storyboard', label: '分镜', Icon: FileText },
  { id: 'script', label: '口播', Icon: Volume2 },
  { id: 'export', label: '导出', Icon: Film },
  { id: 'edit', label: '剪辑', Icon: Scissors },
  { id: 'review', label: '审片', Icon: ScanEye },
] as const;
const clock = (value?: number) => {
  if (value === undefined) return '—';
  const seconds = Math.round(value / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
export function FilmStage({
  doc,
  board,
  selected,
  onSelect,
  tab,
  onTab,
  file,
  locked,
  illustrate,
  children,
  seekTime,
}: {
  doc?: Production | null;
  board?: StoryboardPlan;
  selected: number;
  onSelect: (index: number) => void;
  tab: StudioTab;
  onTab: (tab: StudioTab) => void;
  file: (key: string) => string;
  locked: boolean;
  illustrate: (restart?: boolean, sceneId?: string) => void;
  children: React.ReactNode;
  seekTime?: number;
}) {
  const preview = useRef<HTMLIFrameElement>(null);
  const seek = () => {
    if (seekTime !== undefined)
      preview.current?.contentWindow?.postMessage(
        { type: 'timotv:seek', timeMs: seekTime },
        '*',
      );
  };
  useEffect(seek, [seekTime, tab]);
  const pages = board?.scenes ?? doc?.scenes ?? [];
  const scene = pages[selected];
  const ratio = doc?.aspectRatio ?? '16:9';
  const canDraw =
    !!doc?.artifacts.audio &&
    !!doc.durationMs &&
    doc.scenes.length > 0 &&
    ['ready', 'failed'].includes(doc.stage);
  const drawn = doc?.scenes.filter((s) => !!s.artwork).length ?? 0;
  const duration = doc?.durationState;
  const targetMs = duration?.targetMs ?? (doc?.brief.durationSec ?? 60) * 1000;
  const minMs = duration?.minMs ?? Math.round(targetMs * 0.9);
  const maxMs = duration?.maxMs ?? Math.round(targetMs * 1.1);
  return (
    <section className="film-stage" aria-label="画面工作台">
      {tab !== 'edit' && (
        <div className="stage-bar">
          <span>
            <MonitorPlay size={15} />
            画面工作台
          </span>
          <small>
            {ratio} <span className="stage-divider">/</span>{' '}
            {doc?.durationMs
              ? `${(doc.durationMs / 1000).toFixed(1)} 秒`
              : `目标 ${doc?.brief.durationSec ?? 60} 秒`}
          </small>
        </div>
      )}
      {doc && tab !== 'edit' && (
        <div className="duration-status" aria-live="polite">
          <span>
            <small>目标</small>
            <strong>{clock(targetMs)}</strong>
          </span>
          <span>
            <small>允许区间</small>
            <strong>
              {clock(minMs)}–{clock(maxMs)}
            </strong>
          </span>
          {duration?.estimatedMs !== undefined && (
            <span>
              <small>文本估算</small>
              <strong>{clock(duration.estimatedMs)}</strong>
            </span>
          )}
          {(duration?.measuredMs ?? doc.durationMs) !== undefined && (
            <span>
              <small>真实配音</small>
              <strong>{clock(duration?.measuredMs ?? doc.durationMs)}</strong>
            </span>
          )}
          {duration?.status === 'correcting' && (
            <em>正在进行第 {duration.correctionRound}/2 轮时长校正</em>
          )}
          {duration?.status === 'needs-input' && (
            <em>真实时长超出目标区间，等待你的决定</em>
          )}
        </div>
      )}
      {tab !== 'export' && tab !== 'review' && tab !== 'edit' && (
        <>
          {canDraw && (
            <div className="artwork-actions">
              <div>
                <strong>
                  {drawn ? `${drawn} 页画面已绘制` : '让分镜变成画面'}
                </strong>
                <small>沿用现有口播与配音，按每页内容重新设计画面</small>
              </div>
              <button
                className="secondary"
                disabled={locked}
                onClick={() => illustrate()}
              >
                <Paintbrush size={14} />
                {doc?.failedAction === 'illustrate'
                  ? '继续绘制画面'
                  : drawn
                    ? '重新绘制画面'
                    : '绘制画面'}
              </button>
              {doc?.stage === 'ready' && doc.scenes[selected]?.artwork && (
                <button
                  className="text-button"
                  disabled={locked}
                  onClick={() => illustrate(false, doc.scenes[selected].id)}
                >
                  重绘本页
                </button>
              )}
              {doc?.stage === 'failed' &&
                doc.failedAction === 'illustrate' &&
                drawn > 0 && (
                  <button
                    className="text-button"
                    disabled={locked}
                    onClick={() => illustrate(true)}
                  >
                    重新绘制全部
                  </button>
                )}
            </div>
          )}
          <div
            className={
              'preview-well' + (ratio === '9:16' ? ' is-portrait' : '')
            }
          >
            {doc?.artifacts.preview ? (
              <iframe
                ref={preview}
                onLoad={seek}
                title="视频预览"
                style={{
                  aspectRatio: ratio.replace(':', ' / '),
                  maxWidth: ratio === '9:16' ? '300px' : undefined,
                }}
                sandbox="allow-scripts"
                allow="autoplay; fullscreen"
                allowFullScreen
                src={file(doc.artifacts.preview)}
              />
            ) : (
              <div
                className={
                  'preview-placeholder' + (scene ? ' has-outline' : '')
                }
                style={{
                  aspectRatio: ratio.replace(':', ' / '),
                  maxWidth: ratio === '9:16' ? '250px' : undefined,
                }}
              >
                {scene ? (
                  <>
                    <div className="outline-kicker">
                      分镜概览 <span>· 尚未生成视频</span>
                    </div>
                    <span className="outline-number">
                      {String(selected + 1).padStart(2, '0')}
                    </span>
                    <h2>{scene.title}</h2>
                    <p>{scene.visual}</p>
                    <div className="outline-beats">
                      {scene.beats.slice(0, 4).map((beat, i) => (
                        <span key={i}>{beat}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="empty-viewfinder">
                      <Clapperboard size={30} strokeWidth={1.25} />
                    </div>
                    <h2>画面，从一个想法开始</h2>
                    <p>
                      规划分镜，确认你的故事。
                      <br />
                      导演会把它变成有声音的画面。
                    </p>
                    <small>等待分镜规划</small>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="preview-caption">
            <span className="dot" />
            {doc?.artifacts.preview
              ? '点击画面播放 · 空格暂停 · ← → 快进退'
              : scene
                ? '当前为分镜提纲，制作完成后显示视频预览'
                : '预览区'}
            <small>
              {pages.length
                ? `${String(selected + 1).padStart(2, '0')} / ${String(pages.length).padStart(2, '0')}`
                : '— / —'}
            </small>
          </div>
          <nav className="page-strip" aria-label="分镜列表">
            {pages.length
              ? pages.map((page, i) => (
                  <button
                    className={
                      'page-tile' + (selected === i ? ' selected' : '')
                    }
                    aria-pressed={selected === i}
                    aria-label={`分镜 ${i + 1}：${page.title}`}
                    key={page.id}
                    onClick={() => onSelect(i)}
                  >
                    <span className="tile-number">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <strong>{page.title}</strong>
                    <small>
                      {doc?.scenes[i]?.artwork
                        ? '画面已绘制'
                        : doc?.scenes[i]?.cues[0]?.audioKey
                          ? '已配音 · 待绘图'
                          : '分镜提纲'}
                    </small>
                  </button>
                ))
              : [1, 2, 3].map((i) => (
                  <div className="page-tile queued" key={i}>
                    <span className="tile-number">
                      {String(i).padStart(2, '0')}
                    </span>
                    <span className="tile-placeholder" />
                    <small>等待规划</small>
                  </div>
                ))}
          </nav>
        </>
      )}
      <div className="editor-tabs" role="tablist" aria-label="制作内容">
        {tabs.map(({ id, label, Icon }) => (
          <button
            id={'studio-tab-' + id}
            role="tab"
            aria-selected={tab === id}
            aria-controls="studio-tabpanel"
            key={id}
            onClick={() => onTab(id)}
          >
            <Icon size={15} />
            {label}
            {id === 'storyboard' && pages.length > 0 && (
              <small>{pages.length}</small>
            )}
          </button>
        ))}
      </div>
      <div
        className="editor-content"
        id="studio-tabpanel"
        role="tabpanel"
        aria-labelledby={'studio-tab-' + tab}
      >
        {children}
      </div>
    </section>
  );
}
