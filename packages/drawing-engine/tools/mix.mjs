// Full sound track for episodes with sound effects / music (page.sfx, see TIMING.sfxTimes): narration + sfx beds → one
// 48 kHz stereo raw float file. `duck` (dB) lowers a bed while someone is speaking. render.mjs loudness-normalizes the result.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { FFMPEG } from './bins.mjs';

const SR = 48000;
const cache = new Map();
/** file → Float32Array interleaved stereo at 48 kHz (rate ≠ 1 resamples, which also shifts pitch, like a tape) */
function decode(f, rate = 1) {
  const k = f + '@' + rate;
  if (!cache.has(k)) {
    const af = rate === 1 ? [] : ['-af', `asetrate=${Math.round(SR * rate)},aresample=${SR}`];
    const b = execFileSync(FFMPEG, ['-loglevel', 'error', '-protocol_whitelist', 'file,pipe', '-i', f, ...af, '-f', 'f32le', '-ac', '2', '-ar', String(SR), '-'], { maxBuffer: 1 << 30 });
    cache.set(k, new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)));
  }
  return cache.get(k);
}
const db = (x) => Math.pow(10, x / 20);

export function mixTrack(TIMING, L, from, to, outRaw, epDir) {
  const n = Math.ceil((to - from) * SR), mix = new Float32Array(n * 2), voice = new Float32Array(n);
  for (const c of L.pages.flatMap((p) => p.cues).filter((c) => c.audio)) {
    const clip = decode(path.join(epDir, c.audio)), at = Math.round(((c.audioAt ?? c.start) - from) * SR);
    for (let i = 0; i < clip.length / 2; i++) {
      const j = at + i;
      if (j < 0 || j >= n) continue;
      mix[2 * j] += clip[2 * i]; mix[2 * j + 1] += clip[2 * i + 1]; voice[j] += Math.abs(clip[2 * i]);
    }
  }
  // speech envelope for ducking: 20 ms windows, fast attack / slow release, 0..1
  const W = SR / 50, env = new Float32Array(Math.ceil(n / W));
  let e = 0;
  for (let w = 0; w < env.length; w++) {
    let s = 0;
    for (let i = w * W; i < Math.min(n, (w + 1) * W); i++) s += voice[i];
    const on = s / W > 0.01 ? 1 : 0;
    e = on > e ? e + (on - e) * 0.5 : e + (on - e) * 0.06;
    env[w] = e;
  }
  for (const s of TIMING.sfxTimes(L)) {
    const clip = decode(path.join(epDir, s.f), s.rate), len = clip.length / 2;
    const t0 = s.t0 - from, off = Math.round(s.from * SR);
    const t1 = s.t1 != null ? s.t1 - from : s.loop ? to - from : t0 + (len - off) / SR;
    const a = Math.max(0, Math.round(t0 * SR)), b = Math.min(n, Math.round(t1 * SR)), g = db(s.vol);
    for (let j = a; j < b; j++) {
      let i = j - Math.round(t0 * SR) + off;
      if (s.loop) i %= len; else if (i >= len) break;
      const tt = j / SR;
      let k = g;
      if (s.fin > 0) k *= Math.min(1, (tt - t0) / s.fin);
      if (s.fout > 0) k *= Math.min(1, (t1 - tt) / s.fout);
      if (s.duck) k *= db(-s.duck * env[Math.floor(j / W)]);
      mix[2 * j] += clip[2 * i] * k; mix[2 * j + 1] += clip[2 * i + 1] * k;
    }
  }
  let peak = 0;
  for (let i = 0; i < mix.length; i++) peak = Math.max(peak, Math.abs(mix[i]));
  if (peak > 0.98) for (let i = 0; i < mix.length; i++) mix[i] *= 0.98 / peak;   // loudnorm sets the level afterwards
  fs.writeFileSync(outRaw, Buffer.from(mix.buffer));
  return { SR, channels: 2 };
}
