import { filmHtml, validateFilmTiming } from './preview.js';
import type { Production } from '@timotv/contracts';
import { projectAudioKey } from './media.js';
import { mkdir, writeFile, rm, access, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright-core';
import ffmpeg from 'ffmpeg-static';
export interface FilmInput {
  production: Production;
  root: string;
  signal?: AbortSignal;
  onProgress?: (message: string) => void;
}
export function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
}
export function locateCue(
  cues: { startMs?: number; endMs?: number }[],
  t: number,
) {
  return cues.findIndex(
    (q) => q.startMs !== undefined && q.startMs <= t && q.endMs! > t,
  );
}
function prefix(p: Production) {
  if (
    !/^[\w-]+$/.test(p.projectId) ||
    !Number.isInteger(p.revision) ||
    p.revision < 0
  )
    throw new Error('Invalid identity');
  return `production/${p.projectId}/r${p.revision}`;
}
export { filmHtml, validateFilmTiming } from './preview.js';
export async function composeFilm({
  production,
  root,
  signal,
}: FilmInput): Promise<Production> {
  signal?.throwIfAborted();
  validateFilmTiming(production);
  if (
    !Number.isFinite(production.durationMs) ||
    production.durationMs! <= 0 ||
    production.durationMs! > 1200000 ||
    !projectAudioKey(production)
  )
    throw new Error('Measured narration required');
  const key = `${prefix(production)}/preview.html`;
  await mkdir(join(root, prefix(production)), { recursive: true });
  await writeFile(join(root, key), filmHtml(production));
  return {
    ...production,
    artifacts: { ...production.artifacts, preview: key },
  };
}
export async function renderFilm(input: FilmInput): Promise<Production> {
  const { root, signal, onProgress } = input;
  const p = await composeFilm(input);
  projectAudioKey(p);
  const frames = join(root, prefix(p), 'frames');
  await mkdir(frames, { recursive: true });
  const fps = 12,
    count = Math.ceil((p.durationMs! * fps) / 1000);
  if (count > 14400) throw new Error('Video exceeds frame limit');
  let executablePath = process.env.CHROME_PATH;
  for (const path of [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ]) {
    if (executablePath) break;
    try {
      await access(path);
      executablePath = path;
    } catch {}
  }
  if (!executablePath) throw new Error('Chrome not found; set CHROME_PATH');
  const videoFile = join(root, prefix(p), 'video.mp4');
  const pendingVideo = join(root, prefix(p), `video-${randomUUID()}.tmp.mp4`);
  const browser = await chromium.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage({
      viewport:
        p.aspectRatio === '9:16'
          ? { width: 1080, height: 1920 }
          : { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    });
    await page.setContent(filmHtml(p, { controls: false }));
    await page.evaluate(() => (window as any).__ready);
    await page.evaluate(() => {
      (window as any).requestAnimationFrame = () => 0;
    });
    for (let i = 0; i < count; i++) {
      signal?.throwIfAborted();
      await page.evaluate((t) => (window as any).renderAt(t), (i * 1000) / fps);
      await page.screenshot({
        path: join(frames, `${String(i).padStart(6, '0')}.png`),
      });
      if (i % 120 === 0) onProgress?.(`渲染 ${i}/${count}`);
    }
    const key = `${prefix(p)}/video.mp4`;
    await new Promise<void>((resolve, reject) => {
      const child = spawn(
        process.env.FFMPEG_PATH || (ffmpeg as unknown as string),
        [
          '-y',
          '-framerate',
          String(fps),
          '-i',
          join(frames, '%06d.png'),
          '-i',
          join(root, p.artifacts.audio!),
          '-c:v',
          'libx264',
          '-pix_fmt',
          'yuv420p',
          '-c:a',
          'aac',
          '-shortest',
          '-movflags',
          '+faststart',
          pendingVideo,
        ],
        { signal },
      );
      let err = '';
      child.stderr.on('data', (b) => (err = (err + b).slice(-3000)));
      child.on('error', reject);
      child.on('close', (c) => (c === 0 ? resolve() : reject(new Error(err))));
    });
    await rename(pendingVideo, videoFile);
    return { ...p, artifacts: { ...p.artifacts, video: key } };
  } catch (error) {
    await rm(pendingVideo, { force: true });
    throw error;
  } finally {
    await browser.close();
    await rm(frames, { recursive: true, force: true });
  }
}
