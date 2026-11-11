import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import manifest from '../packages/drawing-engine/upstream.json' with { type: 'json' };
import { auditEngine } from '../scripts/sync-frametell-engine.mjs';

const SOURCE_ROOT =
  process.env.FRAMETELL_ENGINE_ROOT ??
  '/Users/onechuan/code/ai/open/frametell/packages/engine';

describe('Frametell drawing engine upstream manifest', () => {
  it('records the locked revision', () => {
    expect(manifest.revision).toBe('6145f7e3482628543bd6f2d68fe3b618d366213a');
  });

  it.runIf(existsSync(SOURCE_ROOT))(
    'matches every tracked visual source file when the upstream checkout is available',
    async () => {
      const audit = await auditEngine({
        sourceRoot: SOURCE_ROOT,
        targetRoot: resolve('packages/drawing-engine'),
        manifest,
      });

      expect(audit.missing).toEqual([]);
      expect(audit.unexpected).toEqual([]);
      expect(audit.changed.filter((entry) => !entry.adapter)).toEqual([]);
    },
  );
});
