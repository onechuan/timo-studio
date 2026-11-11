import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import {
  privateSettingsSchema,
  resolveVideoPipeline,
  settingsUpdateSchema,
  type AppSettings,
  type SettingsUpdate,
} from '@timotv/contracts';
type Saved = {
  revision: number;
  production: { videoPipeline: 'legacy-v3' | 'frametell-parity' };
  model: Record<string, string | null>;
  reviewer?: Record<string, string | boolean | null>;
  speech: {
    volcengine: Record<string, string | null>;
    elevenlabs: Record<string, string | null>;
  };
};
const fields = {
  provider: 'TIMO_PROVIDER',
  model: 'TIMO_MODEL',
  baseUrl: 'TIMO_BASE_URL',
  protocol: 'TIMO_PROTOCOL',
  apiKey: 'TIMO_API_KEY',
};
export class LocalSettingsStore {
  private pending: Promise<unknown> = Promise.resolve();
  constructor(
    readonly path: string,
    private fallback: NodeJS.ProcessEnv = { ...process.env },
  ) {}
  private async load(): Promise<Saved> {
    try {
      return privateSettingsSchema.parse(
        JSON.parse(await readFile(this.path, 'utf8')),
      ) as Saved;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT')
        throw new Error('SETTINGS_READ_FAILED');
      return {
        revision: 0,
        production: { videoPipeline: 'legacy-v3' },
        model: {},
        speech: { volcengine: {}, elevenlabs: {} },
      };
    }
  }
  async runtimeEnv(): Promise<NodeJS.ProcessEnv> {
    return this.deriveEnv(await this.load());
  }
  private deriveEnv(s: Saved): NodeJS.ProcessEnv {
    const env: NodeJS.ProcessEnv = {};
    for (const k of [
      'TIMOTV_FRAMETELL_PARITY',
      'TIMO_VIDEO_PIPELINE',
      'TIMO_REVIEW_ENABLED',
      'TIMO_REVIEW_PROVIDER',
      'TIMO_REVIEW_MODEL',
      'TIMO_REVIEW_BASE_URL',
      'TIMO_REVIEW_PROTOCOL',
      'TIMO_REVIEW_API_KEY',
      'TIMO_PROVIDER',
      'TIMO_MODEL',
      'TIMO_BASE_URL',
      'TIMO_PROTOCOL',
      'TIMO_API_KEY',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'GEMINI_API_KEY',
      'DEEPSEEK_API_KEY',
      'VOLCENGINE_TTS_API_KEY',
      'VOLCENGINE_TTS_APP_ID',
      'VOLCENGINE_TTS_ACCESS_TOKEN',
      'VOLCENGINE_TTS_VOICE_ID',
      'VOLCENGINE_TTS_RESOURCE_ID',
      'ELEVENLABS_API_KEY',
      'ELEVENLABS_VOICE_ID',
    ])
      env[k] = this.fallback[k];
    env.TIMO_VIDEO_PIPELINE = s.production.videoPipeline;
    for (const [k, v] of Object.entries(s.reviewer || {})) {
      const target =
        k === 'enabled'
          ? 'TIMO_REVIEW_ENABLED'
          : fields[k as keyof typeof fields]?.replace('TIMO_', 'TIMO_REVIEW_');
      if (target) env[target] = v === null ? '' : String(v);
    }
    // Persisted revision and configuration digest detect key rotation without exposing credentials.
    env.TIMO_REVIEW_REVISION = createHash('sha256')
      .update(
        JSON.stringify(
          Object.entries(env).filter(([k]) => k.startsWith('TIMO_REVIEW_')),
        ),
      )
      .digest('hex');
    for (const [k, v] of Object.entries(s.model))
      if (k in fields) env[fields[k as keyof typeof fields]] = v ?? '';
    if (s.model.apiKey === null)
      for (const k of [
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY',
        'GEMINI_API_KEY',
        'DEEPSEEK_API_KEY',
      ])
        delete env[k];
    for (const [name, prefix] of [
      ['volcengine', 'VOLCENGINE_TTS'],
      ['elevenlabs', 'ELEVENLABS'],
    ] as const) {
      const section = s.speech[name];
      for (const [field, suffix] of [
        ['apiKey', 'API_KEY'],
        ['voice', 'VOICE_ID'],
        ['resourceId', 'RESOURCE_ID'],
      ])
        if (field in section) env[`${prefix}_${suffix}`] = section[field] ?? '';
    }
    if (s.speech.volcengine.apiKey === null || !!s.speech.volcengine.apiKey) {
      delete env.VOLCENGINE_TTS_APP_ID;
      delete env.VOLCENGINE_TTS_ACCESS_TOKEN;
    }
    return env;
  }
  async get(): Promise<AppSettings> {
    return this.publicSettings(await this.load());
  }
  private publicSettings(s: Saved): AppSettings {
    const e = this.deriveEnv(s);
    const provider = e.TIMO_PROVIDER || 'openai';
    const key =
      e.TIMO_API_KEY ||
      e[
        (
          {
            openai: 'OPENAI_API_KEY',
            anthropic: 'ANTHROPIC_API_KEY',
            google: 'GEMINI_API_KEY',
            deepseek: 'DEEPSEEK_API_KEY',
          } as Record<string, string>
        )[provider]
      ];
    return {
      revision: s.revision,
      production: {
        videoPipeline: resolveVideoPipeline(s.production.videoPipeline, e),
      },
      model: {
        provider,
        model: e.TIMO_MODEL || '',
        baseUrl: e.TIMO_BASE_URL || '',
        protocol: e.TIMO_PROTOCOL === 'anthropic' ? 'anthropic' : 'openai',
        apiKeyConfigured: !!key,
      },
      reviewer: {
        enabled: e.TIMO_REVIEW_ENABLED === 'true',
        provider: e.TIMO_REVIEW_PROVIDER || 'openai',
        model: e.TIMO_REVIEW_MODEL || '',
        baseUrl: e.TIMO_REVIEW_BASE_URL || '',
        protocol:
          e.TIMO_REVIEW_PROTOCOL === 'anthropic' ? 'anthropic' : 'openai',
        apiKeyConfigured: !!e.TIMO_REVIEW_API_KEY,
      },
      speech: {
        volcengine: {
          apiKeyConfigured: !!(
            e.VOLCENGINE_TTS_API_KEY ||
            (e.VOLCENGINE_TTS_APP_ID && e.VOLCENGINE_TTS_ACCESS_TOKEN)
          ),
          voice:
            e.VOLCENGINE_TTS_VOICE_ID || 'zh_male_yuanboxiaoshu_uranus_bigtts',
          resourceId: e.VOLCENGINE_TTS_RESOURCE_ID || '',
        },
        elevenlabs: {
          apiKeyConfigured: !!e.ELEVENLABS_API_KEY,
          voice: e.ELEVENLABS_VOICE_ID || '',
        },
      },
    };
  }
  update(update: SettingsUpdate): Promise<AppSettings> {
    const task = this.pending.then(async () => {
      const validated = settingsUpdateSchema.safeParse(update);
      if (!validated.success) throw new Error('SETTINGS_INVALID');
      update = validated.data;
      const s = await this.load();
      if (update.revision !== s.revision) throw new Error('SETTINGS_CONFLICT');
      if (update.production?.videoPipeline)
        s.production.videoPipeline = update.production.videoPipeline;
      const merge = (
        target: Record<string, string | null>,
        source: object | undefined,
        allowed: string[],
      ) => {
        for (const [k, v] of Object.entries(source || {})) {
          if (
            !allowed.includes(k) ||
            !(typeof v === 'string' || (k === 'apiKey' && v === null))
          )
            throw new Error('SETTINGS_INVALID');
          if (typeof v === 'string' && (v.length > 4096 || /[\r\n\0]/.test(v)))
            throw new Error('SETTINGS_INVALID');
          if (k === 'apiKey' && v === '') continue;
          if (k === 'protocol' && !['openai', 'anthropic'].includes(v!))
            throw new Error('SETTINGS_INVALID');
          if (k === 'baseUrl' && v) {
            const u = new URL(v);
            if (
              !['https:', 'http:'].includes(u.protocol) ||
              u.username ||
              u.password ||
              u.search ||
              u.hash
            )
              throw new Error('SETTINGS_INVALID');
          }
          target[k] = v;
        }
      };
      merge(s.model, update.model, Object.keys(fields));
      if (update.reviewer) {
        const { enabled, ...model } = update.reviewer;
        s.reviewer ??= {};
        merge(
          s.reviewer as Record<string, string | null>,
          model,
          Object.keys(fields),
        );
        if (enabled !== undefined) s.reviewer.enabled = enabled;
      }
      merge(s.speech.volcengine, update.speech?.volcengine, [
        'apiKey',
        'voice',
        'resourceId',
      ]);
      merge(s.speech.elevenlabs, update.speech?.elevenlabs, [
        'apiKey',
        'voice',
      ]);
      s.revision++;
      await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
      const temp = this.path + '.' + randomUUID();
      try {
        await writeFile(temp, JSON.stringify(s), { mode: 0o600, flag: 'wx' });
        await rename(temp, this.path);
      } finally {
        await rm(temp, { force: true });
      }
      return this.publicSettings(s);
    });
    this.pending = task.catch(() => {});
    return task;
  }
}
