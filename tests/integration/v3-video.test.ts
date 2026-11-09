import { expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Production } from '../../packages/contracts/src/index.js';
import { renderFilm } from '../../packages/renderer/src/film.js';
import { hashProgramSource } from '../../packages/renderer/src/program.js';

function silentWav(durationMs: number, sampleRate = 16_000): Buffer {
  const samples = Math.ceil((durationMs * sampleRate) / 1000);
  const dataSize = samples * 2;
  const wav = Buffer.alloc(44 + dataSize);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + dataSize, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(dataSize, 40);
  return wav;
}

it.skipIf(process.env.RUN_INTEGRATION !== '1')(
  'encodes a measured V3 drawing program and audio into a real MP4',
  async () => {
    const root = await mkdtemp(join(tmpdir(), 'timo-v3-video-'));
    try {
      const audio = 'production/v3-video/r1/audio.wav';
      await mkdir(join(root, 'production/v3-video/r1'), { recursive: true });
      await writeFile(join(root, audio), silentWav(2000));
      const source =
        "TIMO.visual('p01', P => { P.title('第一性原理', { accent: 'yellow' }); const t0=P.c(0), t1=P.c(1); P.ring(720, 540, 420, 420, { at: t0, color: 'yellow' }); P.text('假设', { x: 630, y: 485, size: 72, at: t0 }); P.arrow(950, 540, 1270, 540, { at: t1, color: 'green' }); P.text('事实', { x: 1320, y: 485, size: 72, at: t1, color: 'green' }); });";
      const production: Production = {
        projectId: 'v3-video',
        revision: 1,
        stage: 'ready',
        aspectRatio: '16:9',
        brief: {
          topic: '第一性原理',
          materials: '',
          durationSec: 15,
          language: 'zh',
          style: 'chalk',
          voiceProvider: 'local',
          voice: '',
        },
        durationMs: 2000,
        timingSource: 'audio-per-cue',
        scenes: [
          {
            id: 'p01',
            title: '第一性原理',
            visual: '假设转化为事实',
            beats: ['假设', '事实'],
            cues: [
              {
                id: 'q1',
                text: '先拆开假设。',
                startMs: 0,
                endMs: 1000,
              },
              {
                id: 'q2',
                text: '再从事实重构。',
                startMs: 1000,
                endMs: 2000,
              },
            ],
            artwork: {
              version: 3,
              runtime: 'timotv-dsl-1',
              intent: '从假设到事实的方向转换',
              source,
              sourceHash: hashProgramSource(source),
              style: 'chalkboard',
              extras: [],
            },
          },
        ],
        artifacts: { audio },
        events: [],
      };
      const rendered = await renderFilm({ production, root });
      const path = join(root, rendered.artifacts.video!);
      expect((await stat(path)).size).toBeGreaterThan(10_000);
      const header = await readFile(path);
      expect(header.subarray(4, 8).toString()).toBe('ftyp');
      expect(rendered.artifacts.preview).toBe(
        'production/v3-video/r1/preview.html',
      );
      expect(rendered.artifacts.video).toBe(
        'production/v3-video/r1/video.mp4',
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  60_000,
);
