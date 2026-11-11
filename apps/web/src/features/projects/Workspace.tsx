import { ArrowLeft, Clapperboard, Pencil } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type { Project } from '@timotv/contracts';
import { api } from '../../lib/api.js';
import { ProductionWorkspace } from '../production/ProductionWorkspace.js';
import { kindNames } from './Projects.js';

export function Workspace({ id }: { id: string }) {
  const [project, setProject] = useState<Project>();
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    api<Project>('/projects/' + id)
      .then((p) => {
        if (active) {
          setProject(p);
          setTitle(p.title);
        }
      })
      .catch((e: Error) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [id]);

  function cancelRename() {
    setTitle(project!.title);
    setEditing(false);
    setError('');
  }

  async function rename(event: FormEvent) {
    event.preventDefault();
    if (saving || !title.trim()) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await api<Project>('/projects/' + id, {
        method: 'PATCH',
        body: JSON.stringify({ title: title.trim() }),
      });
      setProject(updated);
      setTitle(updated.title);
      setEditing(false);
      setMessage('项目标题已保存');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!project)
    return (
      <div className="page">
        <a className="back" href="#">
          <ArrowLeft size={16} aria-hidden="true" /> 返回项目
        </a>
        <p role={error ? 'alert' : 'status'}>{error || '正在打开工作台…'}</p>
      </div>
    );

  return (
    <div className="page workspace">
      <div className="workspace-titlebar">
        <a className="back" href="#">
          <ArrowLeft size={16} aria-hidden="true" /> 我的项目
        </a>
        <div className="heading workspace-heading">
          <div className="workspace-identity">
            {editing ? (
              <form className="project-rename" onSubmit={rename}>
                <input
                  aria-label="项目名称"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && !saving) cancelRename();
                  }}
                  autoFocus
                  required
                  maxLength={120}
                  disabled={saving}
                />
                <button disabled={saving || !title.trim()}>
                  {saving ? '保存中…' : '保存标题'}
                </button>
                <button
                  type="button"
                  className="secondary"
                  aria-label="取消重命名"
                  disabled={saving}
                  onClick={cancelRename}
                >
                  取消
                </button>
              </form>
            ) : (
              <div className="project-title-row">
                <h1>{project.title}</h1>
                <button
                  type="button"
                  className="secondary project-rename-trigger"
                  aria-label="重命名项目"
                  title="重命名项目"
                  onClick={() => {
                    setTitle(project.title);
                    setError('');
                    setMessage('');
                    setEditing(true);
                  }}
                >
                  <Pencil size={14} aria-hidden="true" />
                </button>
              </div>
            )}
            <p>
              {kindNames[project.kind]} · {project.aspectRatio}
            </p>
          </div>
          <span className="badge saved-badge">项目已保存</span>
        </div>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="success">
          {message}
        </p>
      )}
      {project.kind !== 'edited' ? (
        <ProductionWorkspace id={id} />
      ) : (
        <section className="panel project-editor-placeholder">
          <Clapperboard size={32} aria-hidden="true" />
          <h2>素材剪辑工作台</h2>
          <p>
            素材上传与时间轴剪辑尚未开放。你可以先创建 AI 创作项目制作口播视频。
          </p>
          <a className="back" href="#">
            返回我的项目
          </a>
        </section>
      )}
    </div>
  );
}
