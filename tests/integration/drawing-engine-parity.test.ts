import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { afterAll, describe, expect, it } from 'vitest';

const exec = promisify(execFile);
const source = '/Users/onechuan/code/ai/open/frametell/packages/engine';
const target = resolve('packages/drawing-engine');
const roots: string[] = [];
let importId = 0;

async function frame(
  engine: string,
  style: 'warm-story' | 'chalkboard',
  at: number,
) {
  const root = await mkdtemp(join(tmpdir(), `timotv-${style}-`));
  roots.push(root);
  const film = join(root, 'film');
  const example = join(engine, 'styles', style, 'example');
  await cp(example, film, {
    recursive: true,
    filter: (path) =>
      !/(^|\/)(engine|engine_modules|out)(\/|$)/.test(
        relative(example, path),
      ),
  });
  const project = await import(
    `${pathToFileURL(join(engine, 'tools', 'project.mjs')).href}?engine=${importId++}`
  );
  project.linkProject(film);
  await exec(
    process.execPath,
    [join(engine, 'tools', 'snap.mjs'), at.toFixed(1)],
    { cwd: film, env: process.env },
  );
  return readFile(join(film, 'out', 'snap', `snap-${at}.png`));
}

afterAll(async () => {
  await Promise.all(
    roots.map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe.runIf(process.env.RUN_INTEGRATION === '1')(
  'drawing engine visual parity',
  () => {
    for (const [style, at] of [
      ['warm-story', 6],
      ['chalkboard', 6],
    ] as const) {
      it(
        `${style} renders the same keyframe as the source engine`,
        async () => {
          expect(await frame(target, style, at)).toEqual(
            await frame(source, style, at),
          );
        },
        60_000,
      );
    }
  },
);
