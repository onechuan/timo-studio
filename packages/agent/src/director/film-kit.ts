import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Type } from 'typebox';
import { z } from 'zod';

import {
  filmKitItemSchema,
  type DrawingStyle,
  type FilmKitItem,
  type Production,
} from '@timotv/contracts';
import type { JsonGenerator } from './index.js';

export const KIT_MIN_PAGES = 2;
export const KIT_MAX = 3;

const ENGINE_ROOT = fileURLToPath(
  new URL('../../../drawing-engine/', import.meta.url),
);
const upstreamManifestSource = readFileSync(
  join(ENGINE_ROOT, 'upstream.json'),
  'utf8',
);
const upstreamManifest = JSON.parse(upstreamManifestSource) as {
  revision: string;
};
export const FRAMETELL_UPSTREAM_REVISION = upstreamManifest.revision;
export const FRAMETELL_ENGINE_REVISION = `sha256:${createHash('sha256')
  .update(upstreamManifestSource, 'utf8')
  .digest('hex')}`;
const styleMap: Record<Production['brief']['style'], DrawingStyle> = {
  warm: 'warm-story',
  chalk: 'chalkboard',
  tech: 'tech-dark',
  brand: 'vector',
};
export const drawingStyleForProduction = (production: Production) =>
  production.visual?.style ?? styleMap[production.brief.style];
const generatedSchema = z
  .object({
    name: z.string(),
    source: z.string().min(1).max(300_000),
    checkSource: z.string().min(1).max(40_000),
  })
  .strict();
const generatedOutputSchema = Type.Object(
  {
    name: Type.String({ minLength: 2, maxLength: 24 }),
    source: Type.String({ minLength: 1, maxLength: 300_000 }),
    checkSource: Type.String({ minLength: 1, maxLength: 40_000 }),
  },
  { additionalProperties: false },
);

let engineReserved: Set<string> | undefined;

function javascriptFiles(directory: string): string[] {
  try {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return javascriptFiles(path);
      return entry.name.endsWith('.js') ? [path] : [];
    });
  } catch {
    return [];
  }
}

function namesInSource(source: string): string[] {
  const names = new Set<string>();
  for (const match of source.matchAll(
    /\bB\.(\w+)\s*=\s*function|Builder\.prototype\.(\w+)\s*=/g,
  ))
    names.add(match[1] ?? match[2]!);
  if (/class Builder\b/.test(source))
    for (const match of source.matchAll(/^ {4}(\w+)\s*\([^)]*\)\s*\{/gm))
      names.add(match[1]!);
  return [...names];
}

export function reservedComponentNames(): Set<string> {
  if (engineReserved) return new Set(engineReserved);
  const names = new Set<string>([
    'constructor',
    'hud',
    'page',
    'host',
    'svg',
    'html',
    'sh',
  ]);
  for (const directory of ['runtime', 'lib']) {
    for (const path of javascriptFiles(join(ENGINE_ROOT, directory))) {
      for (const name of namesInSource(readFileSync(path, 'utf8')))
        names.add(name);
    }
  }
  engineReserved = names;
  return new Set(names);
}

function styleComponentNames(style: string): Set<string> {
  try {
    return new Set(
      namesInSource(
        readFileSync(join(ENGINE_ROOT, 'styles', style, 'kit.js'), 'utf8'),
      ),
    );
  } catch {
    return new Set();
  }
}

export function planFilmKit(production: Production): FilmKitItem[] {
  const candidate = (
    production.storyboard as typeof production.storyboard & {
      kit?: unknown;
    }
  )?.kit;
  if (!Array.isArray(candidate)) return [];

  const pageIds = new Set([
    ...(production.storyboard?.scenes.map((scene) => scene.id) ?? []),
    ...production.scenes.map((scene) => scene.id),
  ]);
  const style = drawingStyleForProduction(production);
  const reserved = reservedComponentNames();
  const styleNames = styleComponentNames(style);
  const seen = new Set<string>();
  const result: FilmKitItem[] = [];

  for (const value of candidate) {
    const parsed = filmKitItemSchema.safeParse(value);
    if (!parsed.success) continue;
    const item = parsed.data;
    if (
      seen.has(item.name) ||
      reserved.has(item.name) ||
      styleNames.has(item.name) ||
      item.pages.length < KIT_MIN_PAGES ||
      item.pages.some((page) => !pageIds.has(page))
    )
      continue;
    seen.add(item.name);
    result.push(item);
    if (result.length === KIT_MAX) break;
  }
  return result;
}

function kitCell(index: number, total: number, portrait: boolean) {
  const stage = portrait
    ? { width: 1080, bottom: 1400 }
    : { width: 1920, bottom: 880 };
  const columns = portrait
    ? Math.ceil(total / Math.ceil(Math.sqrt(total * 1.8)))
    : Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / columns);
  const width = Math.floor((stage.width - 120) / columns);
  const height = Math.floor((stage.bottom - 80) / rows);
  return {
    x: 60 + (index % columns) * width,
    y: 60 + Math.floor(index / columns) * height,
    width,
    height,
  };
}

function assertNoExternalCapabilities(source: string) {
  if (
    /<\/script|\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|Worker|SharedWorker|importScripts|eval|window|document|globalThis|self|parent|top|opener|localStorage|sessionStorage|indexedDB|caches|navigator|location|history|open|postMessage|process|require|module|exports|Object\.(?:assign|defineProperty|setPrototypeOf))\b|\bimport\s*\(/i.test(
      source,
    ) ||
    /\bFunction\s*\(/.test(source) ||
    /(?:https?|file|data):|\.\.[/\\]|[/\\](?:etc|usr|var|Users|home)[/\\]/i.test(
      source,
    ) ||
    /__proto__|\bconstructor\b/.test(source)
  )
    throw new Error('FILM_KIT_INVALID');
}

export function assertSafeFilmKitSource(
  item: FilmKitItem,
  source: string,
  checkSource: string,
) {
  assertNoExternalCapabilities(source);
  assertNoExternalCapabilities(checkSource);
  if (
    !source.includes('PV.Builder.prototype') ||
    /\bB\s*\[/.test(source) ||
    /\b(?:ENGINE|TIMO)\s*\./.test(source) ||
    /\bprototype\b/.test(source.replace('PV.Builder.prototype', ''))
  )
    throw new Error('FILM_KIT_INVALID');

  const definitions = [...source.matchAll(/\bB\.(\w+)\s*=\s*function\b/g)].map(
    (match) => match[1]!,
  );
  if (definitions.length !== 1 || definitions[0] !== item.name)
    throw new Error('FILM_KIT_INVALID');
  if (
    /\bB\.(\w+)\s*=(?!=)/.test(source.replace(/\bB\.\w+\s*=\s*function\b/, ''))
  )
    throw new Error('FILM_KIT_INVALID');

  const escaped = item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (
    new RegExp(`\\bP\\.${escaped}\\s*\\(`).test(checkSource) === false ||
    /\b(?:ENGINE|TIMO)\s*\.|\bB\s*[.[]/.test(checkSource) ||
    /=\s*function\b|=>\s*\{/.test(checkSource)
  )
    throw new Error('FILM_KIT_INVALID');
}

const prompt = () =>
  readFileSync(new URL('../../prompts/FILM_KIT.md', import.meta.url), 'utf8');

export interface GeneratedFilmKitPart extends FilmKitItem {
  source: string;
  sourceHash: string;
  checkSource: string;
  usage: { input: number; output: number };
}

export async function generateFilmKitPart(
  production: Production,
  item: FilmKitItem,
  model: JsonGenerator,
  signal?: AbortSignal,
): Promise<GeneratedFilmKitPart> {
  const parsedItem = filmKitItemSchema.parse(item);
  const planned = planFilmKit(production);
  const index = Math.max(
    0,
    planned.findIndex((candidate) => candidate.name === parsedItem.name),
  );
  const user = JSON.stringify({
    item: parsedItem,
    style: drawingStyleForProduction(production),
    aspectRatio: production.aspectRatio,
    cell: kitCell(
      index,
      Math.max(1, planned.length),
      production.aspectRatio === '9:16',
    ),
    storyboard: production.storyboard,
  });

  try {
    const result = model.generateStructured
      ? await model.generateStructured(
          prompt(),
          user,
          generatedOutputSchema,
          signal,
        )
      : await model.generate(prompt(), user, signal);
    const generated = generatedSchema.parse(result.value);
    if (generated.name !== parsedItem.name) throw new Error('name mismatch');
    assertSafeFilmKitSource(
      parsedItem,
      generated.source,
      generated.checkSource,
    );
    return {
      ...parsedItem,
      source: generated.source,
      sourceHash: createHash('sha256')
        .update(generated.source, 'utf8')
        .digest('hex'),
      checkSource: generated.checkSource,
      usage: result.usage,
    };
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('FILM_KIT_INVALID', { cause: error });
  }
}
