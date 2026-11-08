import { useEffect, useState, type FormEvent } from 'react';
import type { Project, CreateProject } from '@timotv/contracts';
import { api } from '../../lib/api.js';
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
        body: JSON.stringify({ title, kind, aspectRatio: ratio }),
      });
      location.hash = p.id;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page">
      <div className="eyebrow">YOUR NEXT STORY STARTS HERE</div>
      <div className="heading">
        <div>
          <h1>让想法，成为画面。</h1>
          <p>从一个项目开始，组织你的下一段故事。</p>
        </div>
        <span className="version">TIMOTV / 01</span>
      </div>
      <section className="create-panel">
        <div>
          <span className="tag">新建项目</span>
          <h2>准备好开始了吗？</h2>
          <p>
            先确定名称、创作类型和画幅。
            <br />
            项目将自动保存到本地数据库。
          </p>
        </div>
        <form onSubmit={create}>
          <label>
            项目名称
            <input
              required
              maxLength={120}
              placeholder="例如：城市的一天"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
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
            <button disabled={busy || !title.trim()}>
              {busy ? '创建中…' : '创建项目 ↗'}
            </button>
          </div>
        </form>
      </section>
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
                  ▶
                </span>
                <span className="ratio">{p.aspectRatio}</span>
              </div>
              <div className="project-info">
                <span className="tag">{kindNames[p.kind]}</span>
                <h3>{p.title}</h3>
                <small>
                  草稿 · {new Date(p.updatedAt).toLocaleString('zh-CN')}
                </small>
                <span className="card-arrow">↗</span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="empty">
          <span className="empty-icon">▤</span>
          <h3>你的第一个故事，从这里开始</h3>
          <p>在上方创建项目，即可进入工作台并管理项目名称。</p>
        </div>
      )}
      <div className="notice">
        当前可用：创建项目、修改标题、保存时间轴与后台诊断。素材上传、AI
        生成、剪辑、配音和导出尚未接入。
      </div>
    </div>
  );
}
