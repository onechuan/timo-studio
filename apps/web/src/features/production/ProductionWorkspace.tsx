import { useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clapperboard,
  Download,
  Loader2,
  MessageSquare,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { needsDurationDecision, type Production } from '@timotv/contracts';
import { BriefFields } from './BriefFields.js';
import { FilmStage } from './FilmStage.js';
import { SceneEditor, type StudioTab } from './SceneEditor.js';
import { useProduction } from './useProduction.js';
import { ReviewPanel } from './ReviewPanel.js';
import '../../styles/production.css';
const labels = {
  draft: '待规划',
  planning: '正在规划分镜',
  approval: '请审批分镜',
  scripting: '正在生成口播',
  narrating: '正在配音',
  illustrating: '正在逐页绘制画面',
  composing: '正在合成预览',
  ready: '预览已就绪',
  rendering: '正在导出视频',
  failed: '制作失败',
};
function ParityProgress({ doc }: { doc: Production }) {
  if (doc.videoPipeline !== 'frametell-parity') return null;
  const kit = doc.visual?.filmKit;
  const kitDone =
    kit?.components.filter((component) =>
      ['passed', 'dropped', 'failed'].includes(component.status),
    ).length ?? 0;
  const pagesDone = doc.scenes.filter((scene) =>
    ['passed', 'accepted', 'unreviewed'].includes(scene.review?.status ?? ''),
  ).length;
  const whole = doc.visual?.wholeFilmReview;
  const working = (active: boolean) =>
    active ? <Loader2 className="spinning" size={13} /> : <Check size={12} />;
  const kitActive =
    !!kit && ['planned', 'generating', 'checking'].includes(kit.status);
  const pageActive = doc.stage === 'illustrating' && !whole;
  const wholeActive =
    !!whole && ['checking', 'repairing'].includes(whole.status);
  return (
    <section className="parity-progress" aria-label="帧言品质制作进度">
      <div className={kitActive ? 'current' : 'done'}>
        <span>{working(kitActive)}</span>
        <p>
          <strong>
            {kitActive ? '正在建立影片视觉组件' : '影片视觉组件已就绪'}
          </strong>
          <small>
            {kit?.components.length
              ? `${kitDone}/${kit.components.length} 个组件已检查`
              : '本片无需跨页复用组件'}
          </small>
        </p>
      </div>
      <div className={pageActive ? 'current' : pagesDone ? 'done' : ''}>
        <span>{working(pageActive)}</span>
        <p>
          <strong>
            {pageActive ? '正在逐页生成并检查画面' : '逐页画面检查'}
          </strong>
          <small>
            {pagesDone}/{doc.scenes.length} 页已通过
          </small>
        </p>
      </div>
      <div
        className={
          wholeActive
            ? 'current'
            : whole &&
                ['passed', 'accepted', 'unreviewed'].includes(whole.status)
              ? 'done'
              : ''
        }
      >
        <span>{working(wholeActive)}</span>
        <p>
          <strong>
            {wholeActive
              ? '正在进行全片一致性检查'
              : whole
                ? '全片一致性检查已完成'
                : '等待全片一致性检查'}
          </strong>
          <small>
            {whole
              ? `第 ${whole.round + 1} 轮 · ${whole.issues.length} 个待处理问题`
              : '页面完成后自动开始'}
          </small>
        </p>
      </div>
    </section>
  );
}
function ProductionSteps({ doc }: { doc?: Production | null }) {
  const hasScript = !!doc?.scenes.length;
  const hasVoice =
    hasScript && doc!.scenes.every((s) => s.cues.every((c) => !!c.audioKey));
  const steps = [
    {
      name: '规划分镜',
      detail: '梳理故事与画面',
      done: !!doc?.storyboard,
      active: doc?.stage === 'planning',
    },
    {
      name: '确认故事',
      detail: '由你决定，再继续',
      done:
        hasScript ||
        [
          'scripting',
          'narrating',
          'illustrating',
          'composing',
          'ready',
          'rendering',
        ].includes(doc?.stage ?? ''),
      active: doc?.stage === 'approval',
    },
    {
      name: '口播与配音',
      detail: '逐句撰写，生成声音',
      done: hasVoice,
      active: ['scripting', 'narrating'].includes(doc?.stage ?? ''),
    },
    {
      name: '逐页绘图与合成',
      detail: '根据讲解绘制画面，合成预览',
      done: !!doc?.artifacts.preview,
      active: ['illustrating', 'composing', 'rendering'].includes(
        doc?.stage ?? '',
      ),
    },
  ];
  return (
    <ol className="director-steps">
      {steps.map((s, i) => (
        <li
          className={s.done ? 'done' : s.active ? 'current' : ''}
          key={s.name}
        >
          <span className="step-icon">
            {s.done ? (
              <Check size={12} />
            ) : s.active && doc?.jobId ? (
              <Loader2 className="spinning" size={13} />
            ) : s.active ? (
              <Circle size={10} fill="currentColor" />
            ) : (
              <span>{i + 1}</span>
            )}
          </span>
          <div>
            <strong>{s.name}</strong>
            <small>{s.detail}</small>
          </div>
          {s.active && (
            <span className="step-state">
              {doc?.jobId ? '进行中' : '待确认'}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
type RecoveryAction =
  | 'plan'
  | 'approve'
  | 'produce'
  | 'illustrate'
  | 'export'
  | 'review'
  | 'accept-duration';
function ProductionFailureCard({
  doc,
  locked,
  onAction,
  onEdit,
}: {
  doc: Production;
  locked: boolean;
  onAction: (action: RecoveryAction, sceneId?: string) => void;
  onEdit: (target: 'script' | 'brief') => void;
}) {
  const failure = doc.failure!;
  const durationDecision = needsDurationDecision(doc);
  const measuredSeconds = Math.round(
    (doc.durationMs ?? doc.durationState?.measuredMs ?? 0) / 1000,
  );
  const sceneId = failure.context?.sceneId;
  const action: RecoveryAction = durationDecision
    ? 'accept-duration'
    : failure.phase === 'reviewing' && sceneId
      ? 'review'
      : failure.phase === 'rendering'
        ? 'export'
        : failure.phase === 'illustrating'
          ? 'illustrate'
          : failure.phase === 'planning'
            ? 'plan'
            : doc.scenes.length
              ? 'produce'
              : 'approve';
  const label = durationDecision
    ? `按 ${measuredSeconds} 秒继续制作`
    : failure.phase === 'reviewing' && sceneId
      ? '重试当前页审片'
      : failure.retryable
        ? '重试失败步骤'
        : '修正内容后重新开始';
  return (
    <section className="production-failure-card" role="alert">
      <strong>
        {durationDecision
          ? `当前配音 ${measuredSeconds} 秒，目标 ${doc.brief.durationSec} 秒。配音和字幕已保留，请选择下一步。`
          : failure.publicMessage}
      </strong>
      {sceneId && <p>受影响分镜：{sceneId}</p>}
      <button
        className="secondary"
        disabled={locked}
        onClick={() => onAction(action, sceneId)}
      >
        <RotateCcw size={14} />
        {label}
      </button>
      {durationDecision && (
        <>
          <button
            className="secondary"
            disabled={locked}
            onClick={() => onEdit('script')}
          >
            补充或精简口播
          </button>
          <button
            className="secondary"
            disabled={locked}
            onClick={() => onEdit('brief')}
          >
            修改目标时长
          </button>
          <p>
            编辑口播后可重新配音；仅修改目标时长会保留现有配音，保存后点击继续制作。补充资料后需重新规划分镜。
          </p>
        </>
      )}
      <details>
        <summary>技术信息</summary>
        <dl>
          <div>
            <dt>诊断 ID</dt>
            <dd>{failure.diagnosticId}</dd>
          </div>
          <div>
            <dt>错误码</dt>
            <dd>{failure.code}</dd>
          </div>
          <div>
            <dt>阶段</dt>
            <dd>{failure.phase}</dd>
          </div>
        </dl>
      </details>
    </section>
  );
}
export function ProductionWorkspace({ id }: { id: string }) {
  const p = useProduction(id);
  const { doc, caps, brief, board, script, locked, error } = p;
  const [feedback, setFeedback] = useState('');
  const [briefOpen, setBriefOpen] = useState(false);
  const briefEditor = useRef<HTMLDetailsElement>(null);
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<StudioTab>('storyboard');
  const [seekTime, setSeekTime] = useState<number>();
  const [pane, setPane] = useState<'director' | 'stage'>('director');
  const pages = board?.scenes ?? doc?.scenes ?? [];
  const selectedIndex = Math.max(0, Math.min(selected, pages.length - 1));
  const attentionIndex =
    doc?.scenes.findIndex(
      (s) =>
        s.review && ['needs_attention', 'failed'].includes(s.review.status),
    ) ?? -1;
  const showStage = () => {
    setPane('stage');
    setTab('storyboard');
  };
  const exportVideo = () => {
    setPane('stage');
    setTab('export');
    void p.action('export');
  };
  return (
    <section className="production" aria-label="视频制作工作台">
      <div className="production-toolbar">
        <div className="production-caption">
          <Clapperboard size={15} />
          <span>创作工作台</span>
          <span className="toolbar-separator">/</span>
          <span className="muted">先讲好故事，再让画面发生</span>
        </div>
        {attentionIndex >= 0 && (
          <button
            className="text-button"
            onClick={() => {
              setPane('stage');
              setTab('review');
              setSelected(attentionIndex);
            }}
          >
            查看待处理审片
          </button>
        )}
        {doc?.artifacts.video && !locked ? (
          <a
            className="download-mp4"
            href={p.file(doc.artifacts.video)}
            download="TimoTV.mp4"
          >
            <Download size={15} />
            下载 MP4
          </a>
        ) : (
          <button
            disabled={
              locked ||
              doc?.stage !== 'ready' ||
              doc.scenes.some(
                (s) =>
                  s.review &&
                  [
                    'needs_attention',
                    'failed',
                    'checking',
                    'repairing',
                  ].includes(s.review.status),
              )
            }
            onClick={exportVideo}
          >
            <Download size={15} />
            {doc?.stage === 'rendering' ? '正在导出…' : '导出 MP4'}
          </button>
        )}
      </div>
      <div className="mobile-pane-switch" aria-label="工作台区域">
        <button
          aria-pressed={pane === 'director'}
          onClick={() => setPane('director')}
        >
          <MessageSquare size={15} />
          导演流程
        </button>
        <button
          aria-pressed={pane === 'stage'}
          onClick={() => setPane('stage')}
        >
          <Clapperboard size={15} />
          画面工作台
        </button>
      </div>
      <div className={'production-layout show-' + pane}>
        <aside className="director-pane" aria-label="导演流程">
          <div className="director-heading">
            <span className="director-avatar">
              <Sparkles size={17} />
            </span>
            <div>
              <h2>导演</h2>
              <small>和你一起，把想法讲清楚</small>
            </div>
            <span
              className={
                'director-availability' + (doc?.jobId ? ' working' : '')
              }
            >
              {doc?.jobId ? (
                <Loader2 className="spinning" size={12} />
              ) : (
                <span className="dot" />
              )}
              {doc?.jobId ? '制作中' : '就绪'}
            </span>
          </div>
          <div className="director-content">
            {doc === undefined ? (
              error ? (
                <>
                  <div className="error" role="alert">
                    {error}
                  </div>
                  <button className="secondary" onClick={p.reload}>
                    重新加载工作台
                  </button>
                </>
              ) : (
                <p role="status">正在读取制作进度…</p>
              )
            ) : (
              <>
                <div className="brief-message">
                  <div className="message-label">
                    你的创作想法 <span>YOU</span>
                  </div>
                  <p>{doc?.brief.topic || '根据提供的资料，创作一段视频'}</p>
                  <div className="brief-meta">
                    <span>{brief.durationSec} 秒</span>
                    <span>
                      {brief.language === 'zh' ? '中文口播' : 'English'}
                    </span>
                    <span>
                      {
                        {
                          warm: '温暖',
                          chalk: '黑板',
                          tech: '科技',
                          brand: '品牌手绘',
                        }[brief.style]
                      }
                    </span>
                  </div>
                </div>
                <details
                  className="brief-edit"
                  ref={briefEditor}
                  open={briefOpen || !doc || doc.stage === 'draft'}
                >
                  <summary>
                    主题与资料 <ChevronRight size={14} />
                  </summary>
                  <fieldset disabled={locked}>
                    <BriefFields value={brief} onChange={p.setBrief} />
                    <button
                      className="secondary"
                      disabled={
                        locked ||
                        !(brief.topic.trim() || brief.materials.trim())
                      }
                      onClick={() => void p.saveBrief()}
                    >
                      保存主题与资料
                    </button>
                  </fieldset>
                </details>
                <div className="director-message">
                  <div className="message-label">
                    <Sparkles size={12} />
                    TIMO 导演
                  </div>
                  <p>
                    {doc?.stage === 'draft'
                      ? '我会先把你的想法拆成分镜。你确认后，我再撰写口播、生成配音并合成视频。'
                      : doc?.stage === 'approval'
                        ? '分镜已经准备好了。看看每个画面要讲什么，你可以修改后再批准制作。'
                        : doc?.stage === 'ready'
                          ? '作品已准备好。你可以播放预览、微调口播，或导出视频。'
                          : doc && needsDurationDecision(doc)
                            ? '配音已经完成，时长与目标有差距。你可以接受当前时长，或修改口播及目标时长。'
                            : doc?.stage === 'failed'
                              ? '这一步没有完成。查看下方原因后，可以从失败的步骤重新开始。'
                              : '制作过程会显示在这里，你可以随时查看当前进度。'}
                  </p>
                </div>
                <p
                  className={
                    'production-status status-' + (doc?.stage ?? 'draft')
                  }
                  role="status"
                >
                  {doc
                    ? `${needsDurationDecision(doc) ? '等待确认时长' : labels[doc.stage]} · 修订 ${doc.revision}`
                    : '填写主题，开始制作'}
                </p>
                {doc && <ParityProgress doc={doc} />}
                <ProductionSteps doc={doc} />
                {board && doc?.stage === 'approval' && (
                  <div className="approval-card">
                    <div className="approval-kicker">
                      <CheckCircle2 size={15} />
                      分镜等待你确认
                    </div>
                    <h3>{board.title}</h3>
                    <p>{board.summary}</p>
                    <button className="text-button" onClick={showStage}>
                      查看并编辑 {board.scenes.length} 个分镜{' '}
                      <ArrowRight size={14} />
                    </button>
                    <button
                      disabled={locked || p.boardDirty || p.briefDirty}
                      onClick={() => void p.action('approve')}
                    >
                      <Check size={15} />
                      批准分镜并自动制作
                    </button>
                    <small>
                      {p.boardDirty
                        ? '分镜有未保存修改，请先在右侧保存。'
                        : p.briefDirty
                          ? '主题设置有未保存修改，请先保存。'
                          : '确认后，自动生成口播、配音和视频预览。'}
                    </small>
                  </div>
                )}
                {error && (
                  <div className="error" role="alert">
                    {error}
                  </div>
                )}
                {doc?.failure && (
                  <ProductionFailureCard
                    doc={doc}
                    locked={locked || p.briefDirty}
                    onEdit={(target) => {
                      if (target === 'script') {
                        setTab('script');
                        setPane('stage');
                      } else {
                        setBriefOpen(true);
                        briefEditor.current
                          ?.querySelectorAll('details')
                          .forEach((detail) => {
                            detail.open = true;
                          });
                        briefEditor.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }
                    }}
                    onAction={(action, sceneId) =>
                      void p.action(action, undefined, undefined, sceneId)
                    }
                  />
                )}
                {!doc?.failure && doc?.error && (
                  <div className="error" role="alert">
                    {doc.error}
                  </div>
                )}
                {doc?.stage === 'failed' && !doc.failure && (
                  <button
                    className="secondary retry-action"
                    disabled={locked}
                    onClick={() =>
                      void p.action(
                        doc.failedAction === 'plan'
                          ? 'plan'
                          : doc.failedAction === 'illustrate'
                            ? 'illustrate'
                            : doc.failedAction === 'export'
                              ? 'export'
                              : doc.scenes.length
                                ? 'produce'
                                : 'approve',
                      )
                    }
                  >
                    <RotateCcw size={14} />
                    重试制作
                  </button>
                )}
                {doc?.stage === 'narrating' && !doc.jobId && !doc.failure && (
                  <button
                    disabled={locked || p.briefDirty}
                    onClick={() => void p.action('produce')}
                  >
                    继续制作
                  </button>
                )}
                {doc && (
                  <div className="director-composer">
                    <label>
                      重新规划意见（可选）
                      <textarea
                        rows={2}
                        value={feedback}
                        disabled={locked}
                        onChange={(e) => setFeedback(e.target.value)}
                        maxLength={4000}
                        placeholder="例如：开头更有悬念，少一些专业术语…"
                      />
                    </label>
                    <div>
                      <small>
                        {p.briefDirty
                          ? '主题设置已修改，请先保存'
                          : '先规划，再确认。每一步由你掌握。'}
                      </small>
                      <button
                        disabled={locked || p.briefDirty}
                        onClick={() => void p.action('plan', feedback)}
                      >
                        {locked ? (
                          <Loader2 size={14} className="spinning" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        规划分镜
                      </button>
                    </div>
                  </div>
                )}
                {!!doc?.events.length && (
                  <details className="production-log">
                    <summary>
                      制作记录 <span>{doc.events.length}</span>
                    </summary>
                    {doc.events.map((e, i) => (
                      <div key={i}>
                        <time>
                          {new Date(e.at).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>
                        <p>{e.message}</p>
                      </div>
                    ))}
                  </details>
                )}
              </>
            )}
            {caps && (
              <details
                className="service-details"
                open={!caps.model.configured}
              >
                <summary>
                  <span
                    className={
                      'dot ' + (!caps.model.configured ? 'attention' : '')
                    }
                  />
                  模型与配音服务 <ChevronRight size={14} />
                </summary>
                <div className="service-row">
                  <span>导演模型</span>
                  <strong>{caps.model.model || '未设置'}</strong>
                </div>
                <div className="service-row">
                  <span>火山 TTS</span>
                  <strong>
                    {caps.voices.volcengine ? '已配置' : '待配置'}
                  </strong>
                </div>
                {!caps.model.configured && (
                  <p className="config-guidance">
                    尚未配置导演模型。请在服务配置页填写模型、API 地址与 Key。
                    <br />
                    <a href="#settings" className="config-settings-link">
                      打开服务配置 →
                    </a>
                  </p>
                )}
                {!caps.voices.volcengine && (
                  <p className="config-guidance">
                    火山配音尚未配置，请在服务配置页保存火山 TTS Key
                    并选择音色。
                    <br />
                    <a href="#settings" className="config-settings-link">
                      配置配音服务 →
                    </a>
                    <br />
                    macOS 本地语音{caps.voices.local ? '可用' : '不可用'}
                    ，可在创作设置中切换。
                  </p>
                )}
              </details>
            )}
          </div>
        </aside>
        <FilmStage
          seekTime={seekTime}
          doc={doc}
          board={board}
          selected={selectedIndex}
          onSelect={setSelected}
          tab={tab}
          onTab={setTab}
          file={p.file}
          locked={
            locked ||
            p.briefDirty ||
            p.boardDirty ||
            JSON.stringify(script) !== JSON.stringify(doc?.scenes ?? [])
          }
          illustrate={(restart, sceneId) =>
            void p.action('illustrate', undefined, restart, sceneId)
          }
        >
          {doc && tab === 'review' ? (
            <ReviewPanel
              doc={doc}
              selected={selectedIndex}
              onSelect={setSelected}
              file={p.file}
              locked={
                locked ||
                p.briefDirty ||
                p.boardDirty ||
                JSON.stringify(script) !== JSON.stringify(doc.scenes)
              }
              error={error}
              onAction={(action, sceneId) =>
                void p.action(action, undefined, undefined, sceneId)
              }
              onSeek={(ms) => {
                setSeekTime(ms);
                setTab('storyboard');
              }}
            />
          ) : doc ? (
            <SceneEditor
              doc={doc}
              board={board}
              onBoard={p.setBoard}
              script={script}
              onScript={p.setScript}
              selected={selectedIndex}
              tab={tab}
              locked={locked}
              saveBoard={() => void p.saveBoard()}
              saveScript={() => void p.saveScript()}
              file={p.file}
            />
          ) : (
            <div className="editor-empty">
              <p>先在导演区保存主题，然后规划分镜。</p>
            </div>
          )}
        </FilmStage>
      </div>
    </section>
  );
}
