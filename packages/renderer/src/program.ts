import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import {
  drawingStyleSchema,
  type DrawingStyle,
  type FilmKitState,
} from '@timotv/contracts';

const require = createRequire(import.meta.url);
const engineRoot = dirname(
  require.resolve('@timotv/drawing-engine/package.json'),
);
const engineRequire = createRequire(join(engineRoot, 'package.json'));
const runtimeFiles = [
  'runtime/look.js',
  'runtime/timing.js',
  'runtime/core.js',
  'runtime/text.js',
  'runtime/doodles.js',
  'runtime/widgets.js',
  'runtime/live.js',
  'runtime/tokens.js',
  'runtime/shell3d.js',
  'runtime/three.js',
  'runtime/media.js',
] as const;
const componentIds = new Set(
  readdirSync(join(engineRoot, 'lib'))
    .filter((name) => name.endsWith('.js'))
    .map((name) => name.slice(0, -3)),
);
const cache = new Map<string, DrawingEngineAssets>();

export interface DrawingEngineAssets {
  css: string;
  scripts: string[];
}

const scriptSafe = (source: string) =>
  source.replace(/<\/script/gi, '<\\/script');
const styleSafe = (source: string) => source.replace(/<\/style/gi, '<\\/style');
const read = (...parts: string[]) =>
  readFileSync(join(engineRoot, ...parts), 'utf8');

export function hashProgramSource(source: string): string {
  return createHash('sha256').update(source, 'utf8').digest('hex');
}

export function validateProgramSource(sceneId: string, source: string): void {
  const unsafe = () => {
    throw new Error('Unsafe drawing program');
  };
  if (
    !/^[a-zA-Z0-9_-]{1,80}$/.test(sceneId) ||
    !source.trim() ||
    Buffer.byteLength(source, 'utf8') > 100_000 ||
    /<\/script/i.test(source)
  )
    unsafe();
  const forbidden =
    /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|Worker|SharedWorker|importScripts|eval|Function|window|document|globalThis|self|parent|top|opener|localStorage|sessionStorage|indexedDB|caches|navigator|location|history|open|postMessage|ENGINE|constructor|__proto__|prototype)\b|\bimport\s*\(/i;
  if (forbidden.test(source)) unsafe();
  const registrations = source.match(/\bTIMO\s*\.\s*visual\s*\(/g) ?? [];
  if (registrations.length !== 1) unsafe();
  const escaped = sceneId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (
    !new RegExp(
      `\\bTIMO\\s*\\.\\s*visual\\s*\\(\\s*(['"])${escaped}\\1\\s*,`,
    ).test(source)
  )
    unsafe();
}

export function validateFilmKitSource(kit: FilmKitState): string {
  const source = kit.source;
  if (
    !source ||
    !kit.sourceHash ||
    hashProgramSource(source) !== kit.sourceHash ||
    Buffer.byteLength(source, 'utf8') > 300_000 ||
    /<\/script/i.test(source)
  )
    throw new Error('Invalid Film Kit source');
  const forbidden =
    /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|Worker|SharedWorker|importScripts|eval|window|document|globalThis|self|parent|top|opener|localStorage|sessionStorage|indexedDB|caches|navigator|location|history|open|postMessage|process|require|module|exports)\b|\bimport\s*\(/i;
  if (
    forbidden.test(source) ||
    /\bFunction\s*\(|__proto__|\bconstructor\b|\bB\s*\[/.test(source) ||
    /(?:https?|file|data):|\.\.[/\\]/i.test(source)
  )
    throw new Error('Invalid Film Kit source');
  const expected = kit.components
    .filter((component) => ['checking', 'passed'].includes(component.status))
    .map((component) => component.name)
    .sort();
  const actual = [...source.matchAll(/\bB\.(\w+)\s*=\s*function\b/g)]
    .map((match) => match[1]!)
    .sort();
  if (
    !source.includes('PV.Builder.prototype') ||
    expected.length === 0 ||
    actual.join('|') !== expected.join('|')
  )
    throw new Error('Invalid Film Kit source');
  return source;
}

export function drawingEngineAssets(
  style: DrawingStyle | string,
  extras: string[],
): DrawingEngineAssets {
  const safeStyle = drawingStyleSchema.parse(style);
  if (
    extras.length > 32 ||
    extras.some(
      (id) => !/^[a-z0-9][a-z0-9-]{0,79}$/.test(id) || !componentIds.has(id),
    )
  )
    throw new Error('Unknown drawing component');
  const ids = [...new Set(extras)].sort();
  const key = `${safeStyle}:${ids.join(',')}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const roughPath = engineRequire.resolve('roughjs/bundled/rough.js');
  const kit = join(engineRoot, 'styles', safeStyle, 'kit.js');
  const scripts = [
    readFileSync(roughPath, 'utf8'),
    read('styles', safeStyle, 'style.js'),
    ...runtimeFiles.map((file) => read(file)),
    ...(existsSync(kit) ? [readFileSync(kit, 'utf8')] : []),
    ...ids.map((id) => read('lib', `${id}.js`)),
    // The engine snapshots Builder.prototype on the first build. Style kits and
    // optional components must therefore be installed before it is initialized.
    read('runtime', 'engine.js'),
  ].map(scriptSafe);
  const result = {
    css: styleSafe(
      `${read('runtime', 'base.css')}\n${read('styles', safeStyle, 'style.css')}`,
    ),
    scripts,
  };
  cache.set(key, result);
  return result;
}
