import { useEffect, useId, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Headphones,
  Loader2,
  Pause,
  Play,
  Search,
  Volume2,
} from 'lucide-react';
import { VOLCENGINE_VOICES, VOLCENGINE_VOICES_SOURCE } from '@timotv/contracts';
import '../../styles/settings.css';

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`;

const defaultVoice = 'zh_male_yuanboxiaoshu_uranus_bigtts';
export function VoicePicker({
  value,
  onChange,
  serviceDefault = defaultVoice,
  configured = false,
  disabled = false,
  allowDefault = true,
}: {
  value: string;
  onChange: (value: string) => void;
  serviceDefault?: string;
  configured?: boolean;
  disabled?: boolean;
  allowDefault?: boolean;
}) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const audio = useRef<HTMLAudioElement>(null);
  const request = useRef<AbortController | undefined>(undefined);
  const objectUrl = useRef('');
  const effective = value || serviceDefault || defaultVoice;
  const chosen = VOLCENGINE_VOICES.find((v) => v.id === effective);
  useEffect(() => {
    const previous = request.current;
    request.current = undefined;
    previous?.abort();
    audio.current?.pause();
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = '';
    setAudioUrl('');
    setPlaying(false);
    setPosition(0);
    setDuration(0);
    setLoading(false);
    setPreviewError('');
    return () => {
      const current = request.current;
      request.current = undefined;
      current?.abort();
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, [effective]);
  useEffect(() => {
    if (audioUrl)
      void audio.current?.play().catch(() => {
        /* The play button remains available when autoplay is blocked. */
      });
  }, [audioUrl]);
  const filtered = VOLCENGINE_VOICES.filter(
    (v) =>
      (!gender || v.gender === gender) &&
      (v.name + ' ' + v.id).toLowerCase().includes(query.toLowerCase().trim()),
  );
  async function preview() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 25000);
    setLoading(true);
    setPreviewError('');
    audio.current?.pause();
    try {
      const response = await fetch('/api/settings/voices/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice: effective }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message || '试听生成失败，请检查服务配置');
      }
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = URL.createObjectURL(blob);
      setAudioUrl(objectUrl.current);
    } catch (e) {
      if (!controller.signal.aborted) setPreviewError((e as Error).message);
      else if (request.current === controller)
        setPreviewError('试听已停止或超时，请重试');
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) setLoading(false);
    }
  }
  function choose(id: string) {
    onChange(id);
    setOpen(false);
    setQuery('');
  }
  return (
    <div className="voice-picker">
      <div className="voice-picker-label">
        <Volume2 size={14} />
        火山音色 <span>豆包语音合成 2.0</span>
      </div>
      <div className="voice-selection-row">
        <button
          className="voice-picker-trigger secondary"
          type="button"
          aria-label="选择火山音色"
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          onClick={() => setOpen(!open)}
        >
          <span>
            <strong>
              {chosen?.name || '自定义音色'}
              {!value && allowDefault && <em>服务默认</em>}
            </strong>
            <small>{effective}</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <div className="voice-audition">
          <button
            type="button"
            className="secondary voice-preview-button"
            disabled={disabled || loading || (!audioUrl && !configured)}
            onClick={() => {
              if (!audioUrl) {
                void preview();
              } else if (playing) {
                audio.current?.pause();
              } else {
                setPreviewError('');
                void audio.current?.play().catch(() => {
                  setPreviewError('音频播放失败，请重新选择音色后重试');
                });
              }
            }}
          >
            {loading ? (
              <Loader2 size={14} className="spinning" />
            ) : playing ? (
              <Pause size={14} />
            ) : audioUrl ? (
              <Play size={14} />
            ) : (
              <Headphones size={14} />
            )}
            {loading
              ? '生成试听中…'
              : playing
                ? '暂停试听'
                : audioUrl
                  ? '播放试听'
                  : '试听音色'}
          </button>
          {audioUrl ? (
            <div className="voice-playback">
              <input
                type="range"
                aria-label="试听播放进度"
                min={0}
                max={duration || 0}
                step={0.01}
                value={position}
                disabled={disabled || !duration}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (audio.current) audio.current.currentTime = next;
                  setPosition(next);
                }}
              />
              <span>
                {formatTime(position)} / {formatTime(duration)}
              </span>
            </div>
          ) : (
            <small>
              {configured ? '生成后自动播放' : '保存 TTS Key 后可试听'}
            </small>
          )}
        </div>
      </div>
      {audioUrl && (
        <audio
          hidden
          ref={audio}
          src={audioUrl}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => {
            const length = event.currentTarget.duration;
            setDuration(Number.isFinite(length) ? length : 0);
          }}
          onError={() => {
            setPlaying(false);
            setAudioUrl('');
            setPosition(0);
            setDuration(0);
            setPreviewError('试听音频无法播放，请重新生成');
          }}
        />
      )}
      {open && (
        <div className="voice-picker-panel" id={panelId}>
          <div className="voice-search">
            <div className="voice-search-field">
              <Search size={15} aria-hidden="true" />
              <input
                aria-label="搜索火山音色"
                placeholder="搜索名称或音色 ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <select
              aria-label="音色性别"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">全部</option>
              <option value="male">男声</option>
              <option value="female">女声</option>
            </select>
          </div>
          <div className="voice-list" aria-label="官方预置音色">
            {allowDefault && !query && !gender && (
              <button
                type="button"
                className="voice-option"
                disabled={disabled}
                onClick={() => choose('')}
              >
                <span>
                  <strong>使用服务默认音色</strong>
                  <small>跟随服务配置中的默认选择</small>
                </span>
                {!value && <Check size={15} />}
              </button>
            )}
            {filtered.map((v) => (
              <button
                type="button"
                className={
                  'voice-option' + (effective === v.id ? ' selected' : '')
                }
                aria-label={'选择音色：' + v.name}
                key={v.id}
                disabled={disabled}
                onClick={() => choose(v.id)}
              >
                <span>
                  <strong>
                    {v.name}
                    <em>
                      {v.gender === 'male' ? '男声' : '女声'} ·{' '}
                      {v.language === 'zh' ? '中文' : '英语'}
                    </em>
                  </strong>
                  <small>{v.id}</small>
                </span>
                {effective === v.id && <Check size={15} />}
              </button>
            ))}
            {!filtered.length && (
              <p className="voice-no-results">
                没有匹配的预置音色，可以在下方填写自定义 ID。
              </p>
            )}
          </div>
          <div className="voice-source">
            {filtered.length} 个匹配音色 ·{' '}
            <a href={VOLCENGINE_VOICES_SOURCE} target="_blank" rel="noreferrer">
              官方音色目录 ↗
            </a>
          </div>
        </div>
      )}
      {previewError && (
        <p className="voice-preview-error" role="alert">
          {previewError}
        </p>
      )}
      <details className="voice-custom" open={!!value && !chosen}>
        <summary>自定义音色 ID</summary>
        <label>
          自定义火山音色 ID
          <input
            value={value}
            maxLength={120}
            pattern="[A-Za-z0-9_-]*"
            placeholder="例如：S_xxx 或其他官方音色 ID"
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      </details>
      <p className="voice-footnote">
        官方预置目录，具体使用权限以你的火山账号为准。
      </p>
    </div>
  );
}
