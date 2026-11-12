import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('drawing engine licensing', () => {
  it('publishes AGPL and Frametell provenance before copied code is shipped', async () => {
    const [license, notices, provenance] = await Promise.all([
      readFile(new URL('../LICENSE', import.meta.url), 'utf8'),
      readFile(new URL('../THIRD_PARTY_NOTICES.md', import.meta.url), 'utf8'),
      readFile(new URL('../docs/OPEN_SOURCE.md', import.meta.url), 'utf8'),
    ]);

    expect(license).toContain('GNU AFFERO GENERAL PUBLIC LICENSE');
    expect(notices).toContain('Frametell');
    expect(notices).toMatch(/rough\.?js/i);
    expect(provenance).toContain('https://github.com/sitor-ai/frametell');
    expect(provenance).toContain('AGPL-3.0-only');
  });
});
