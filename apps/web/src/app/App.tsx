import { Play, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Projects } from '../features/projects/Projects.js';
import { Workspace } from '../features/projects/Workspace.js';
import { SettingsPage } from '../features/settings/SettingsPage.js';
export function App() {
  const [id, setId] = useState(location.hash.slice(1));
  useEffect(() => {
    const onHash = () => setId(location.hash.slice(1));
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  return (
    <div className="shell">
      <main>
        <header className="app-topbar">
          <a className="brand" href="#">
            <Play size={18} fill="currentColor" aria-hidden="true" />
            <span className="brand-word">
              Timo<span>TV</span>
            </span>{' '}
            <small>Studio</small>
          </a>
          <a href="#" className="home-link">
            我的项目
          </a>
          <a href="#settings" className="settings-link" aria-label="服务配置">
            <Settings2 size={15} />
            服务配置
          </a>
          <span className="local-status">
            <span className="dot" />
            本地工作室
          </span>
        </header>
        {id === 'settings' ? (
          <SettingsPage />
        ) : id ? (
          <Workspace key={id} id={id} />
        ) : (
          <Projects />
        )}
      </main>
    </div>
  );
}
