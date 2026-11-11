import type { Production } from '@timotv/contracts';
import { sceneReviewLabels } from '@timotv/contracts';

export function ReviewPanel({
  doc,
  selected,
  onSelect,
  file,
  locked,
  onAction,
  onSeek,
  error,
}: {
  doc: Production;
  selected: number;
  onSelect: (index: number) => void;
  file: (key: string) => string;
  locked: boolean;
  onAction: (action: 'review' | 'repair' | 'accept', sceneId: string) => void;
  onSeek: (ms: number) => void;
  error?: string;
}) {
  const scene = doc.scenes[selected],
    review = scene?.review;
  if (!scene)
    return <div className="editor-empty">绘制画面后，可在这里检查关键帧。</div>;
  return (
    <div className="review-panel">
      <div className="review-heading">
        <label>
          审片分镜
          <select
            aria-label="审片分镜"
            value={selected}
            onChange={(e) => onSelect(Number(e.target.value))}
          >
            {doc.scenes.map((s, i) => (
              <option key={s.id} value={i}>
                第 {i + 1} 页 · {s.title}
              </option>
            ))}
          </select>
        </label>
        <strong role="status">
          {review
            ? sceneReviewLabels[review.status]
            : scene.artwork
              ? '等待审片'
              : '等待绘图'}
        </strong>
      </div>
      {!review || review.mode === 'layout' ? (
        <p className="review-note">
          {review?.status === 'unreviewed'
            ? '仅完成布局检查，未进行视觉审片。'
            : '尚未完成视觉审片。'}{' '}
          <a href="#settings">配置视觉审片模型</a>
        </p>
      ) : (
        <p className="review-note">
          已检查 {review.frames.length} 张关键帧 · 自动修正 {review.round}/2
          轮。关键帧检查不代表逐帧检查。
        </p>
      )}
      {(error || review?.error) && (
        <p className="error" role="alert">
          {error || review?.error}
        </p>
      )}
      {!!review?.omittedCueIds.length && (
        <p className="review-note">
          受采样上限影响，{review.omittedCueIds.length}{' '}
          句口播没有单独截图，请人工复核。
        </p>
      )}
      <div className="review-actions">
        <button
          className="secondary"
          disabled={locked || !scene.artwork}
          onClick={() => onAction('review', scene.id)}
        >
          重试本页审片
        </button>
        {!!review?.issues.length && (
          <button
            className="secondary"
            disabled={locked}
            onClick={() => onAction('repair', scene.id)}
          >
            仅修复本页
          </button>
        )}
        {review?.status === 'needs_attention' && (
          <button
            disabled={
              locked ||
              !doc.artifacts.preview ||
              review.issues.some(
                (i) => i.kind === 'runtime' && i.severity === 'error',
              )
            }
            onClick={() => onAction('accept', scene.id)}
          >
            接受当前页
          </button>
        )}
      </div>
      {!!review?.issues.length && (
        <ol className="review-issues">
          {review.issues.map((issue, i) => (
            <li key={i}>
              <button
                className="text-button"
                disabled={!doc.artifacts.preview}
                onClick={() => onSeek(issue.atMs)}
              >
                {(issue.atMs / 1000).toFixed(1)} 秒
              </button>
              <strong>{issue.what}</strong>
              <p>{issue.fix}</p>
              {issue.kind === 'layout' && issue.severity === 'warning' && (
                <small>布局建议，需结合画面判断</small>
              )}
            </li>
          ))}
        </ol>
      )}
      <div className="review-frames">
        {review?.frames.map((f) => (
          <button
            className="review-frame"
            key={f.key}
            onClick={() => onSeek(f.timeMs)}
            disabled={!doc.artifacts.preview}
            title="跳到预览中的这一帧"
          >
            <img
              src={file(f.key)}
              alt={`第 ${selected + 1} 页 ${(f.timeMs / 1000).toFixed(1)} 秒关键帧`}
              loading="lazy"
            />
            <span>{(f.timeMs / 1000).toFixed(1)} 秒</span>
          </button>
        ))}
      </div>
    </div>
  );
}
