import { randomUUID } from 'node:crypto';
export const DEFAULT_VOLCENGINE_VOICE = 'zh_male_yuanboxiaoshu_uranus_bigtts';
export function volcengineResource(voice: string) {
  if (voice.startsWith('S_')) return 'seed-icl-2.0';
  return /_(moon|mars|saturn)_/.test(voice) ? 'seed-tts-1.0' : 'seed-tts-2.0';
}
export async function synthesizeVolcengine(
  text: string,
  voice: string,
  options: {
    env?: NodeJS.ProcessEnv;
    fetcher?: typeof fetch;
    signal?: AbortSignal;
  } = {},
): Promise<Buffer> {
  const env = options.env ?? process.env;
  const key = env.VOLCENGINE_TTS_API_KEY?.trim();
  const legacy = key ? /^(\d+):(\S+)$/.exec(key) : null;
  const appId = legacy?.[1] || env.VOLCENGINE_TTS_APP_ID;
  const accessKey = legacy?.[2] || env.VOLCENGINE_TTS_ACCESS_TOKEN;
  if (!key && !(appId && accessKey))
    throw new Error('火山 TTS 未配置：请设置 VOLCENGINE_TTS_API_KEY');
  const auth: Record<string, string> =
    appId && accessKey
      ? { 'X-Api-App-Id': appId, 'X-Api-Access-Key': accessKey }
      : { 'X-Api-Key': key! };
  const signal = options.signal
    ? AbortSignal.any([options.signal, AbortSignal.timeout(90000)])
    : AbortSignal.timeout(90000);
  const res = await (options.fetcher ?? fetch)(
    'https://openspeech.bytedance.com/api/v3/tts/unidirectional',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...auth,
        'X-Api-Resource-Id':
          env.VOLCENGINE_TTS_RESOURCE_ID || volcengineResource(voice),
        'X-Api-Request-Id': randomUUID(),
      },
      body: JSON.stringify({
        req_params: {
          text,
          speaker: voice,
          audio_params: {
            format: 'mp3',
            sample_rate: 24000,
            speech_rate: 0,
            enable_subtitle: true,
          },
        },
      }),
      signal,
    },
  );
  if (!res.ok) {
    await res.body?.cancel();
    throw new Error(
      `火山 TTS 请求失败（HTTP ${res.status}），请检查 Key、服务权限和配额`,
    );
  }
  // HTTP chunked transport boundaries do not equal JSON record boundaries.
  if (!res.body) throw new Error('火山 TTS 未返回音频');
  const decoder = new TextDecoder(),
    chunks: Buffer[] = [];
  let pending = '',
    total = 0;
  const parse = (line: string) => {
    if (!line.trim()) return;
    let value: { code?: number; data?: unknown };
    try {
      value = JSON.parse(line);
    } catch {
      throw new Error('火山 TTS 响应格式无效');
    }
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error('火山 TTS 响应格式无效');
    if (value.code !== undefined && value.code !== 0 && value.code !== 20000000)
      throw new Error(
        `火山 TTS 合成失败（code=${Number(value.code)}），请检查音色与资源是否匹配`,
      );
    // Subtitle and terminal frames carry data: null; only audio frames contain base64.
    if (value.data != null && value.data !== '') {
      if (
        typeof value.data !== 'string' ||
        !/^[A-Za-z0-9+/]*={0,2}$/.test(value.data)
      )
        throw new Error('火山 TTS 音频格式无效');
      chunks.push(Buffer.from(value.data, 'base64'));
    }
  };
  const reader = res.body.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 16 * 1024 * 1024) throw new Error('火山 TTS 单句响应过大');
      pending += decoder.decode(value, { stream: true });
      let end: number;
      while ((end = pending.indexOf('\n')) !== -1) {
        parse(pending.slice(0, end));
        pending = pending.slice(end + 1);
      }
    }
    pending += decoder.decode();
    parse(pending);
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  const audio = Buffer.concat(chunks);
  if (!audio.length) throw new Error('火山 TTS 未返回有效音频');
  return audio;
}
