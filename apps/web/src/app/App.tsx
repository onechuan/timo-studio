import { useEffect, useState } from 'react';
import { Projects } from '../features/projects/Projects.js';
import { Workspace } from '../features/projects/Workspace.js';
export function App() {
  const [id, setId] = useState(location.hash.slice(1));
  useEffect(() => {
    const onHash = () => setId(location.hash.slice(1));
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-icon">▶</span>Timo<span>TV</span>
        </a>
        <div className="sidebar-label">工作空间</div>
        <a className="nav active" href="#">
          ▦ <span>我的项目</span>
        </a>
        <div className="sidebar-bottom">
          <span className="dot" /> 本地工作室 <small>基础版本 · 项目管理</small>
        </div>
      </aside>
      <main>
        <header>
          <span>
            工作空间{' '}
            <span className="muted">/ {id ? '项目工作台' : '我的项目'}</span>
          </span>
          <span className="badge">AI 视频工作室</span>
        </header>
        {id ? <Workspace key={id} id={id} /> : <Projects />}
      </main>
    </div>
  );
}
