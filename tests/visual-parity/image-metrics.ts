import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { ssim as calculateSsim } from 'ssim.js';

export interface VisualThreshold {
  minSsim: number;
  maxChangedRatio: number;
  channelDelta: number;
}

export interface ImageComparison {
  pass: boolean;
  ssim: number;
  changedRatio: number;
  width: number;
  height: number;
}

export const STRICT: VisualThreshold = {
  minSsim: 0.995,
  maxChangedRatio: 0.005,
  channelDelta: 8,
};

export const WEBGL: VisualThreshold = {
  minSsim: 0.99,
  maxChangedRatio: 0.01,
  channelDelta: 8,
};

async function decode(path: string) {
  return PNG.sync.read(await readFile(path));
}

function changedPixelRatio(
  actual: Buffer,
  expected: Buffer,
  channelDelta: number,
) {
  let changed = 0;
  const pixels = actual.length / 4;

  for (let offset = 0; offset < actual.length; offset += 4) {
    if (
      Math.abs(actual[offset] - expected[offset]) > channelDelta ||
      Math.abs(actual[offset + 1] - expected[offset + 1]) > channelDelta ||
      Math.abs(actual[offset + 2] - expected[offset + 2]) > channelDelta ||
      Math.abs(actual[offset + 3] - expected[offset + 3]) > channelDelta
    ) {
      changed += 1;
    }
  }

  return changed / pixels;
}

export async function comparePng(
  actualPath: string,
  expectedPath: string,
  threshold: VisualThreshold = STRICT,
): Promise<ImageComparison> {
  const [actual, expected] = await Promise.all([
    decode(actualPath),
    decode(expectedPath),
  ]);

  if (actual.width !== expected.width || actual.height !== expected.height) {
    return {
      pass: false,
      ssim: 0,
      changedRatio: 1,
      width: actual.width,
      height: actual.height,
    };
  }

  const score = calculateSsim(
    {
      width: actual.width,
      height: actual.height,
      data: new Uint8ClampedArray(actual.data),
    },
    {
      width: expected.width,
      height: expected.height,
      data: new Uint8ClampedArray(expected.data),
    },
  ).mssim;
  const changedRatio = changedPixelRatio(
    actual.data,
    expected.data,
    threshold.channelDelta,
  );

  return {
    pass:
      score >= threshold.minSsim && changedRatio <= threshold.maxChangedRatio,
    ssim: score,
    changedRatio,
    width: actual.width,
    height: actual.height,
  };
}
