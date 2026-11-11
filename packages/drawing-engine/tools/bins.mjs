// Where the external binaries come from. Studio passes explicit paths through the environment; standalone use falls
// back to the bundled ffmpeg-static and to a Chrome-family browser already installed on the machine.
import fs from 'fs';
import { spawnSync } from 'child_process';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const tryRequire = (id) => { try { return require(id); } catch { return null; } };

export const FFMPEG = process.env.FFMPEG_PATH || tryRequire('ffmpeg-static') || 'ffmpeg';

/** --hw's H.264 encoder: the Mac's media engine, elsewhere an NVIDIA card's (NVENC; a render box with a GPU) */
export const HW_ENCODE = process.platform === 'darwin' ? ['-c:v', 'h264_videotoolbox', '-q:v', '72'] : ['-c:v', 'h264_nvenc', '-preset', 'p4', '-rc', 'constqp', '-qp', '18'];

/** Duration (s) and picture size of a media file, read from what `ffmpeg -i` prints (no ffprobe needed). */
export function probe(file) {
  const out = spawnSync(FFMPEG, ['-hide_banner', '-protocol_whitelist', 'file,pipe', '-i', file], { encoding: 'utf8' }).stderr || '';
  const d = /Duration: (\d+):(\d+):([\d.]+)/.exec(out);
  if (!d) throw new Error(`cannot read ${file}: ${out.trim().split('\n').pop()}`);
  const v = /Stream #[^\n]*Video:[^\n]*?(\d{2,5})x(\d{2,5})/.exec(out);
  return { duration: +d[1] * 3600 + +d[2] * 60 + +d[3], width: v ? +v[1] : 0, height: v ? +v[2] : 0 };
}

const CHROME_CANDIDATES = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/local/bin/chromium', '/usr/bin/microsoft-edge'],
  win32: [
    path.join(process.env['PROGRAMFILES'] || 'C:\\Program Files', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe'),
    path.join(os.homedir(), 'AppData/Local/Google/Chrome/Application/chrome.exe'),
  ],
};

/** A Chrome-family executable: CHROME_PATH, else the first installed browser, else undefined (Playwright's own Chromium). */
export function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  return (CHROME_CANDIDATES[process.platform] || []).find((p) => fs.existsSync(p));
}
