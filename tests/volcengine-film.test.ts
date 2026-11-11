import { expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { narrateFilm } from '../packages/speech/src/film.js';
import type { Production } from '../packages/contracts/src/production.js';
it('火山流式音频接入实际 PCM/字幕流水线，相同句子复用缓存（无付费请求）', async () => {
  const root = await mkdtemp(join(tmpdir(), 'timo-volc-'));
  // A real PCM WAV fixture returned by the test-only HTTP boundary; runtime never contains fixtures.
  const samples = 4800,
    wav = Buffer.alloc(44 + samples * 2);
  wav.write('RIFF');
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(24000, 24);
  wav.writeUInt32LE(48000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++)
    wav.writeInt16LE(
      Math.round(5000 * Math.sin((i / 24000) * 2 * Math.PI * 440)),
      44 + i * 2,
    );
  let calls = 0;
  vi.stubEnv('VOLCENGINE_TTS_API_KEY', 'test-only');
  vi.stubGlobal('fetch', async () => {
    calls++;
    return new Response(
      JSON.stringify({ code: 20000000, data: wav.toString('base64') }),
    );
  });
  const production: Production = {
    projectId: 'test',
    revision: 1,
    aspectRatio: '16:9',
    stage: 'narrating',
    brief: {
      topic: '测试',
      materials: '',
      durationSec: 15,
      language: 'zh',
      style: 'warm',
      voiceProvider: 'volcengine',
      voice: '',
    },
    scenes: [
      {
        id: 'p01',
        title: '测试',
        visual: '测试',
        beats: ['变化'],
        cues: [
          { id: 'c0', text: '你好' },
          { id: 'c1', text: '你好' },
        ],
      },
    ],
    artifacts: {},
    events: [],
  };
  try {
    const p = await narrateFilm({ production, root });
    expect(calls).toBe(1);
    expect(p.durationMs).toBe(400);
    expect(p.scenes[0].cues[1].startMs).toBe(200);
    expect(
      (await readFile(join(root, p.artifacts.audio!))).toString('ascii', 0, 4),
    ).toBe('RIFF');
    expect(
      await readFile(join(root, p.artifacts.subtitles!), 'utf8'),
    ).toContain('00:00:00,200 --> 00:00:00,400');
    const revised = structuredClone(p);
    revised.scenes[0].cues[1].text = '新的句子';
    revised.scenes[0].cues[1].audioKey = undefined;
    revised.scenes[0].cues[1].startMs = undefined;
    revised.scenes[0].cues[1].endMs = undefined;
    const next = await narrateFilm({ production: revised, root });
    expect(next.artifacts.audio).not.toBe(p.artifacts.audio);
    expect(next.artifacts.subtitles).not.toBe(p.artifacts.subtitles);
    expect(
      await readFile(join(root, p.artifacts.subtitles!), 'utf8'),
    ).not.toContain('新的句子');
    expect(calls).toBe(2);
  } finally {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    await rm(root, { recursive: true, force: true });
  }
});
