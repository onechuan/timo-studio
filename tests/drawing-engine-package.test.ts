import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('@timotv/drawing-engine package', () => {
  it('declares the copied engine runtime and exact compatibility floor', async () => {
    const pkg = JSON.parse(
      await readFile(
        new URL('../packages/drawing-engine/package.json', import.meta.url),
        'utf8',
      ),
    );

    expect(pkg.name).toBe('@timotv/drawing-engine');
    expect(pkg.license).toBe('AGPL-3.0-only');
    expect(pkg.scripts.test).toBe('node --test test/*.test.mjs');
    expect(pkg.dependencies.roughjs).toBe('^4.6.6');
    expect(pkg.dependencies['playwright-core']).toBe('1.61.1');
    expect(pkg.files).toContain('styles');
  });
});
