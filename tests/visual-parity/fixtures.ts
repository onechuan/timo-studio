import { execFile as execFileCallback } from 'node:child_process';
import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import manifest from '../fixtures/visual-parity/manifest.json' with { type: 'json' };
import { STRICT, WEBGL, type VisualThreshold } from './image-metrics.js';

const execFile = promisify(execFileCallback);
const LOCKED_REVISION = '6145f7e3482628543bd6f2d68fe3b618d366213a';
const REPOSITORY_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../..',
);

export const FRAMETELL_ENGINE_ROOT =
  process.env.FRAMETELL_ENGINE_ROOT ??
  resolve(REPOSITORY_ROOT, '../../open/frametell/packages/engine');
export const TIMOTV_ENGINE_ROOT = resolve(
  REPOSITORY_ROOT,
  'packages/drawing-engine',
);

export interface VisualParityFixture {
  name: string;
  style: string;
  page: string;
  portrait?: boolean;
  overlay?: string;
  sampleSeconds: number[];
  threshold: VisualThreshold;
}

const thresholds: Record<string, VisualThreshold> = {
  strict: STRICT,
  webgl: WEBGL,
};

if (manifest.upstreamRevision !== LOCKED_REVISION) {
  throw new Error(
    `Visual fixtures target ${manifest.upstreamRevision}; expected ${LOCKED_REVISION}.`,
  );
}

export const fixtures: VisualParityFixture[] = manifest.fixtures.map(
  (fixture) => {
    const threshold = thresholds[fixture.threshold];
    if (!threshold) {
      throw new Error(
        `Unknown visual threshold ${fixture.threshold} for ${fixture.name}.`,
      );
    }
    return { ...fixture, threshold };
  },
);

async function prepareProject(
  fixture: VisualParityFixture,
  engineRoot: string,
) {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'timotv-visual-parity-'));
  const projectRoot = join(temporaryRoot, 'project');
  const sourceExample = join(engineRoot, 'styles', fixture.style, 'example');
  await cp(sourceExample, projectRoot, { recursive: true });
  await rm(join(projectRoot, 'engine'), { recursive: true, force: true });
  await rm(join(projectRoot, 'engine_modules'), {
    recursive: true,
    force: true,
  });
  await rm(join(projectRoot, 'out'), { recursive: true, force: true });

  if (fixture.overlay) {
    await cp(
      resolve(REPOSITORY_ROOT, 'tests/fixtures/visual-parity', fixture.overlay),
      projectRoot,
      { recursive: true, force: true },
    );
  }

  if (fixture.portrait) {
    const scriptPath = join(projectRoot, 'script.js');
    const source = await readFile(scriptPath, 'utf8');
    const marker = 'const META = {';
    if (!source.includes(marker)) {
      throw new Error(`Cannot enable portrait mode for ${fixture.name}.`);
    }
    await writeFile(
      scriptPath,
      source.replace(marker, `${marker}\n    portrait: true,`),
    );
  }

  await symlink(engineRoot, join(projectRoot, 'engine'), 'dir');
  await symlink(
    join(engineRoot, 'node_modules'),
    join(projectRoot, 'engine_modules'),
    'dir',
  );
  return { temporaryRoot, projectRoot };
}

export async function renderFixtureFrames(
  fixture: VisualParityFixture,
  options: { engineRoot: string; outputRoot: string },
): Promise<string[]> {
  const { temporaryRoot, projectRoot } = await prepareProject(
    fixture,
    options.engineRoot,
  );

  try {
    await execFile(
      process.execPath,
      [
        join(options.engineRoot, 'tools/snap.mjs'),
        '--only',
        fixture.page,
        ...fixture.sampleSeconds.map(String),
      ],
      {
        cwd: projectRoot,
        env: {
          ...process.env,
          PLAYWRIGHT_CHANNEL: manifest.chromiumChannel,
          SNAP_LABEL: '0',
        },
        maxBuffer: 4 * 1024 * 1024,
        timeout: 240_000,
      },
    );

    await mkdir(options.outputRoot, { recursive: true });
    const frames = [];
    for (const [index, seconds] of fixture.sampleSeconds.entries()) {
      const destination = join(
        options.outputRoot,
        `${fixture.name}-${index}.png`,
      );
      await copyFile(
        join(projectRoot, 'out/snap', `snap-${seconds}.png`),
        destination,
      );
      frames.push(destination);
    }
    return frames;
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}
