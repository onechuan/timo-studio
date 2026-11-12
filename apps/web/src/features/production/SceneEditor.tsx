import { FileText, Save, Volume2, Download, Film } from 'lucide-react';
import type { FilmScene, Production, StoryboardPlan } from '@timotv/contracts';
import { sceneLayoutLabels, type SceneLayout } from '@timotv/contracts';
export type StudioTab = 'storyboard' | 'script' | 'export' | 'review' | 'edit';
export function SceneEditor({
  doc,
  board,
  onBoard,
  script,
  onScript,
  selected,
  tab,
  locked,
  saveBoard,
  saveScript,
  file,
}: {
  doc: Production;
  board?: StoryboardPlan;
  onBoard: (board: StoryboardPlan) => void;
  script: FilmScene[];
  onScript: (script: FilmScene[]) => void;
  selected: number;
  tab: StudioTab;
  locked: boolean;
  saveBoard: () => void;
  saveScript: () => void;
  file: (key: string) => string;
}) {
  const scene = board?.scenes[selected];
  const spoken = script[selected];
  if (tab === 'export') {
    const output = doc.edit?.output;
    const videoKey = output?.videoKey ?? doc.artifacts.video;
    const files = [
      { id: 'audio', key: doc.artifacts.audio, name: '下载配音', ext: 'WAV' },
      {
        id: 'subtitles',
        key: output?.subtitlesKey ?? doc.artifacts.subtitles,
        name: output ? '下载剪辑字幕' : '下载字幕',
        ext: 'SRT',
      },
      {
        id: 'video',
        key: videoKey,
        name: output ? '下载剪辑成片' : '下载视频',
        ext: 'MP4',
      },
    ];
    return (
      <div className="export-pane">
        <div className="editor-intro">
          <Film size={18} />
          <div>
            <h3>
              {output
                ? '剪辑成片已导出'
                : doc.artifacts.video
                  ? 'MP4 已导出'
                  : '交付你的作品'}
            </h3>
            <p role="status">
              {doc.stage === 'rendering'
                ? '正在生成视频，完成后可在这里播放和下载。'
                : output
                  ? '剪辑后的成片与字幕已准备好，可以播放检查或下载。'
                  : doc.artifacts.video
                    ? '成片已准备好，可以播放检查或下载到本机。'
                    : '完成制作后，配音、字幕和视频会出现在这里。'}
            </p>
          </div>
        </div>
        {videoKey && (
          <div className="export-player">
            <video
              aria-label={output ? '剪辑后的 MP4' : '已导出 MP4'}
              controls
              playsInline
              preload="metadata"
              src={file(videoKey)}
              style={{ aspectRatio: doc.aspectRatio.replace(':', ' / ') }}
            />
          </div>
        )}
        <div className="export-files">
          {files.map(({ id, key, name, ext }) =>
            key ? (
              <a className="download-file" key={id} href={file(key)} download>
                <Download size={17} />
                <span>{name}</span>
                <small>{ext}</small>
              </a>
            ) : (
              <div className="download-file unavailable" key={id}>
                <Download size={17} />
                <span>{name.replace('下载', '')}</span>
                <small>尚未生成</small>
              </div>
            ),
          )}
        </div>
      </div>
    );
  }
  if (tab === 'script')
    return spoken ? (
      <div className="scene-editor">
        <div className="editor-intro">
          <Volume2 size={18} />
          <div>
            <h3>{spoken.title}</h3>
            <p>逐句修改口播，保存后会按新文本重新配音。</p>
          </div>
        </div>
        <fieldset disabled={locked}>
          {spoken.cues.map((cue, i) => (
            <label className="cue-field" key={cue.id}>
              <span>
                口播 {String(i + 1).padStart(2, '0')}
                <small>
                  {cue.startMs !== undefined
                    ? `${(cue.startMs / 1000).toFixed(1)}s — ${(cue.endMs! / 1000).toFixed(1)}s`
                    : '等待配音'}
                </small>
              </span>
              <textarea
                aria-label={'口播 ' + cue.id}
                maxLength={500}
                value={cue.text}
                onChange={(e) =>
                  onScript(
                    script.map((s) =>
                      s.id === spoken.id
                        ? {
                            ...s,
                            cues: s.cues.map((c) =>
                              c.id === cue.id
                                ? { ...c, text: e.target.value }
                                : c,
                            ),
                          }
                        : s,
                    ),
                  )
                }
              />
            </label>
          ))}
        </fieldset>
        <button className="secondary" disabled={locked} onClick={saveScript}>
          <Volume2 size={15} />
          保存口播并重新配音
        </button>
      </div>
    ) : (
      <div className="editor-empty">
        <FileText size={22} />
        <p>确认分镜后，导演会为每个画面撰写口播。</p>
      </div>
    );
  if (!scene || !board)
    return (
      <div className="editor-empty">
        <FileText size={22} />
        <p>分镜规划完成后，在这里查看和调整每一个画面。</p>
      </div>
    );
  return (
    <div className="scene-editor">
      <div className="editor-intro">
        <FileText size={18} />
        <div>
          <h3>分镜 {String(selected + 1).padStart(2, '0')}</h3>
          <p>
            {doc.stage === 'approval'
              ? '调整讲述要点和画面，再交给导演继续制作。'
              : '此处是本次制作采用的分镜提纲。'}
          </p>
        </div>
      </div>
      <fieldset disabled={locked || doc.stage !== 'approval'}>
        <label>
          画面构图
          <select
            value={scene.layout ?? ''}
            onChange={(e) =>
              onBoard({
                ...board,
                scenes: board.scenes.map((s, i) =>
                  i === selected
                    ? {
                        ...s,
                        layout: (e.target.value || undefined) as
                          SceneLayout | undefined,
                      }
                    : s,
                ),
              })
            }
          >
            <option value="">按内容自动设计</option>
            {Object.entries(sceneLayoutLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {(['title', 'say', 'visual', 'beats'] as const).map((key) => (
          <label key={key}>
            {
              {
                title: '标题',
                say: '讲述要点',
                visual: '画面描述',
                beats: '画面节奏（每行一条）',
              }[key]
            }
            <textarea
              rows={key === 'title' ? 1 : 2}
              maxLength={key === 'title' ? 100 : key === 'beats' ? 10000 : 2000}
              value={key === 'beats' ? scene.beats.join('\n') : scene[key]}
              onChange={(e) =>
                onBoard({
                  ...board,
                  scenes: board.scenes.map((s, i) =>
                    i === selected
                      ? {
                          ...s,
                          [key]:
                            key === 'beats'
                              ? e.target.value.split('\n')
                              : e.target.value,
                        }
                      : s,
                  ),
                })
              }
            />
          </label>
        ))}
      </fieldset>
      {spoken?.artwork && (
        <div className="artwork-intent">
          <strong>画面设计</strong>
          {spoken.artwork.intent}
        </div>
      )}
      {doc.stage === 'approval' && (
        <button className="secondary" disabled={locked} onClick={saveBoard}>
          <Save size={15} />
          保存分镜修改
        </button>
      )}
    </div>
  );
}
