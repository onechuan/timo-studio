import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { PNG } from 'pngjs';
import { beforeAll, describe, expect, it } from 'vitest';

import { comparePng, STRICT } from './image-metrics.js';
import {
  FRAMETELL_ENGINE_ROOT,
  TIMOTV_ENGINE_ROOT,
  fixtures,
  renderFixtureFrames,
} from './fixtures.js';

const scratch = join(tmpdir(), 'timotv-image-metrics');
const baselines = resolve('tests/fixtures/visual-parity/baselines');

async function writeMetricFixture(
  path: string,
  pixel: (x: number, y: number) => [number, number, number, number],
) {
  const png = new PNG({ width: 32, height: 32 });
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      const rgba = pixel(x, y);
      png.data.set(rgba, offset);
    }
  }
  await writeFile(path, PNG.sync.write(png));
}

beforeAll(async () => {
  await mkdir(scratch, { recursive: true });
  await mkdir(baselines, { recursive: true });
});

describe('PNG visual metrics', () => {
  it('accepts bounded antialiasing and rejects visible drift', async () => {
    const base = join(scratch, 'base.png');
    const near = join(scratch, 'near.png');
    const shifted = join(scratch, 'shifted.png');
    await Promise.all([
      writeMetricFixture(base, () => [245, 242, 235, 255]),
      writeMetricFixture(near, (x, y) =>
        x === 15 && y === 15 ? [249, 246, 239, 255] : [245, 242, 235, 255],
      ),
      writeMetricFixture(shifted, (x) =>
        x < 16 ? [25, 25, 25, 255] : [245, 242, 235, 255],
      ),
    ]);

    expect(await comparePng(near, base, STRICT)).toMatchObject({ pass: true });
    expect(await comparePng(shifted, base, STRICT)).toMatchObject({
      pass: false,
    });
  });
});

describe('Frametell engine visual parity', () => {
  it.each(fixtures)(
    '$name matches the locked Frametell frames at every sample time',
    async (fixture) => {
      if (process.env.UPDATE_VISUAL_BASELINES === '1') {
        await renderFixtureFrames(fixture, {
          engineRoot: FRAMETELL_ENGINE_ROOT,
          outputRoot: baselines,
        });
      }

      const outputRoot = join(scratch, fixture.name);
      const frames = await renderFixtureFrames(fixture, {
        engineRoot: TIMOTV_ENGINE_ROOT,
        outputRoot,
      });

      for (const [index, actual] of frames.entries()) {
        const expected = join(baselines, `${fixture.name}-${index}.png`);
        const result = await comparePng(actual, expected, fixture.threshold);
        expect(
          result,
          `${fixture.name} at ${fixture.sampleSeconds[index]}s`,
        ).toMatchObject({ pass: true });
      }
    },
    300_000,
  );
});
