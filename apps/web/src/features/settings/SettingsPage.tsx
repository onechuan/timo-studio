import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Loader2,
  Save,
  Settings2,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import type { AppSettings, SettingsUpdate } from '@timotv/contracts';
import { api } from '../../lib/api.js';
import { VoicePicker } from './VoicePicker.js';
import '../../styles/settings.css';

const providers = {
  deepseek: {
    label: 'DeepSeek',
    model: 'deepseek-flash',
    baseUrl: 'https://api.deepseek.com',
    protocol: 'openai' as const,
  },
  openai: {
    label: 'OpenAI',
    model: '',
    baseUrl: 'https://api.openai.com/v1',
    protocol: 'openai' as const,
  },
  anthropic: {
    label: 'Anthropic',
    model: '',
    baseUrl: 'https://api.anthropic.com',
    protocol: 'anthropic' as const,
  },
  custom: {
    label: '自定义兼容服务',
    model: '',
    baseUrl: '',
    protocol: 'openai' as const,
  },
};
const defaultReviewer: NonNullable<AppSettings['reviewer']> = {
  enabled: false,
  provider: 'openai',
  model: '',
  baseUrl: '',
  protocol: 'openai',
  apiKeyConfigured: false,
};
type Pane = 'model' | 'reviewer' | 'speech';
export function SettingsPage() {
  const [saved, setSaved] = useState<AppSettings>();
  const [draft, setDraft] = useState<AppSettings>();
  const [pane, setPane] = useState<Pane>('model');
  const [keys, setKeys] = useState({
    model: '',
    reviewer: '',
    volcengine: '',
    elevenlabs: '',
  });
  const [cleared, setCleared] = useState({
    model: false,
    reviewer: false,
    volcengine: false,
    elevenlabs: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api<AppSettings>('/settings', { signal: controller.signal })
      .then((s) => {
        if (!controller.signal.aborted) {
          setSaved(s);
          setDraft(s);
          setError('');
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError((e as Error).message);
      });
    return () => controller.abort();
  }, [attempt]);
  function secretPatch(kind: keyof typeof keys) {
    return cleared[kind] ? null : keys[kind].trim() || undefined;
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!draft || !saved) return;
    setBusy(true);
    setError('');
    setMessage('');
    const update: SettingsUpdate = {
      revision: saved.revision,
      model: {
        provider: draft.model.provider,
        model: draft.model.model,
        baseUrl: draft.model.baseUrl,
        protocol: draft.model.protocol,
        apiKey: secretPatch('model'),
      },
      reviewer: {
        enabled: draft.reviewer?.enabled ?? false,
        provider: draft.reviewer?.provider ?? 'openai',
        model: draft.reviewer?.model ?? '',
        baseUrl: draft.reviewer?.baseUrl ?? '',
        protocol: draft.reviewer?.protocol ?? 'openai',
        apiKey: secretPatch('reviewer'),
      },
      speech: {
        volcengine: {
          voice: draft.speech.volcengine.voice,
          resourceId: draft.speech.volcengine.resourceId,
          apiKey: secretPatch('volcengine'),
        },
        elevenlabs: {
          voice: draft.speech.elevenlabs.voice,
          apiKey: secretPatch('elevenlabs'),
        },
      },
    };
    try {
      const next = await api<AppSettings>('/settings', {
        method: 'PUT',
        body: JSON.stringify(update),
      });
      setSaved(next);
      setDraft(next);
      setKeys({ model: '', reviewer: '', volcengine: '', elevenlabs: '' });
      setCleared({
        model: false,
        reviewer: false,
        volcengine: false,
        elevenlabs: false,
      });
      setMessage('配置已保存，新任务将使用新配置。');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function keyField(
    kind: keyof typeof keys,
    label: string,
    configured: boolean,
  ) {
    return (
      <div className="secret-field">
        <label>
          {label}
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            maxLength={4096}
            value={keys[kind]}
            placeholder={
              configured ? '已配置，留空保留当前 Key' : '粘贴 API Key'
            }
            onChange={(e) => {
              setKeys({ ...keys, [kind]: e.target.value });
              setCleared({ ...cleared, [kind]: false });
            }}
          />
        </label>
        <div className="secret-meta">
          <span className={configured && !cleared[kind] ? 'is-configured' : ''}>
            <ShieldCheck size={12} />
            {cleared[kind]
              ? '保存后清除'
              : configured
                ? '已配置 · 不回显 Key'
                : '尚未配置'}
          </span>
          {configured && (
            <label className="clear-key">
              <input
                type="checkbox"
                checked={cleared[kind]}
                onChange={(e) => {
                  setCleared({ ...cleared, [kind]: e.target.checked });
                  setKeys({ ...keys, [kind]: '' });
                }}
              />
              清除已保存的 Key
            </label>
          )}
        </div>
      </div>
    );
  }
  const reviewer = draft?.reviewer ?? defaultReviewer;
  const changeReviewer = (
    patch: Partial<NonNullable<AppSettings['reviewer']>>,
  ) => draft && setDraft({ ...draft, reviewer: { ...reviewer, ...patch } });
  async function probeReviewer() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await api<{ message: string }>(
        '/settings/reviewer/probe',
        { method: 'POST', body: '{}' },
      );
      setMessage(result.message);
    } catch {
      setError('识图检查失败，请检查已保存的视觉模型配置与图片输入支持。');
    } finally {
      setBusy(false);
    }
  }
  const changeModel = (patch: Partial<AppSettings['model']>) =>
    draft && setDraft({ ...draft, model: { ...draft.model, ...patch } });
  const changeVolc = (patch: Partial<AppSettings['speech']['volcengine']>) =>
    draft &&
    setDraft({
      ...draft,
      speech: {
        ...draft.speech,
        volcengine: { ...draft.speech.volcengine, ...patch },
      },
    });
  const changeEleven = (patch: Partial<AppSettings['speech']['elevenlabs']>) =>
    draft &&
    setDraft({
      ...draft,
      speech: {
        ...draft.speech,
        elevenlabs: { ...draft.speech.elevenlabs, ...patch },
      },
    });
  return (
    <div className="page settings-page">
      <a href="#" className="back">
        <ArrowLeft size={15} />
        返回工作室
      </a>
      <div className="settings-heading">
        <div className="settings-heading-icon">
          <Settings2 size={23} />
        </div>
        <div>
          <div className="eyebrow">STUDIO PREFERENCES</div>
          <h1>服务配置</h1>
          <p>连接导演模型、视觉审片模型与配音服务。</p>
        </div>
        <span className="badge">仅保存在本机服务端</span>
      </div>
      {!draft ? (
        <div className="settings-loading">
          {error ? (
            <>
              <p className="error" role="alert">
                {error}
              </p>
              <button
                className="secondary"
                onClick={() => setAttempt((v) => v + 1)}
              >
                重新读取配置
              </button>
            </>
          ) : (
            <p role="status">正在读取配置…</p>
          )}
        </div>
      ) : (
        <form className="settings-layout" onSubmit={(e) => void save(e)}>
          <nav className="settings-nav" role="tablist" aria-label="配置分类">
            <button
              type="button"
              role="tab"
              id="settings-model-tab"
              aria-controls="settings-panel"
              aria-selected={pane === 'model'}
              onClick={() => setPane('model')}
            >
              <Cpu size={17} />
              <span>
                导演模型<small>API / 模型 / 密钥</small>
              </span>
            </button>
            <button
              type="button"
              role="tab"
              id="settings-speech-tab"
              aria-controls="settings-panel"
              aria-selected={pane === 'speech'}
              onClick={() => setPane('speech')}
              aria-label="配音服务"
            >
              <Volume2 size={17} />
              <span>
                配音服务<small>火山 TTS / 音色</small>
              </span>
            </button>
            <button
              type="button"
              role="tab"
              id="settings-reviewer-tab"
              aria-controls="settings-panel"
              aria-selected={pane === 'reviewer'}
              onClick={() => setPane('reviewer')}
            >
              <Cpu size={17} />
              <span>
                视觉审片模型<small>图片输入 / 独立密钥</small>
              </span>
            </button>
          </nav>
          <div className="settings-main">
            <fieldset className="settings-fields" disabled={busy}>
              <section
                className="settings-section"
                role="tabpanel"
                id="settings-panel"
                aria-labelledby={`settings-${pane}-tab`}
              >
                {pane === 'reviewer' ? (
                  <>
                    <div className="settings-section-heading">
                      <Cpu size={19} />
                      <div>
                        <h2>视觉审片模型</h2>
                        <p>
                          对实际关键帧截图进行审片，需要支持图片输入的模型。
                        </p>
                      </div>
                    </div>
                    <label className="reviewer-toggle">
                      <span>
                        <span id="reviewer-enabled-label">启用视觉审片</span>
                        <small id="reviewer-enabled-hint">
                          未启用或未配置时仅完成布局检查，不标记为视觉通过。
                        </small>
                      </span>
                      <input
                        type="checkbox"
                        aria-labelledby="reviewer-enabled-label"
                        aria-describedby="reviewer-enabled-hint"
                        checked={reviewer.enabled}
                        onChange={(e) =>
                          changeReviewer({ enabled: e.target.checked })
                        }
                      />
                    </label>
                    <div className="settings-form-grid">
                      <label>
                        视觉服务商
                        <input
                          value={reviewer.provider}
                          maxLength={120}
                          onChange={(e) =>
                            changeReviewer({ provider: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        视觉接口协议
                        <select
                          value={reviewer.protocol}
                          onChange={(e) =>
                            changeReviewer({
                              protocol: e.target.value as
                                'openai' | 'anthropic',
                            })
                          }
                        >
                          <option value="openai">OpenAI 兼容</option>
                          <option value="anthropic">Anthropic Messages</option>
                        </select>
                      </label>
                      <label className="full-width">
                        视觉模型 ID
                        <input
                          value={reviewer.model}
                          maxLength={120}
                          onChange={(e) =>
                            changeReviewer({ model: e.target.value })
                          }
                        />
                      </label>
                      <label className="full-width">
                        视觉模型 API 地址
                        <input
                          type="url"
                          value={reviewer.baseUrl}
                          maxLength={2000}
                          onChange={(e) =>
                            changeReviewer({ baseUrl: e.target.value })
                          }
                        />
                      </label>
                      <div className="full-width">
                        {keyField(
                          'reviewer',
                          '视觉审片 API Key',
                          !!saved?.reviewer?.apiKeyConfigured,
                        )}
                      </div>
                    </div>
                    <div className="reviewer-probe">
                      <button
                        type="button"
                        className="secondary"
                        disabled={
                          !saved?.reviewer?.enabled ||
                          !saved?.reviewer?.apiKeyConfigured ||
                          !saved?.reviewer?.model
                        }
                        onClick={() => void probeReviewer()}
                      >
                        检查图片输入
                      </button>
                      <p>
                        先保存配置。点击后使用已保存的配置发送一张测试图，可能产生服务商费用；成功仅代表请求被接受。
                      </p>
                    </div>
                  </>
                ) : pane === 'model' ? (
                  <>
                    <div className="settings-section-heading">
                      <Cpu size={19} />
                      <div>
                        <h2>导演模型</h2>
                        <p>用于分镜规划和口播撰写，支持兼容接口。</p>
                      </div>
                      <span
                        className={
                          'service-configured ' +
                          (saved?.model.apiKeyConfigured ? 'yes' : '')
                        }
                      >
                        {saved?.model.apiKeyConfigured
                          ? 'Key 已配置'
                          : '待配置'}
                      </span>
                    </div>
                    <div className="settings-form-grid">
                      <label>
                        模型服务商
                        <select
                          value={draft.model.provider}
                          onChange={(e) => {
                            const provider = e.target.value;
                            const defaults =
                              providers[provider as keyof typeof providers];
                            changeModel({
                              provider,
                              model: defaults?.model ?? '',
                              baseUrl: defaults?.baseUrl ?? '',
                              protocol: defaults?.protocol ?? 'openai',
                            });
                            setKeys((k) => ({ ...k, model: '' }));
                            setCleared((c) => ({
                              ...c,
                              model: !!saved?.model.apiKeyConfigured,
                            }));
                            setMessage('');
                          }}
                        >
                          {Object.entries(providers).map(([id, v]) => (
                            <option key={id} value={id}>
                              {v.label}
                            </option>
                          ))}
                          {!Object.hasOwn(providers, draft.model.provider) && (
                            <option value={draft.model.provider}>
                              {draft.model.provider}
                            </option>
                          )}
                        </select>
                      </label>
                      <label>
                        接口协议
                        <select
                          value={draft.model.protocol}
                          onChange={(e) =>
                            changeModel({
                              protocol: e.target.value as
                                'openai' | 'anthropic',
                            })
                          }
                        >
                          <option value="openai">OpenAI 兼容</option>
                          <option value="anthropic">Anthropic Messages</option>
                        </select>
                      </label>
                      <label className="full-width">
                        模型 ID
                        <input
                          value={draft.model.model}
                          placeholder="填写服务商提供的模型名称"
                          maxLength={120}
                          onChange={(e) =>
                            changeModel({ model: e.target.value })
                          }
                        />
                      </label>
                      <label className="full-width">
                        模型 API 地址
                        <input
                          type="url"
                          aria-label="模型 API 地址"
                          value={draft.model.baseUrl}
                          placeholder="https://api.deepseek.com"
                          maxLength={2000}
                          onChange={(e) =>
                            changeModel({ baseUrl: e.target.value })
                          }
                        />
                        <small>填写 Base URL，系统通过所选协议调用。</small>
                      </label>
                      <div className="full-width">
                        {keyField(
                          'model',
                          '模型 API Key',
                          !!saved?.model.apiKeyConfigured,
                        )}
                      </div>
                    </div>
                    <div className="settings-tip">
                      <ShieldCheck size={16} />
                      <p>
                        保存后，新任务直接生效。切换服务商时请填写对应
                        Key；已运行的任务保持原有配置。
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="settings-section-heading">
                      <Volume2 size={19} />
                      <div>
                        <h2>火山 TTS</h2>
                        <p>豆包语音合成，为口播生成配音。</p>
                      </div>
                      <span
                        className={
                          'service-configured ' +
                          (saved?.speech.volcengine.apiKeyConfigured
                            ? 'yes'
                            : '')
                        }
                      >
                        {saved?.speech.volcengine.apiKeyConfigured
                          ? 'Key 已配置'
                          : '待配置'}
                      </span>
                    </div>
                    {keyField(
                      'volcengine',
                      '火山 TTS API Key',
                      !!saved?.speech.volcengine.apiKeyConfigured,
                    )}
                    <VoicePicker
                      value={draft.speech.volcengine.voice}
                      onChange={(voice) => changeVolc({ voice })}
                      configured={!!saved?.speech.volcengine.apiKeyConfigured}
                      allowDefault={false}
                      disabled={busy}
                    />
                    <details className="tts-advanced">
                      <summary>高级配置</summary>
                      <label>
                        火山资源 ID（可选）
                        <input
                          value={draft.speech.volcengine.resourceId}
                          placeholder="留空时按音色自动匹配"
                          maxLength={120}
                          onChange={(e) =>
                            changeVolc({ resourceId: e.target.value })
                          }
                        />
                        <small>
                          预置 2.0 音色自动使用
                          seed-tts-2.0；自定义音色通常无需手动指定。
                        </small>
                      </label>
                    </details>
                    <details className="eleven-settings">
                      <summary>ElevenLabs（可选）</summary>
                      {keyField(
                        'elevenlabs',
                        'ElevenLabs API Key',
                        !!saved?.speech.elevenlabs.apiKeyConfigured,
                      )}
                      <label>
                        ElevenLabs 默认音色 ID
                        <input
                          value={draft.speech.elevenlabs.voice}
                          maxLength={120}
                          onChange={(e) =>
                            changeEleven({ voice: e.target.value })
                          }
                        />
                      </label>
                    </details>
                  </>
                )}
              </section>
            </fieldset>
            <div className="settings-save-bar">
              <div>
                {message && (
                  <p className="settings-message" role="status">
                    <CheckCircle2 size={14} />
                    {message}
                  </p>
                )}
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
                {!message && !error && (
                  <small>
                    {pane === 'speech'
                      ? '保存 Key 后可使用试听。试听会调用语音合成服务。'
                      : pane === 'reviewer'
                        ? '保存配置后，可检查模型是否支持图片输入。'
                        : '保存后，新建任务将使用当前模型配置。'}
                  </small>
                )}
              </div>
              <button type="submit" disabled={busy}>
                {busy ? (
                  <Loader2 size={15} className="spinning" />
                ) : (
                  <Save size={15} />
                )}
                {busy ? '保存中…' : '保存配置'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
