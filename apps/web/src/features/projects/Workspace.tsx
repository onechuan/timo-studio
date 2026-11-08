import { useEffect, useState } from 'react';
import type { Project, Timeline, Job } from '@timotv/contracts';
import { api } from '../../lib/api.js';
import { kindNames } from './Projects.js';
export function Workspace({ id }: { id: string }) {
  const [project, setProject] = useState<Project>(),
    [timeline, setTimeline] = useState<Timeline>(),
    [title, setTitle] = useState(''),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(''),
    [job, setJob] = useState<Job>();
  useEffect(() => {
    let active = true;
    Promise.all([
      api<Project>('/projects/' + id),
      api<Timeline>('/projects/' + id + '/timeline'),
    ])
      .then(([p, t]) => {
        if (active) {
          setProject(p);
          setTitle(p.title);
          setTimeline(t);
        }
      })
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [id]);
  useEffect(() => {
    if (!job || !['queued', 'running'].includes(job.status)) return;
    const timer = setTimeout(() => {
      api<Job>('/jobs/' + job.id)
        .then(setJob)
        .catch((e) => setError(e.message));
    }, 1000);
    return () => clearTimeout(timer);
  }, [job]);
  async function action(name: string, fn: () => Promise<void>) {
    setBusy(name);
    setError('');
    setMessage('');
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  }
  if (!project || !timeline)
    return (
      <div className="page">
        <a href="#">← 返回项目</a>
        <p role={error ? 'alert' : 'status'}>{error || '正在打开工作台…'}</p>
      </div>
    );
  return (
    <div className="page workspace">
      <a className="back" href="#">
        ← 我的项目
      </a>
      <div className="heading">
        <div>
          <div className="eyebrow">PROJECT WORKSPACE</div>
          <h1>{project.title}</h1>
          <p>
            {kindNames[project.kind]} · {project.aspectRatio} · 草稿
          </p>
        </div>
        <span className="badge">项目已持久化</span>
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
      <div className="studio">
        <section className="panel assets">
          <h2>
            素材库 <span>00</span>
          </h2>
          <div className="panel-empty">
            <span>▧</span>
            <h3>还没有素材</h3>
            <p>
              素材上传尚未接入。
              <br />
              下一阶段支持视频、音频和图片。
            </p>
          </div>
        </section>
        <section className="panel preview">
          <h2>
            播放器 <span>预览区域</span>
          </h2>
          <div
            className={
              'screen ' + (project.aspectRatio === '9:16' ? 'vertical' : '')
            }
          >
            <span>▶</span>
            <p>画面即将从这里开始</p>
            <small>添加素材和播放预览尚未接入</small>
          </div>
          <div className="transport">
            <span>00:00.000</span>
            <span>预览尚未接入</span>
            <span>{timeline.fps} FPS</span>
          </div>
        </section>
        <section className="panel properties">
          <h2>项目属性</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action('title', async () => {
                const p = await api<Project>('/projects/' + id, {
                  method: 'PATCH',
                  body: JSON.stringify({ title }),
                });
                setProject(p);
                setTitle(p.title);
                setMessage('项目标题已保存');
              });
            }}
          >
            <label>
              项目名称
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={120}
              />
            </label>
            <button disabled={!!busy || !title.trim()}>
              {busy === 'title' ? '保存中…' : '保存标题'}
            </button>
          </form>
          <dl>
            <dt>画幅</dt>
            <dd>{project.aspectRatio}</dd>
            <dt>时间轴版本</dt>
            <dd>r{timeline.revision}</dd>
            <dt>时间单位</dt>
            <dd>整数毫秒</dd>
          </dl>
          <div className="divider" />
          <h3>后台链路诊断</h3>
          <p>验证 Redis 队列、独立 Worker 与数据库状态回写。</p>
          <button
            className="secondary"
            disabled={
              !!busy || (!!job && ['queued', 'running'].includes(job.status))
            }
            onClick={() =>
              void action('job', async () =>
                setJob(
                  await api<Job>('/projects/' + id + '/diagnostics', {
                    method: 'POST',
                  }),
                ),
              )
            }
          >
            {busy === 'job' ? '提交中…' : '运行诊断'}
          </button>
          {job && (
            <p role="status" className="job-status">
              {
                {
                  queued: '等待 Worker 执行',
                  running: '诊断执行中',
                  succeeded: '诊断成功',
                  failed: '诊断失败',
                  cancelled: '已取消',
                }[job.status]
              }{' '}
              · {job.progress}%
              {job.errorMessage && <small>{job.errorMessage}</small>}
            </p>
          )}
        </section>
        <section className="panel timeline">
          <h2>
            时间轴 <span>顺序视频轨 / 独立音频轨 / 字幕轨</span>
            <button
              disabled={!!busy}
              className="secondary"
              onClick={() =>
                void action('timeline', async () => {
                  setTimeline(
                    await api<Timeline>('/projects/' + id + '/timeline', {
                      method: 'PUT',
                      body: JSON.stringify(timeline),
                    }),
                  );
                  setMessage('时间轴已保存');
                })
              }
            >
              {busy === 'timeline' ? '保存中…' : '保存时间轴'}
            </button>
          </h2>
          <div className="ruler">
            00:00 <span>00:05</span>
            <span>00:10</span>
            <span>00:15</span>
          </div>
          {['视频', '音频', '字幕'].map((name, i) => (
            <div className="track" key={name}>
              <span>{name}</span>
              <div>
                {
                  [
                    timeline.videoClips.length,
                    timeline.audioClips.length,
                    timeline.subtitles.length,
                  ][i]
                }{' '}
                个片段 · 编辑尚未接入
              </div>
            </div>
          ))}
        </section>
      </div>
      <div className="notice">
        工作台布局已就绪。AI 生成、上传、剪辑、配音、字幕编辑与 MP4
        导出尚未接入。
      </div>
    </div>
  );
}
