# Drawing Engine Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Copy the complete Frametell drawing engine into TimoTV under AGPL, prove the copied runtime and all 42 styles work unchanged, and expose it as the `@timotv/drawing-engine` workspace package for the later V3 integration.

**Architecture:** This phase is an equivalence migration, not a rewrite. The Frametell engine's `boot.js`, runtime, component library, all styles, tools, templates, vendor bundle, examples, and tests are copied byte-for-byte; only package identity and provenance documentation are added. Black-box inventory, unit, Chrome lint, and screenshot-parity tests establish a stable baseline before TimoTV adapters change behavior.

**Tech Stack:** Node.js 22, pnpm 10, JavaScript ESM, Vitest 3, Node test runner, Rough.js 4.6, Playwright Core 1.61.1, system Chrome, FFmpeg.

## Global Constraints

- Preserve all existing TimoTV project, database, queue, TTS, web UI, V1/V2 artwork, and uncommitted user changes.
- Copy source from `/Users/onechuan/code/ai/open/frametell/packages/engine` at the current checked-out revision; do not import its UI, project manager, model settings, or TTS packages.
- Preserve Frametell copyright, `AGPL-3.0-only`, and third-party notices.
- Copy all 42 style directories plus `_fonts`, all `lib`, `runtime`, `tools`, `template`, `vendor`, examples, and tests.
- Do not optimize or rename runtime globals in this phase; visual equivalence must be established first.
- Do not replace or delete the existing `@timotv/renderer` or V1/V2 artwork path.
- Every new behavior follows red-green-refactor; inventory and parity tests must fail before the engine is copied.
- Commit only files belonging to the current task; never stage unrelated dirty-worktree files.

---

### Task 1: License and provenance boundary

**Files:**
- Create: `LICENSE`
- Create: `THIRD_PARTY_NOTICES.md`
- Create: `docs/OPEN_SOURCE.md`
- Create: `tests/drawing-engine-license.test.ts`

**Interfaces:**
- Consumes: Frametell root `LICENSE`, `THIRD_PARTY_NOTICES.md`, and engine package metadata.
- Produces: repository-wide AGPL declaration and machine-checked attribution used by later migration tasks.

- [ ] **Step 1: Write the failing license test**

```ts
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
    expect(notices).toContain('roughjs');
    expect(provenance).toContain('/Users/onechuan/code/ai/open/frametell');
    expect(provenance).toContain('AGPL-3.0-only');
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm vitest run tests/drawing-engine-license.test.ts`

Expected: FAIL with `ENOENT` for `LICENSE`.

- [ ] **Step 3: Add the license and provenance files**

Copy the complete Frametell `LICENSE` to the TimoTV repository root. Copy its `THIRD_PARTY_NOTICES.md`, then prepend this notice without removing upstream entries:

```md
# TimoTV third-party notices

## Frametell drawing engine

TimoTV's programmable drawing engine is derived from Frametell by Sitor Team,
https://github.com/sitor-ai/frametell, licensed under AGPL-3.0-only.

The original copyright and license terms are preserved in the copied engine
package and the repository LICENSE file.
```

Create `docs/OPEN_SOURCE.md`:

```md
# Open-source source code

TimoTV and its programmable drawing engine are distributed under
AGPL-3.0-only. The initial drawing-engine baseline was copied from the local
Frametell checkout at `/Users/onechuan/code/ai/open/frametell`, package
`@frametell/engine` version `0.8.0`, by Sitor Team.

Users receiving the application or interacting with a modified network version
must be offered the Corresponding Source required by AGPL-3.0-only. A build's
source must match that build; an older checkout is not sufficient.
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `pnpm vitest run tests/drawing-engine-license.test.ts`

Expected: PASS, one test.

- [ ] **Step 5: Commit only the licensing task**

```bash
git add LICENSE THIRD_PARTY_NOTICES.md docs/OPEN_SOURCE.md tests/drawing-engine-license.test.ts
git commit -m "chore: establish AGPL drawing engine provenance"
```

### Task 2: Complete engine inventory migration

**Files:**
- Create: `packages/drawing-engine/boot.js`
- Create: `packages/drawing-engine/runtime/**`
- Create: `packages/drawing-engine/lib/**`
- Create: `packages/drawing-engine/styles/**`
- Create: `packages/drawing-engine/template/**`
- Create: `packages/drawing-engine/tools/**`
- Create: `packages/drawing-engine/vendor/**`
- Create: `packages/drawing-engine/test/**`
- Create: `packages/drawing-engine/README.md`
- Create: `tests/drawing-engine-inventory.test.ts`

**Interfaces:**
- Consumes: the complete file tree from Frametell `packages/engine`, excluding `node_modules` and its `package.json`.
- Produces: an unchanged engine source tree whose inventory is identical to the source checkout.

- [ ] **Step 1: Write the failing inventory test**

```ts
import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = '/Users/onechuan/code/ai/open/frametell/packages/engine';
const target = resolve('packages/drawing-engine');
const excluded = new Set(['node_modules', 'package.json']);

async function files(root: string, dir = root): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.flatMap((entry) => {
    if (dir === root && excluded.has(entry.name)) return [];
    const absolute = resolve(dir, entry.name);
    return entry.isDirectory() ? files(root, absolute) : [relative(root, absolute)];
  }));
  return nested.flat().sort();
}

describe('drawing engine migration inventory', () => {
  it('copies every upstream engine file byte-for-byte', async () => {
    const expected = await files(source);
    const actual = await files(target);
    expect(actual).toEqual(expected);
    for (const file of expected) {
      expect(await readFile(resolve(target, file))).toEqual(
        await readFile(resolve(source, file)),
      );
    }
  });

  it('contains all 42 styles and shared fonts', async () => {
    const styles = await readdir(resolve(target, 'styles'), { withFileTypes: true });
    const names = styles.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    expect(names).toContain('_fonts');
    expect(names.filter((name) => name !== '_fonts')).toHaveLength(42);
  });
});
```

- [ ] **Step 2: Run the inventory test and verify RED**

Run: `pnpm vitest run tests/drawing-engine-inventory.test.ts`

Expected: FAIL with `ENOENT` for `packages/drawing-engine`.

- [ ] **Step 3: Copy the upstream engine tree mechanically**

Copy all entries from the source engine except `node_modules` and `package.json` into `packages/drawing-engine`. Do not edit copied files in this task. The resulting tree must include all examples and tests so the byte comparison remains authoritative.

- [ ] **Step 4: Run the inventory test and verify GREEN**

Run: `pnpm vitest run tests/drawing-engine-inventory.test.ts`

Expected: PASS, two tests, proving identical inventory and bytes.

- [ ] **Step 5: Commit the exact baseline**

```bash
git add packages/drawing-engine tests/drawing-engine-inventory.test.ts
git commit -m "feat: import Frametell drawing engine baseline"
```

### Task 3: Workspace package identity and locked dependencies

**Files:**
- Create: `packages/drawing-engine/package.json`
- Modify: `pnpm-lock.yaml`
- Test: `tests/drawing-engine-package.test.ts`

**Interfaces:**
- Consumes: exact copied engine sources from Task 2.
- Produces: resolvable workspace package `@timotv/drawing-engine` and all browser/render dependencies required by the copied code.

- [ ] **Step 1: Write the failing package contract test**

```ts
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('@timotv/drawing-engine package', () => {
  it('declares the copied engine runtime and exact compatibility floor', async () => {
    const pkg = JSON.parse(await readFile(
      new URL('../packages/drawing-engine/package.json', import.meta.url),
      'utf8',
    ));
    expect(pkg.name).toBe('@timotv/drawing-engine');
    expect(pkg.license).toBe('AGPL-3.0-only');
    expect(pkg.scripts.test).toBe('node --test test/*.test.mjs');
    expect(pkg.dependencies.roughjs).toBe('^4.6.6');
    expect(pkg.dependencies['playwright-core']).toBe('1.61.1');
    expect(pkg.files).toContain('styles');
  });
});
```

- [ ] **Step 2: Run the package test and verify RED**

Run: `pnpm vitest run tests/drawing-engine-package.test.ts`

Expected: FAIL because `packages/drawing-engine/package.json` does not exist.

- [ ] **Step 3: Create the package manifest**

Use the upstream engine manifest as the base with these identity fields and unchanged dependency versions:

```json
{
  "name": "@timotv/drawing-engine",
  "version": "0.1.0",
  "private": true,
  "description": "TimoTV programmable hand-drawn video engine, derived from Frametell.",
  "license": "AGPL-3.0-only",
  "author": "Sitor Team and TimoTV contributors",
  "type": "module",
  "files": ["boot.js", "runtime", "lib", "styles", "template", "tools", "vendor", "README.md"],
  "exports": {
    "./package.json": "./package.json",
    "./tools/*": "./tools/*"
  },
  "dependencies": {
    "@fontsource/caveat": "^5.3.0",
    "@fontsource/fredoka": "^5.3.0",
    "@fontsource/jetbrains-mono": "^5.3.0",
    "@iconify-json/logos": "^1.2.15",
    "ffmpeg-static": "^5.2.0",
    "katex": "^0.18.9",
    "lxgw-wenkai-webfont": "^1.7.0",
    "playwright-core": "1.61.1",
    "roughjs": "^4.6.6",
    "simple-icons": "^16.33.0"
  },
  "devDependencies": {
    "esbuild": "^0.25.10",
    "three": "^0.180.0"
  },
  "scripts": {
    "test": "node --test test/*.test.mjs"
  }
}
```

- [ ] **Step 4: Install and verify package resolution**

Run: `pnpm install`

Expected: exit 0; lockfile contains `packages/drawing-engine` and the declared dependencies.

- [ ] **Step 5: Run the focused package test and workspace package tests**

Run: `pnpm vitest run tests/drawing-engine-package.test.ts tests/drawing-engine-license.test.ts tests/drawing-engine-inventory.test.ts`

Expected: PASS, four tests.

- [ ] **Step 6: Commit package identity and lockfile**

```bash
git add packages/drawing-engine/package.json pnpm-lock.yaml tests/drawing-engine-package.test.ts
git commit -m "build: register drawing engine workspace package"
```

### Task 4: Upstream unit and component-gallery verification

**Files:**
- Verify without editing: `packages/drawing-engine/test/*.test.mjs`

**Interfaces:**
- Consumes: `@timotv/drawing-engine` installed in the pnpm workspace and a system Chrome located by `tools/bins.mjs`.
- Produces: passing original engine tests under the new package location without changing drawing behavior. This is verification of mechanically copied behavior; it introduces no production code and therefore has no red-green implementation cycle of its own.

- [ ] **Step 1: Run the copied test suite**

Run: `pnpm --filter @timotv/drawing-engine test`

Expected: PASS. Chrome-dependent tests may report SKIP only when `findChrome()` returns no executable; on this workstation they must run because the existing TimoTV review pipeline already uses Chrome.

- [ ] **Step 2: Prove the imported baseline remains byte-identical**

Run: `pnpm vitest run tests/drawing-engine-inventory.test.ts`

Expected: PASS, including byte equality for tools, runtime, lib, and styles.

- [ ] **Step 3: Record verification in the plan without changing engine files**

Mark these two steps complete only after both commands pass. No engine commit is created because verification must not manufacture a behavior change.

### Task 5: Deterministic warm-story and chalkboard visual parity

**Files:**
- Create: `tests/integration/drawing-engine-parity.test.ts`
- Generated and ignored during tests: temporary linked copies and snapshot images under the system temporary directory.

**Interfaces:**
- Consumes: source and copied engine example projects, `tools/snap.mjs`, system Chrome, and fixed screenshot times.
- Produces: byte-identical keyframes proving the TimoTV baseline renders like the source engine before any optimization.

- [ ] **Step 1: Write the failing parity test**

```ts
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

async function frame(engine: string, style: 'warm-story' | 'chalkboard', at: number) {
  const root = await mkdtemp(join(tmpdir(), `timotv-${style}-`));
  roots.push(root);
  const film = join(root, 'film');
  const example = join(engine, 'styles', style, 'example');
  await cp(example, film, {
    recursive: true,
    filter: (path) => !/(^|\/)(engine|engine_modules|out)(\/|$)/.test(relative(example, path)),
  });
  const project = await import(
    pathToFileURL(join(engine, 'tools', 'project.mjs')).href + `?engine=${Date.now()}`
  );
  project.linkProject(film);
  await exec(process.execPath, [join(engine, 'tools', 'snap.mjs'), at.toFixed(1)], {
    cwd: film,
    env: process.env,
  });
  return readFile(join(film, 'out', 'snap', `snap-${at.toFixed(1)}.png`));
}

afterAll(async () => Promise.all(roots.map((root) => rm(root, { recursive: true, force: true }))));

describe.runIf(process.env.RUN_INTEGRATION === '1')('drawing engine visual parity', () => {
  for (const [style, at] of [['warm-story', 6], ['chalkboard', 6]] as const) {
    it(`${style} renders the same keyframe as the source engine`, async () => {
      expect(await frame(target, style, at)).toEqual(await frame(source, style, at));
    });
  }
});
```

- [ ] **Step 2: Run the parity test and verify RED**

Run: `RUN_INTEGRATION=1 pnpm vitest run tests/integration/drawing-engine-parity.test.ts`

Expected: FAIL if the copied engine cannot resolve, link, or render its examples; a passing result is acceptable only when Tasks 2–4 already proved the complete byte-identical baseline and installed dependencies, because this task adds verification code rather than production behavior.

- [ ] **Step 3: Make parity execution isolated without changing renderer behavior**

The test above already uses the copied `withLinkedCopy` semantics: it copies each example into a temporary directory, invokes that engine's `linkProject`, runs that engine's `snap.mjs`, and reads the generated PNG. If RED exposed a concrete path or dependency defect, correct only the test harness or package installation responsible for that defect; do not edit runtime, style, or example code.

- [ ] **Step 4: Run the parity test and verify GREEN**

Run: `RUN_INTEGRATION=1 pnpm vitest run tests/integration/drawing-engine-parity.test.ts`

Expected: PASS for warm-story and chalkboard, with identical PNG buffers. The same Chrome process family, viewport, fonts, source files, and times make the PNG output deterministic; any difference is a failed parity gate rather than an allowed tolerance.

- [ ] **Step 5: Commit the parity harness**

```bash
git add tests/integration/drawing-engine-parity.test.ts
git commit -m "test: prove drawing engine visual parity"
```

### Task 6: Baseline verification gate and handoff to V3 integration

**Files:**
- Create: `docs/verification/drawing-engine-baseline.md`
- Modify: `docs/superpowers/plans/2026-11-10-drawing-engine-baseline.md`

**Interfaces:**
- Consumes: all previous task tests and the complete existing TimoTV test suite.
- Produces: recorded evidence that the copied baseline is safe to integrate, plus checked plan boxes that identify the exact baseline commit.

- [ ] **Step 1: Run engine and focused migration tests**

Run: `pnpm --filter @timotv/drawing-engine test`

Expected: PASS with no runtime or API gallery failures.

Run: `pnpm vitest run tests/drawing-engine-license.test.ts tests/drawing-engine-inventory.test.ts tests/drawing-engine-package.test.ts`

Expected: PASS.

- [ ] **Step 2: Run visual parity**

Run: `RUN_INTEGRATION=1 pnpm vitest run tests/integration/drawing-engine-parity.test.ts`

Expected: PASS for warm-story and chalkboard.

- [ ] **Step 3: Run the existing TimoTV regression suite**

Run: `pnpm test`

Expected: all existing tests pass; copied engine tests remain isolated to their package and do not change V1/V2 behavior.

Run: `pnpm typecheck`

Expected: exit 0.

- [ ] **Step 4: Record exact evidence**

Create `docs/verification/drawing-engine-baseline.md` containing:

```md
# Drawing engine baseline verification

- Source: `/Users/onechuan/code/ai/open/frametell/packages/engine`
- Upstream package: `@frametell/engine` 0.8.0, AGPL-3.0-only
- Target package: `@timotv/drawing-engine` 0.1.0
- Inventory: all source files copied; 42 styles plus `_fonts`
- Engine unit and gallery tests: PASS
- Warm-story screenshot parity: PASS, zero differing pixels
- Chalkboard screenshot parity: PASS, zero differing pixels
- TimoTV regression tests: PASS
- TimoTV typecheck: PASS

This evidence proves only the equivalent engine baseline. V3 contracts, sandbox
execution, Agent generation, review repair, preview integration, and MP4 export
are implemented in the subsequent plans required by the approved design spec.
```

Replace each PASS only with the actual command result; include skipped tests and their reason rather than claiming a pass.

- [ ] **Step 5: Check off completed plan steps and commit verification**

```bash
git add docs/verification/drawing-engine-baseline.md docs/superpowers/plans/2026-11-10-drawing-engine-baseline.md
git commit -m "docs: verify drawing engine baseline"
```

## Subsequent required plans

This baseline is not the user-visible goal. After Task 6, continue the active goal with three separately reviewed plans derived from the approved design spec:

1. `2026-11-10-drawing-engine-v3-integration.md`: V3 contract, source validation, CSP sandbox, preview, seek, review capture, and MP4 renderer adapter while preserving V1/V2.
2. `2026-11-10-drawing-agent-review-loop.md`: Pi page-program output, adapted PAGE/API/LIB prompts, Film Kit, lint/contact-sheet review, two repair rounds, checkpoints, and whole-film review.
3. `2026-11-10-first-principles-video-acceptance.md`: migrate the current project, browser playback/pause/seek QA, visual comparison, and final MP4 with Fire Volcano TTS audio and subtitles.
