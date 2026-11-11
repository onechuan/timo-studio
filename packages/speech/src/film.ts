import { createHash } from 'node:crypto';
import {
  mkdir,
  readFile,
  writeFile,
  access,
  copyFile,
  rename,
  rm,
} from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import {
  synthesizeVolcengine,
  DEFAULT_VOLCENGINE_VOICE,
  volcengineResource,
} from './tts/volcengine.js';
import type { Production, FilmCue } from '@timotv/contracts';
export interface FilmInput {
  env?: NodeJS.ProcessEnv;
  production: Production;
  root: string;
  signal?: AbortSignal;
  onProgress?: (message: string) => void;
}
export function voiceCacheKey(
  text: string,
  provider: string,
  voice: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  return createHash('sha256')
    .update(
      JSON.stringify([
        text.normalize('NFC'),
        provider,
        voice,
        provider === 'volcengine'
          ? `volc-v3-${env.VOLCENGINE_TTS_RESOURCE_ID || volcengineResource(voice)}`
          : provider === 'elevenlabs'
            ? 'eleven_multilingual_v2'
            : 'say-system-v1',
        'pcm-24000-v1',
      ]),
    )
    .digest('hex');
}
export function toSrt(cues: FilmCue[]) {
  const stamp = (n: number) =>
    new Date(n).toISOString().slice(11, 23).replace('.', ',');
  return cues
    .map(
      (q, i) =>
        `${i + 1}\n${stamp(q.startMs!)} --> ${stamp(q.endMs!)}\n${q.text}\n`,
    )
    .join('\n');
}
function wavDurationMs(buffer: Buffer): number | undefined {
  if (buffer.length < 44 || buffer.toString('ascii', 0, 4) !== 'RIFF') return;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const size = buffer.readUInt32LE(offset + 4);
    if (buffer.toString('ascii', offset, offset + 4) === 'data')
      return size > 0 ? Math.ceil(size / 48) : undefined;
    offset += 8 + size + (size % 2);
  }
}
async function run(command: string, args: string[], signal?: AbortSignal) {
  return new Promise<string>((resolve, reject) => {
    const p = spawn(command, args, { signal });
    let out = '';
    p.stderr.on('data', (b) => (out += b));
    p.stdout.on('data', (b) => (out += b));
    p.on('error', reject);
    p.on('close', (code) =>
      code === 0
        ? resolve(out)
        : reject(new Error(`${command} failed: ${out.slice(-2000)}`)),
    );
  });
}
export async function narrateFilm({
  env = process.env,
  production,
  root,
  signal,
  onProgress,
}: FilmInput): Promise<Production> {
  const p = structuredClone(production);
  if (!p.scenes.length) throw new Error('No approved script');
  if (
    !/^[\w-]+$/.test(p.projectId) ||
    !Number.isInteger(p.revision) ||
    p.revision < 0
  )
    throw new Error('Invalid production identity');
  const prefix = `production/${p.projectId}/r${p.revision}`;
  await mkdir(join(root, prefix), { recursive: true });
  const provider = p.brief.voiceProvider;
  const voice =
    provider === 'local'
      ? p.brief.voice || (p.brief.language === 'zh' ? 'Tingting' : 'Samantha')
      : provider === 'volcengine'
        ? p.brief.voice ||
          env.VOLCENGINE_TTS_VOICE_ID ||
          DEFAULT_VOLCENGINE_VOICE
        : p.brief.voice || env.ELEVENLABS_VOICE_ID || '';
  if (provider === 'elevenlabs' && (!voice || !env.ELEVENLABS_API_KEY))
    throw new Error('Missing ElevenLabs API key or voice ID');
  if (
    provider === 'volcengine' &&
    !(
      env.VOLCENGINE_TTS_API_KEY ||
      (env.VOLCENGINE_TTS_APP_ID && env.VOLCENGINE_TTS_ACCESS_TOKEN)
    )
  )
    throw new Error('火山 TTS 未配置：请设置 VOLCENGINE_TTS_API_KEY');
  if (provider === 'local') {
    if (process.platform !== 'darwin')
      throw new Error('Local voice requires macOS');
    const voices = await run('/usr/bin/say', ['-v', '?'], signal);
    if (
      !voices
        .split('\n')
        .some(
          (line) =>
            line.startsWith(voice + ' ') || line.startsWith(voice + '\t'),
        )
    )
      throw new Error('System voice unavailable: ' + voice);
  }
  const cacheDir = join(root, 'production', p.projectId, 'voice-cache');
  await mkdir(cacheDir, { recursive: true });
  let time = 0;
  const files: string[] = [];
  for (const q of p.scenes.flatMap((s) => s.cues)) {
    signal?.throwIfAborted();
    onProgress?.(`配音：${q.text.slice(0, 24)}`);
    const key = `${prefix}/${voiceCacheKey(q.text, p.brief.voiceProvider, voice, env)}.wav`;
    const file = join(root, key);
    const cached = join(
      cacheDir,
      voiceCacheKey(q.text, p.brief.voiceProvider, voice, env) + '.wav',
    );
    let cachedDuration: number | undefined;
    try {
      await access(cached);
      cachedDuration = wavDurationMs(await readFile(cached));
      if (!cachedDuration) await rm(cached, { force: true });
    } catch {}
    if (!cachedDuration) {
      const source = cached + '.source';
      const temp = cached + '.tmp.wav';
      try {
        if (p.brief.voiceProvider === 'local') {
          if (process.platform !== 'darwin')
            throw new Error('Local voice requires macOS; configure ElevenLabs');
          await run(
            '/usr/bin/say',
            ['-v', voice, '-o', source, '--file-format=AIFF', '--', q.text],
            signal,
          );
        } else if (provider === 'volcengine') {
          await writeFile(
            source,
            await synthesizeVolcengine(q.text, voice, { signal, env }),
          );
        } else {
          const api = env.ELEVENLABS_API_KEY;
          const v = p.brief.voice || env.ELEVENLABS_VOICE_ID;
          if (!api || !v)
            throw new Error('Missing ElevenLabs API key or voice ID');
          const r = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(v)}`,
            {
              method: 'POST',
              headers: {
                'xi-api-key': api,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: q.text,
                model_id: 'eleven_multilingual_v2',
              }),
              signal,
            },
          );
          if (!r.ok) throw new Error(`ElevenLabs ${r.status}`);
          await writeFile(source, Buffer.from(await r.arrayBuffer()));
        }
        await run(
          ffmpeg as unknown as string,
          [
            '-y',
            '-i',
            source,
            '-ar',
            '24000',
            '-ac',
            '1',
            '-c:a',
            'pcm_s16le',
            temp,
          ],
          signal,
        );
        await rename(temp, cached);
      } finally {
        await rm(source, { force: true });
        await rm(temp, { force: true });
      }
    }
    await copyFile(cached, file);
    const b = await readFile(file);
    const duration = wavDurationMs(b);
    if (!duration) throw new Error('Invalid synthesized WAV');
    q.audioKey = key;
    q.startMs = time;
    q.endMs = time + duration;
    time += duration;
    files.push(file);
  }
  // Each script/voice combination keeps its own mix and subtitles so that
  // duration correction can restore a better previous take safely.
  const take = createHash('sha256')
    .update(
      JSON.stringify(
        p.scenes.flatMap((s) => s.cues.map((c) => [c.id, c.text, c.audioKey])),
      ),
    )
    .digest('hex')
    .slice(0, 24);
  const list = join(root, prefix, `concat-${take}.txt`);
  await writeFile(
    list,
    files.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'),
  );
  const audio = `${prefix}/audio-${take}.wav`;
  try {
    await run(
      ffmpeg as unknown as string,
      [
        '-y',
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        list,
        '-c:a',
        'pcm_s16le',
        join(root, audio),
      ],
      signal,
    );
  } catch (error) {
    await rm(join(root, audio), { force: true });
    throw error;
  }
  const subtitles = `${prefix}/subtitles-${take}.srt`;
  await writeFile(
    join(root, subtitles),
    toSrt(p.scenes.flatMap((s) => s.cues)),
  );
  p.durationMs = time;
  p.timingSource = 'audio-per-cue';
  p.artifacts = { ...p.artifacts, audio, subtitles };
  return p;
}
