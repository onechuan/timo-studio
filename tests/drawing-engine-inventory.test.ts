import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = '/Users/onechuan/code/ai/open/frametell/packages/engine';
const target = resolve('packages/drawing-engine');
const excluded = new Set(['node_modules', 'package.json']);

async function files(root: string, dir = root): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.flatMap((entry) => {
      if (dir === root && excluded.has(entry.name)) return [];
      const absolute = resolve(dir, entry.name);
      return entry.isDirectory()
        ? files(root, absolute)
        : [relative(root, absolute)];
    }),
  );
  return nested.flat().sort();
}

async function digest(root: string, listing: string[]) {
  const hash = createHash('sha256');
  for (const file of listing) {
    hash.update(file);
    hash.update(await readFile(resolve(root, file)));
  }
  return hash.digest('hex');
}

describe('drawing engine migration inventory', () => {
  it('copies every upstream engine file byte-for-byte', async () => {
    const expected = await files(source);
    const actual = await files(target);

    expect(actual).toEqual(expected);
    const [copied, upstream] = await Promise.all([
      digest(target, expected),
      digest(source, expected),
    ]);
    expect(copied).toBe(upstream);
  });

  it('contains all 42 styles and shared fonts', async () => {
    const styles = await readdir(resolve(target, 'styles'), {
      withFileTypes: true,
    });
    const names = styles
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    expect(names).toContain('_fonts');
    expect(names.filter((name) => name !== '_fonts')).toHaveLength(42);
  });
});
