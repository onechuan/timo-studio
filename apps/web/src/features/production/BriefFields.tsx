import { useEffect, useId, useRef, useState } from 'react';
import {
  contentTypeLabels,
  contentTypeSchema,
  type AppSettings,
  type ProductionBrief,
} from '@timotv/contracts';
import { api } from '../../lib/api.js';
import { SelectField } from '../../components/SelectField.js';
import { VoicePicker } from '../settings/VoicePicker.js';
const durationOptions = [
  { value: '30', label: '30秒' },
  { value: '50', label: '50秒' },
  { value: '60', label: '1分钟' },
  { value: '90', label: '90秒' },
  { value: '120', label: '2分钟' },
  { value: '180', label: '3分钟' },
  { value: '300', label: '5分钟' },
  { value: '600', label: '10分钟' },
];
export const initialBrief: ProductionBrief = {
  topic: '',
  materials: '',
  contentType: 'general',
  narrationMode: 'ai',
  durationSec: 60,
  language: 'zh',
  style: 'warm',
  voiceProvider: 'volcengine',
  voice: '',
};
export function BriefFields({
  value: v,
  onChange,
}: {
  value: ProductionBrief;
  onChange: (v: ProductionBrief) => void;
}) {
  const [voiceConfig, setVoiceConfig] =
    useState<AppSettings['speech']['volcengine']>();
  useEffect(() => {
    const controller = new AbortController();
    api<AppSettings>('/settings', { signal: controller.signal })
      .then((s) => {
        if (!controller.signal.aborted) setVoiceConfig(s?.speech?.volcengine);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const latest = useRef(v);
  latest.current = v;
  const [fileError, setFileError] = useState('');
  const [confirmClearNarration, setConfirmClearNarration] = useState(false);
  const uploadHintId = useId();
  const upload = useRef(0);
  const timeMention = v.topic.match(
    /([零〇一二两三四五六七八九十百]+|\d+(?:\.\d+)?)\s*(分钟|秒)/,
  );
  const chineseNumbers: Record<string, number> = {
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };
  const mentionedSec = timeMention
    ? (chineseNumbers[timeMention[1]] ?? Number(timeMention[1])) *
      (timeMention[2] === '分钟' ? 60 : 1)
    : undefined;
  const put = (p: Partial<ProductionBrief>) => onChange({ ...v, ...p });
  return (
    <div className="production-fields">
      <label>
        你想讲什么？
        <textarea
          maxLength={4000}
          value={v.topic}
          onChange={(e) => put({ topic: e.target.value })}
          placeholder="输入主题或想法，系统会为你编排分镜和口播"
        />
      </label>
      {Number.isFinite(mentionedSec) && mentionedSec !== v.durationSec && (
        <p role="status">
          主题中的时长与目标时长不同，将以目标时长 {v.durationSec} 秒为准。
        </p>
      )}
      <details>
        <summary>添加资料</summary>
        <label className="material-upload">
          <span className="material-upload-label">
            文本资料 <small>可选</small>
          </span>
          <input
            type="file"
            aria-label="文本资料（可选，UTF-8 .txt / .md，最多 60000 字符）"
            aria-describedby={uploadHintId}
            accept=".txt,.md,text/plain,text/markdown"
            onChange={async (e) => {
              const target = e.currentTarget;
              const version = ++upload.current;
              const before = latest.current;
              const f = target.files?.[0];
              if (!f) return;
              try {
                if (!/\.(txt|md)$/i.test(f.name) || f.size > 240000)
                  throw new Error('请选择不超过 240 KB 的文本文件');
                const text = new TextDecoder('utf-8', { fatal: true }).decode(
                  await f.arrayBuffer(),
                );
                if (text.length > 60000) throw new Error('资料超过 60000 字符');
                if (version !== upload.current || latest.current !== before)
                  return;
                onChange({ ...latest.current, materials: text });
                setFileError('');
                target.setCustomValidity('');
              } catch (err) {
                setFileError((err as Error).message);
                target.setCustomValidity((err as Error).message);
                target.reportValidity();
              }
            }}
          />
          <small className="material-upload-hint" id={uploadHintId}>
            支持 UTF-8 编码的 .txt / .md 文件，最多 240 KB、60,000 字符
          </small>
        </label>
        <label>
          资料内容
          <textarea
            maxLength={60000}
            value={v.materials}
            onChange={(e) => put({ materials: e.target.value })}
          />
        </label>
        {fileError && (
          <p role="alert" className="error">
            {fileError}
          </p>
        )}
      </details>
      <details>
        <summary>
          创作设置{' '}
          <span className="muted">
            {contentTypeLabels[v.contentType ?? 'general']} /{' '}
            {durationOptions.find(
              (option) => Number(option.value) === v.durationSec,
            )?.label ?? `${v.durationSec}秒`}
            / {v.language === 'zh' ? '中文' : 'English'} /{' '}
            {
              { warm: '温暖', chalk: '黑板', tech: '科技', brand: '品牌手绘' }[
                v.style
              ]
            }{' '}
            / {v.voiceProvider === 'volcengine' ? '火山TTS' : v.voiceProvider}
          </span>
        </summary>
        <SelectField
          label="创作方向"
          value={v.contentType ?? 'general'}
          options={contentTypeSchema.options.map((type) => ({
            value: type,
            label: contentTypeLabels[type],
          }))}
          onChange={(value) =>
            put({ contentType: contentTypeSchema.parse(value) })
          }
        />
        <div className="form-row">
          <SelectField
            label="目标时长"
            value={String(v.durationSec)}
            options={
              durationOptions.some(
                (option) => Number(option.value) === v.durationSec,
              )
                ? durationOptions
                : [
                    {
                      value: String(v.durationSec),
                      label: `${v.durationSec}秒（当前）`,
                    },
                    ...durationOptions,
                  ]
            }
            onChange={(value) => put({ durationSec: Number(value) })}
          />
          <SelectField
            label="语言"
            value={v.language}
            options={[
              { value: 'zh', label: '中文' },
              { value: 'en', label: 'English' },
            ]}
            onChange={(value) => put({ language: value as 'zh' | 'en' })}
          />
          <SelectField
            label="画面风格"
            value={v.style}
            options={[
              { value: 'warm', label: '温暖' },
              { value: 'chalk', label: '黑板' },
              { value: 'brand', label: '品牌手绘' },
              { value: 'tech', label: '科技' },
            ]}
            onChange={(value) =>
              put({ style: value as ProductionBrief['style'] })
            }
          />
        </div>
        <SelectField
          label="口播方式"
          value={v.narrationMode ?? 'ai'}
          options={[
            { value: 'ai', label: 'AI 创作口播' },
            { value: 'verbatim', label: '逐字原稿' },
          ]}
          onChange={(value) => {
            if (value === 'ai' && v.sourceNarration) {
              setConfirmClearNarration(true);
              return;
            }
            setConfirmClearNarration(false);
            put({ narrationMode: value as 'ai' | 'verbatim' });
          }}
        />
        {confirmClearNarration && (
          <div className="narration-clear-confirm" role="alert">
            <p>切回 AI 创作会清除已填写的逐字原稿，是否继续？</p>
            <button
              type="button"
              onClick={() => {
                setConfirmClearNarration(false);
                put({ narrationMode: 'ai', sourceNarration: undefined });
              }}
            >
              清除并切换
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setConfirmClearNarration(false)}
            >
              取消
            </button>
          </div>
        )}
        {(v.narrationMode ?? 'ai') === 'verbatim' && (
          <label className="source-narration-field">
            逐字口播原稿
            <textarea
              required
              maxLength={60000}
              value={v.sourceNarration ?? ''}
              onChange={(event) => put({ sourceNarration: event.target.value })}
              placeholder="粘贴必须逐字配音的原稿；AI 只会按现有标点拆句，不会改写或扩写。"
            />
            <small>
              原字词、标点和顺序会完整保留；时长不足时由你决定是否接受实际时长。
            </small>
          </label>
        )}
        <div className="form-row">
          <SelectField
            label="配音服务"
            value={v.voiceProvider}
            options={[
              { value: 'volcengine', label: '火山 TTS（豆包语音）' },
              { value: 'local', label: 'macOS 系统语音' },
              { value: 'elevenlabs', label: 'ElevenLabs' },
            ]}
            onChange={(value) =>
              put({
                voiceProvider: value as ProductionBrief['voiceProvider'],
                voice: '',
              })
            }
          />
          {v.voiceProvider !== 'volcengine' && (
            <label>
              声音名称 / ID（可选）
              <input
                value={v.voice}
                onChange={(e) => put({ voice: e.target.value })}
              />
            </label>
          )}
        </div>
        {v.voiceProvider === 'volcengine' && (
          <VoicePicker
            value={v.voice}
            onChange={(voice) => put({ voice })}
            serviceDefault={voiceConfig?.voice}
            configured={voiceConfig?.apiKeyConfigured}
          />
        )}
      </details>
    </div>
  );
}
