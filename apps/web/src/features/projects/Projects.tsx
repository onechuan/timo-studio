import { ArrowUpRight, Clapperboard, Play } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type { Project, CreateProject } from '@timotv/contracts';
import { BriefFields, initialBrief } from '../production/BriefFields.js';
import { api } from '../../lib/api.js';
import brandCover from '../../assets/timotv-cover-v1.png';
export const kindNames = {
  generated: 'AI 创作',
  edited: '素材剪辑',
  narration: '配音项目',
};
export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [title, setTitle] = useState(''),
    [kind, setKind] = useState<CreateProject['kind']>('generated'),
    [ratio, setRatio] = useState<CreateProject['aspectRatio']>('16:9');
  const [brief, setBrief] = useState(initialBrief);
  async function load() {
    setLoading(true);
    setError('');
    try {
      setProjects(await api<Project[]>('/projects'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const p = await api<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          title:
            title.trim() ||
            (brief.topic || brief.materials).trim().slice(0, 80),
          kind,
          aspectRatio: ratio,
        }),
      });
      if (kind !== 'edited')
        await api('/projects/' + p.id + '/production', {
          method: 'POST',
          body: JSON.stringify(brief),
        });
      location.hash = p.id;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page projects-page">
      <div className="heading home-heading">
        <div>
          <h1>
            <img
              className="home-brand-cover"
              src={brandCover}
              alt="TimoTV：让想法，成为画面。"
              width={1921}
              height={819}
              fetchPriority="high"
            />
          </h1>
          <p>一个主题就能开始，不必提前准备讲稿。</p>
        </div>
      </div>
      <section className="create-panel">
        <form onSubmit={create}>
          {kind !== 'edited' && (
            <BriefFields value={brief} onChange={setBrief} />
          )}
          <details className="project-options">
            <summary>
              项目选项 · {kindNames[kind]} · {ratio}
            </summary>
            <div className="form-row">
              <label>
                创作类型
                <select
                  value={kind}
                  onChange={(e) =>
                    setKind(e.target.value as CreateProject['kind'])
                  }
                >
                  {Object.entries(kindNames).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                画面比例
                <select
                  value={ratio}
                  onChange={(e) =>
                    setRatio(e.target.value as CreateProject['aspectRatio'])
                  }
                >
                  <option>16:9</option>
                  <option>9:16</option>
                </select>
              </label>
            </div>
            <label>
              项目名称
              <input
                required={kind === 'edited'}
                maxLength={120}
                placeholder="留空时根据主题命名"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
          </details>
          <div className="composer-footer">
            <span className="muted">从想法到分镜，一步一步来</span>
            <button
              disabled={
                busy ||
                (kind === 'edited'
                  ? !title.trim()
                  : !(brief.topic.trim() || brief.materials.trim()))
              }
            >
              {busy ? '创建中…' : '创建项目'}
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>
      <div className="topic-examples">
        <span>试试这些主题</span>
        {['为什么天空是蓝色的', '用一分钟认识咖啡', '城市里的一棵树'].map(
          (topic) => (
            <button
              type="button"
              className="secondary"
              key={topic}
              onClick={() => setBrief({ ...brief, topic })}
            >
              {topic}
            </button>
          ),
        )}
      </div>
      {error && (
        <div role="alert" className="error">
          {error} <button onClick={() => void load()}>重新加载</button>
        </div>
      )}
      <div className="section-heading">
        <h2>
          我的项目 <span className="count">{projects.length}</span>
        </h2>
        <span className="muted">最近更新</span>
      </div>
      {loading ? (
        <div role="status" className="empty">
          正在读取项目…
        </div>
      ) : projects.length ? (
        <div className="project-grid">
          {projects.map((p) => (
            <a className="project-card" href={'#' + p.id} key={p.id}>
              <div className="project-cover">
                <span
                  className={
                    'frame ' + (p.aspectRatio === '9:16' ? 'portrait' : '')
                  }
                >
                  <Play size={20} aria-hidden="true" />
                </span>
                <span className="ratio">{p.aspectRatio}</span>
              </div>
              <div className="project-info">
                <span className="tag">{kindNames[p.kind]}</span>
                <h3>{p.title}</h3>
                <small>
                  {
                    { draft: '草稿', ready: '就绪', archived: '已归档' }[
                      p.status
                    ]
                  }{' '}
                  · {new Date(p.updatedAt).toLocaleString('zh-CN')}
                </small>
                <ArrowUpRight
                  className="card-arrow"
                  size={18}
                  aria-hidden="true"
                />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="empty">
          <span className="empty-icon">
            <Clapperboard size={32} aria-hidden="true" />
          </span>
          <h3>你的第一个故事，从这里开始</h3>
          <p>在上方创建项目，即可进入工作台并管理项目名称。</p>
        </div>
      )}
      <div className="notice">
        主题创作：先规划分镜，确认后自动生成口播与配音，再预览和导出。
      </div>
    </div>
  );
}
