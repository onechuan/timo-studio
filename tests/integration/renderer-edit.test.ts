import { spawn } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { expect, it } from 'vitest';
import {
  buildEditFilter,
  renderEditedFilm,
  toEditSrt,
} from '../../packages/renderer/src/edit.js';
import {
  deriveEditTimeline,
  type EditClip,
  type EditSource,
  type Production,
} from '../../packages/contracts/src/index.js';

const binary =
  process.env.FFMPEG_PATH ||
  (createRequire(import.meta.url)(
    '../../packages/renderer/node_modules/ffmpeg-static',
  ) as string);
function run(args: string[]) {
  return new Promise<Buffer>((resolve, reject) => {
    const child = spawn(binary, args);
    const stdout: Buffer[] = [];
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => {
      stderr = (stderr + chunk).slice(-4000);
    });
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0
        ? resolve(Buffer.concat(stdout))
        : reject(new Error(stderr || `ffmpeg ${code}`)),
    );
  });
}
function rms(samples: Buffer) {
  let sum = 0;
  const count = Math.floor(samples.length / 2);
  for (let i = 0; i < count; i++) {
    const value = samples.readInt16LE(i * 2) / 32768;
    sum += value * value;
  }
  return Math.sqrt(sum / Math.max(1, count));
}

const clips: EditClip[] = [
  { id: 'blue', sourceInMs: 2000, sourceOutMs: 3000, volume: 1, muted: false },
  { id: 'red', sourceInMs: 0, sourceOutMs: 1000, volume: 1, muted: true },
  {
    id: 'green',
    sourceInMs: 1000,
    sourceOutMs: 1500,
    volume: 0.5,
    muted: false,
  },
];
const source: EditSource = {
  videoKey: 'production/edit-project/r0/video.mp4',
  durationMs: 3000,
  fps: 12,
  cues: [
    { id: 'c1', text: '红色', startMs: 0, endMs: 1000 },
    { id: 'c2', text: '绿色', startMs: 1000, endMs: 2000 },
    { id: 'c3', text: '蓝色', startMs: 2000, endMs: 3000 },
  ],
};

it('builds a frame-accurate trim and padded audiovisual concat', () => {
  const timeline = deriveEditTimeline(source, clips);
  const filter = buildEditFilter(timeline, 12);
  expect(filter).toContain(
    '[0:v]trim=start_frame=24:end_frame=36,setpts=PTS-STARTPTS[v0]',
  );
  expect(filter).toContain(
    '[0:a]atrim=start=2.000000:end=3.000000,asetpts=PTS-STARTPTS,volume=1,apad,atrim=end=1.000000',
  );
  expect(filter).toContain('volume=0,apad');
  expect(filter).toContain(
    '[v0][a0][v1][a1][v2][a2]concat=n=3:v=1:a=1[vout][aout]',
  );
  expect(toEditSrt(timeline.subtitles)).toContain(
    '00:00:01,000 --> 00:00:02,000\n红色',
  );
});

it.skipIf(process.env.RUN_INTEGRATION !== '1')(
  'cuts, reorders, mutes and trims a real 12fps film',
  async () => {
    const root = await mkdtemp(join(tmpdir(), 'timotv-edit-'));
    try {
      const directory = join(root, 'production/edit-project/r0');
      await mkdir(directory, { recursive: true });
      const sourcePath = join(root, source.videoKey);
      await run([
        '-y',
        '-nostdin',
        '-f',
        'lavfi',
        '-i',
        'color=c=red:s=64x36:r=12:d=1',
        '-f',
        'lavfi',
        '-i',
        'color=c=green:s=64x36:r=12:d=1',
        '-f',
        'lavfi',
        '-i',
        'color=c=blue:s=64x36:r=12:d=1',
        '-f',
        'lavfi',
        '-i',
        'sine=frequency=440:duration=1',
        '-f',
        'lavfi',
        '-i',
        'sine=frequency=880:duration=1',
        '-f',
        'lavfi',
        '-i',
        'sine=frequency=1320:duration=1',
        '-filter_complex',
        '[0:v][1:v][2:v]concat=n=3:v=1:a=0[v];[3:a][4:a][5:a]concat=n=3:v=0:a=1[a]',
        '-map',
        '[v]',
        '-map',
        '[a]',
        '-r',
        '12',
        '-pix_fmt',
        'yuv420p',
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-shortest',
        sourcePath,
      ]);

      const production = {
        projectId: 'edit-project',
        revision: 0,
        stage: 'rendering',
        durationMs: 3000,
        artifacts: { video: source.videoKey },
        scenes: [
          {
            id: 's',
            title: '测试',
            visual: '测试',
            beats: ['测试'],
            cues: source.cues,
          },
        ],
        edit: {
          source,
          ...deriveEditTimeline(source, clips),
        },
        events: [],
      } as unknown as Production;
      const rendered = await renderEditedFilm({ production, root });
      expect(rendered.edit?.output).toMatchObject({
        videoKey: 'production/edit-project/r0/edit.mp4',
        subtitlesKey: 'production/edit-project/r0/edit.srt',
        durationMs: 2500,
      });
      const video = await readFile(join(root, rendered.edit!.output!.videoKey));
      expect(video.subarray(4, 8).toString('ascii')).toBe('ftyp');
      const srt = await readFile(
        join(root, rendered.edit!.output!.subtitlesKey),
        'utf8',
      );
      expect(srt).toContain('00:00:00,000 --> 00:00:01,000\n蓝色');
      expect(srt).toContain('00:00:01,000 --> 00:00:02,000\n红色');
      expect(srt).toContain('00:00:02,000 --> 00:00:02,500\n绿色');

      const pixels = await run([
        '-i',
        join(root, rendered.edit!.output!.videoKey),
        '-vf',
        'scale=1:1',
        '-f',
        'rawvideo',
        '-pix_fmt',
        'rgb24',
        '-',
      ]);
      expect(pixels.length).toBe(30 * 3);
      const pixel = (frame: number) =>
        [
          pixels[frame * 3],
          pixels[frame * 3 + 1],
          pixels[frame * 3 + 2],
        ] as const;
      const blue = pixel(6);
      expect(blue[2]).toBeGreaterThan(150);
      expect(blue[0]).toBeLessThan(100);
      const red = pixel(18);
      expect(red[0]).toBeGreaterThan(150);
      expect(red[1]).toBeLessThan(100);
      const green = pixel(27);
      expect(green[1]).toBeGreaterThan(120);
      expect(green[0]).toBeLessThan(100);

      const audio = await run([
        '-i',
        join(root, rendered.edit!.output!.videoKey),
        '-vn',
        '-f',
        's16le',
        '-ac',
        '1',
        '-ar',
        '8000',
        '-',
      ]);
      const at = (startSec: number, endSec: number) =>
        rms(
          audio.subarray(
            Math.floor(startSec * 16000),
            Math.floor(endSec * 16000),
          ),
        );
      const first = at(0.15, 0.85);
      const muted = at(1.15, 1.85);
      const quiet = at(2.15, 2.45);
      expect(first).toBeGreaterThan(0.05);
      expect(muted).toBeLessThan(0.01);
      expect(first).toBeGreaterThan(muted * 10);
      expect(quiet).toBeGreaterThan(muted * 2);

      const names = await readdir(directory);
      expect(names).toEqual(
        expect.arrayContaining(['video.mp4', 'edit.mp4', 'edit.srt']),
      );
      expect(
        names.filter(
          (name) => name.startsWith('edit-') || name.includes('.tmp'),
        ),
      ).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);
