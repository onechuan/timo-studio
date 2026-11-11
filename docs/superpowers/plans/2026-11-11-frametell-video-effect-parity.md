# Frametell Video Effect Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make TimoTV use the same visual engine, Film Kit, page-director checks, whole-film review, and rendering quality gates as Frametell while retaining TimoTV's web, database, queue, TTS, and recovery architecture.

**Architecture:** Frametell commit `6145f7e3482628543bd6f2d68fe3b618d366213a` is the visual source of truth. TimoTV synchronizes that engine through a manifest and isolated adapter patches, persists Film Kit/page/whole-film state in `Production`, and runs the same deterministic engine for preview, review, seek, and MP4 export. `ProductionRunner` owns orchestration and checkpoints; the worker only injects model, browser, storage, speech, and renderer operations.

**Tech Stack:** TypeScript 5.9, Node.js 22+, React/Vite, Zod 3, Pi Agent runtime, Playwright/Chromium, FFmpeg, PostgreSQL/Prisma, BullMQ/Redis, Vitest, PNG/SSIM visual comparison.

## Global Constraints

- The parity source is Frametell commit `6145f7e3482628543bd6f2d68fe3b618d366213a`.
- Preserve all existing uncommitted TimoTV work and stage only files named by each task.
- Preserve V1/V2/V3 project compatibility, revision CAS, job ownership, TTS cache, and failure recovery.
- Generated page and Film Kit source cannot access Node, network, storage, parent window, arbitrary paths, or unregistered assets.
- Preview, seek, review screenshots, and MP4 export must call the same `renderAt(globalMs)` runtime.
- Fixed visual baselines require SSIM ≥ 0.995 and channel-difference pixels ≤ 0.5%; Three.js fixtures allow SSIM ≥ 0.990 and difference pixels ≤ 1.0%.
- A page receives at most two automatic repair rounds; a whole film receives at most two cross-page repair rounds.
- Feature parity stays behind `TIMOTV_FRAMETELL_PARITY` until all fixed and open-ended acceptance gates pass.
- Every behavior change follows red-green-refactor; each task has a focused test command before the broader suite.

---

## Phase 1: Engine Synchronization and Fixed Visual Baselines

### Task 1: Upstream manifest and audit command

**Files:**
- Create: `packages/drawing-engine/upstream.json`
- Create: `scripts/sync-frametell-engine.mjs`
- Create: `tests/drawing-engine-upstream.test.ts`
- Modify: `package.json`
- Modify: `docs/UPSTREAM_PATCHES.md`

**Interfaces:**
- Consumes: sibling repository `/Users/onechuan/code/ai/open/frametell/packages/engine` and locked commit hash.
- Produces: `auditEngine({ sourceRoot, targetRoot, manifest }): Promise<EngineAudit>` and CLI scripts `engine:audit` / `engine:sync`.

- [ ] **Step 1: Write the failing manifest test**

```ts
import { expect, it } from 'vitest';
import manifest from '../packages/drawing-engine/upstream.json';
import { auditEngine } from '../scripts/sync-frametell-engine.mjs';

it('records the locked Frametell revision and every visual source file', async () => {
  expect(manifest.revision).toBe('6145f7e3482628543bd6f2d68fe3b618d366213a');
  const audit = await auditEngine({
    sourceRoot: '/Users/onechuan/code/ai/open/frametell/packages/engine',
    targetRoot: new URL('../packages/drawing-engine/', import.meta.url),
    manifest,
  });
  expect(audit.missing).toEqual([]);
  expect(audit.unexpected).toEqual([]);
  expect(audit.changed.filter((x) => !x.adapter)).toEqual([]);
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/drawing-engine-upstream.test.ts`

Expected: FAIL because the manifest and audit module do not exist.

- [ ] **Step 3: Add the manifest and deterministic audit**

```js
export async function auditEngine({ sourceRoot, targetRoot, manifest }) {
  const source = await inventory(sourceRoot, manifest.include);
  const target = await inventory(fileURLToPath(targetRoot), manifest.include);
  const expected = new Map(manifest.files.map((file) => [file.path, file]));
  return {
    missing: [...expected.keys()].filter((path) => !target.has(path)),
    unexpected: [...target.keys()].filter((path) => !expected.has(path)),
    changed: [...expected.values()].flatMap((file) => {
      const actual = target.get(file.path);
      return actual?.sha256 === file.sha256
        ? []
        : [{ path: file.path, expected: file.sha256, actual: actual?.sha256, adapter: file.adapter === true }];
    }),
  };
}
```

The CLI `--check` prints JSON and exits 1 for non-adapter drift. `--apply` copies only manifest files from the verified locked Frametell checkout, then reapplies documented adapter patches. `upstream.json` includes `runtime/**`, `styles/**`, `lib/**`, `vendor/**`, `tools/**`, `template/**`, `boot.js`, and excludes generated output.

- [ ] **Step 4: Run GREEN and inventory checks**

Run: `pnpm engine:audit && pnpm exec vitest run tests/drawing-engine-upstream.test.ts tests/drawing-engine-inventory.test.ts && pnpm --filter @timotv/drawing-engine test`

Expected: all commands PASS; audit reports only documented adapters.

- [ ] **Step 5: Commit**

```bash
git add package.json packages/drawing-engine/upstream.json scripts/sync-frametell-engine.mjs tests/drawing-engine-upstream.test.ts docs/UPSTREAM_PATCHES.md
git commit -m "build: track frametell engine upstream"
```

### Task 2: Cross-repository visual comparator

**Files:**
- Create: `tests/visual-parity/image-metrics.ts`
- Create: `tests/visual-parity/fixtures.ts`
- Create: `tests/visual-parity/engine-parity.test.ts`
- Create: `tests/fixtures/visual-parity/manifest.json`
- Modify: `package.json`

**Interfaces:**
- Produces: `comparePng(actual, expected, threshold): Promise<{ssim:number; changedRatio:number}>` and fixed fixture descriptors.
- Consumes: PNG frames rendered from the same page source by Frametell and TimoTV.

- [ ] **Step 1: Write metric and threshold tests**

```ts
it('accepts bounded antialiasing and rejects visible drift', async () => {
  expect(await comparePng('near.png', 'base.png', STRICT)).toMatchObject({ pass: true });
  expect(await comparePng('shifted.png', 'base.png', STRICT)).toMatchObject({ pass: false });
});

it.each(fixtures)('$name matches Frametell at all sample times', async (fixture) => {
  const frames = await renderBoth(fixture);
  for (const pair of frames) expect((await comparePng(pair.timo, pair.frametell, fixture.threshold)).pass).toBe(true);
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/visual-parity/engine-parity.test.ts`

Expected: FAIL because `comparePng`, fixture rendering, and committed baselines are absent.

- [ ] **Step 3: Implement deterministic PNG metrics and six fixtures**

```ts
export const STRICT = { minSsim: 0.995, maxChangedRatio: 0.005, channelDelta: 8 };
export const WEBGL = { minSsim: 0.99, maxChangedRatio: 0.01, channelDelta: 8 };
export async function comparePng(actualPath: string, expectedPath: string, limit = STRICT) {
  const [actual, expected] = await Promise.all([decode(actualPath), decode(expectedPath)]);
  if (actual.width !== expected.width || actual.height !== expected.height)
    return { pass: false, ssim: 0, changedRatio: 1 };
  const score = ssim(actual, expected);
  const changedRatio = changedPixels(actual, expected, limit.channelDelta) / (actual.width * actual.height);
  return { pass: score >= limit.minSsim && changedRatio <= limit.maxChangedRatio, ssim: score, changedRatio };
}
```

Fixtures cover landscape whiteboard, portrait chalkboard, warm-story, tech-dark, diorama/Three.js, and registered local-image media. Each fixture fixes Chromium channel, viewport, DPR 1, fonts, page source, cue timeline, and sample milliseconds.

- [ ] **Step 4: Run GREEN**

Run: `PLAYWRIGHT_CHANNEL=chrome pnpm exec vitest run tests/visual-parity/engine-parity.test.ts`

Expected: six fixtures PASS with metrics included in assertion output.

- [ ] **Step 5: Commit**

```bash
git add package.json tests/visual-parity tests/fixtures/visual-parity
git commit -m "test: compare timotv frames with frametell"
```

## Phase 2: Film Kit and Page Director Parity

### Task 3: Persisted film visual state contracts

**Files:**
- Modify: `packages/contracts/src/artwork.ts`
- Modify: `packages/contracts/src/review.ts`
- Modify: `packages/contracts/src/production.ts`
- Test: `tests/artwork-contract.test.ts`
- Test: `tests/review-contract.test.ts`

**Interfaces:**
- Produces: `FilmKitItem`, `FilmKitComponentResult`, `FilmKitState`, `WholeFilmReview`, `FilmVisualState` and schemas.
- Consumes: existing `SceneProgramV3`, `ReviewIssue`, and `Production`.

- [ ] **Step 1: Add failing schema tests**

```ts
it('accepts a partial checked Film Kit and bounded whole-film review', () => {
  const visual = filmVisualStateSchema.parse({
    upstreamRevision: '6145f7e3482628543bd6f2d68fe3b618d366213a',
    engineRevision: 'sha256:' + 'a'.repeat(64),
    style: 'chalkboard',
    filmKit: {
      status: 'partial', source: '(function(B){})();', sourceHash: 'b'.repeat(64),
      components: [{ name: 'coffeeCup', pages: ['p01', 'p03'], status: 'passed' }],
    },
    wholeFilmReview: { fingerprint: 'c'.repeat(64), status: 'checking', round: 0, issues: [] },
  });
  expect(visual.filmKit?.components[0].name).toBe('coffeeCup');
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/artwork-contract.test.ts tests/review-contract.test.ts`

Expected: FAIL because film-level visual contracts are missing.

- [ ] **Step 3: Add strict schemas and Production field**

```ts
export const filmKitItemSchema = z.object({
  name: z.string().regex(/^[a-z][A-Za-z0-9]{1,23}$/),
  what: z.string().trim().min(1).max(300),
  pages: z.array(id).min(2).max(30),
}).strict();
export const filmVisualStateSchema = z.object({
  upstreamRevision: z.string().regex(/^[a-f0-9]{40}$/),
  engineRevision: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  style: drawingStyleSchema,
  filmKit: filmKitStateSchema.optional(),
  wholeFilmReview: wholeFilmReviewSchema.optional(),
}).strict();
```

Add `visual?: FilmVisualState` to `Production`; keep it optional so all existing records parse unchanged.

- [ ] **Step 4: Run GREEN and serialization regression**

Run: `pnpm exec vitest run tests/artwork-contract.test.ts tests/review-contract.test.ts tests/production.test.ts && pnpm typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/contracts/src/artwork.ts packages/contracts/src/review.ts packages/contracts/src/production.ts tests/artwork-contract.test.ts tests/review-contract.test.ts
git commit -m "feat: persist film visual quality state"
```

### Task 4: Film Kit planning and source generation

**Files:**
- Create: `packages/agent/src/director/film-kit.ts`
- Create: `packages/agent/prompts/FILM_KIT.md`
- Modify: `packages/agent/src/director/index.ts`
- Modify: `packages/agent/src/index.ts`
- Test: `tests/film-kit-director.test.ts`

**Interfaces:**
- Produces: `planFilmKit(production): FilmKitItem[]` and `generateFilmKitPart(production, item, model, signal): Promise<FilmKitPart>`.
- Consumes: storyboard/scenes, drawing-engine reserved/style component names, and `JsonGenerator`.

- [ ] **Step 1: Write failing plan and generation tests**

```ts
it('keeps at most three valid subjects recurring on two or more pages', () => {
  expect(planFilmKit(fixture)).toEqual([
    { name: 'coffeeCup', what: '同一只白色陶瓷咖啡杯', pages: ['p01', 'p03', 'p05'] },
  ]);
});

it('rejects kit source that replaces a reserved component', async () => {
  await expect(generateFilmKitPart(fixture, item, generator("B.title = function(){}"))).rejects.toThrow('FILM_KIT_INVALID');
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/film-kit-director.test.ts`

Expected: FAIL because Film Kit director functions do not exist.

- [ ] **Step 3: Implement bounded planning and source validation**

```ts
export const KIT_MIN_PAGES = 2;
export const KIT_MAX = 3;
export function planFilmKit(p: Production): FilmKitItem[] {
  const candidates = extractRecurringSubjects(p.storyboard, p.scenes);
  return candidates
    .filter((item) => item.pages.length >= KIT_MIN_PAGES)
    .filter((item) => !reservedComponentNames().has(item.name))
    .slice(0, KIT_MAX);
}

export async function generateFilmKitPart(p, item, model, signal) {
  const result = await model.generate(prompt, JSON.stringify({ item, storyboard: p.storyboard, style: p.visual?.style }), signal);
  const part = filmKitPartSchema.parse(result.value);
  assertSafeFilmKitSource(item.name, part.source);
  return { ...part, sourceHash: hashProgramSource(part.source), usage: result.usage };
}
```

`FILM_KIT.md` requires one `B.<name> = function` definition, stable options, no page composition, and a separate check snippet sized to the assigned cell.

- [ ] **Step 4: Run GREEN**

Run: `pnpm exec vitest run tests/film-kit-director.test.ts tests/pi-runtime.test.ts && pnpm typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/agent/src/director/film-kit.ts packages/agent/prompts/FILM_KIT.md packages/agent/src/director/index.ts packages/agent/src/index.ts tests/film-kit-director.test.ts
git commit -m "feat: generate reusable film components"
```

### Task 5: Film Kit runtime check and visual review

**Files:**
- Create: `packages/renderer/src/film-kit-review.ts`
- Create: `apps/worker/src/handlers/film-kit.ts`
- Modify: `packages/renderer/src/index.ts`
- Modify: `apps/worker/src/handlers/production.ts`
- Test: `tests/film-kit-review.test.ts`
- Test: `tests/integration/film-kit-review.test.ts`

**Interfaces:**
- Produces: `captureFilmKitReview(p, root, signal): Promise<FilmKitEvidence>` and `filmKitReviewer(root, env, vision?)`.
- Consumes: generated parts, drawing engine, visual model, object storage.

- [ ] **Step 1: Write failing capture/checkpoint tests**

```ts
it('captures every component before calling the reviewer', async () => {
  const evidence = await captureFilmKitReview(production, root, AbortSignal.timeout(5000));
  expect(evidence.frames).toHaveLength(production.visual!.filmKit!.components.length);
  expect(evidence.issues).toEqual([]);
});

it('drops only a broken component and preserves passed source', async () => {
  const reviewed = await reviewer(fixtureWithOneCrash, signal, checkpoint);
  expect(reviewed.visual?.filmKit?.status).toBe('partial');
  expect(reviewed.visual?.filmKit?.components.map((x) => x.status)).toEqual(['passed', 'failed']);
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/film-kit-review.test.ts tests/integration/film-kit-review.test.ts`

Expected: FAIL because check-page composition and reviewer do not exist.

- [ ] **Step 3: Build the isolated check page and reviewer**

```ts
export async function captureFilmKitReview(p, root, signal) {
  const kit = requireFilmKit(p);
  const document = filmKitReviewHtml(p, kit);
  const times = kit.components.map((_, index) => (index + 1) * 2600 - 300);
  return captureReviewDocument({ document, times, root, prefix: kitArtifactPrefix(p), signal, determinism: true });
}
```

The worker checkpoints frames before the vision call, reuses frames by fingerprint, sends at most six component frames, repairs only the owning component, and limits each component to two repairs.

- [ ] **Step 4: Run GREEN**

Run: `RUN_INTEGRATION=1 pnpm exec vitest run tests/film-kit-review.test.ts tests/integration/film-kit-review.test.ts && pnpm typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/renderer/src/film-kit-review.ts packages/renderer/src/index.ts apps/worker/src/handlers/film-kit.ts apps/worker/src/handlers/production.ts tests/film-kit-review.test.ts tests/integration/film-kit-review.test.ts
git commit -m "feat: review film-specific components"
```

### Task 6: Runner Film Kit checkpoints and recovery

**Files:**
- Modify: `packages/core/src/production/runner.ts`
- Modify: `apps/worker/src/handlers/production.ts`
- Test: `tests/production-runner.test.ts`
- Test: `tests/production-recovery.test.ts`

**Interfaces:**
- Adds `planFilmKit`, `generateFilmKitPart`, and `reviewFilmKit` to `ProductionOperations`.
- Guarantees checked Film Kit completion before page generation and no repeated paid call after a checkpoint.

- [ ] **Step 1: Add failing orchestration and resume tests**

```ts
it('checks Film Kit once before drawing pages and resumes passed parts', async () => {
  await run('job');
  expect(calls).toEqual(['plan-kit', 'part:cup', 'part:machine', 'review-kit', 'page:p01', 'page:p02', 'compose']);
  await resumedRun('job-2');
  expect(calls.filter((x) => x.startsWith('part:'))).toHaveLength(2);
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/production-runner.test.ts tests/production-recovery.test.ts`

Expected: FAIL because the runner starts pages without a Film Kit stage.

- [ ] **Step 3: Add idempotent Film Kit orchestration**

```ts
if (!p.visual?.filmKit) {
  p = await ops.planFilmKit(p, signal);
  await store.checkpoint(p, id, 45);
}
for (const item of pendingFilmKitItems(p)) {
  p = await ops.generateFilmKitPart(p, item.name, signal);
  await store.checkpoint(p, id, 46);
}
if (needsFilmKitReview(p)) {
  p = await ops.reviewFilmKit(p, signal, checkpointAt(48));
  await store.checkpoint(p, id, 49);
}
```

No Film Kit or a failed Film Kit degrades to page-local drawing. A stale job cannot checkpoint because the store still verifies `projectId + revision + jobId`.

- [ ] **Step 4: Run GREEN and crash-boundary tests**

Run: `pnpm exec vitest run tests/production-runner.test.ts tests/production-recovery.test.ts tests/production-failure.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/production/runner.ts apps/worker/src/handlers/production.ts tests/production-runner.test.ts tests/production-recovery.test.ts
git commit -m "feat: checkpoint film kit production"
```

### Task 7: Page director context, lanes, and Film Kit injection

**Files:**
- Modify: `packages/agent/prompts/PAGE_PROGRAM.md`
- Modify: `packages/agent/skills/program-drawing/SKILL.md`
- Modify: `packages/agent/src/director/program.ts`
- Create: `packages/agent/src/director/page-lanes.ts`
- Modify: `packages/renderer/src/program.ts`
- Test: `tests/program-director.test.ts`
- Test: `tests/page-lanes.test.ts`
- Test: `tests/program-source.test.ts`

**Interfaces:**
- Produces: `pageLanePlan(sceneIds, maxConcurrent): PageLane[]` and richer `PageProgramInput` with Film Kit, previous-page summary, style grammar, exact cues, and standing directions.
- Consumes: checked Film Kit source and current/adjacent scenes.

- [ ] **Step 1: Add failing lane/context tests**

```ts
it('keeps adjacent pages in the same continuity lane', () => {
  expect(pageLanePlan(['p01','p02','p03','p04','p05'], 2)).toEqual([
    { id: 'lane-1', sceneIds: ['p01','p02','p03'] },
    { id: 'lane-2', sceneIds: ['p04','p05'] },
  ]);
});

it('sends the checked Film Kit and previous visual summary to page generation', async () => {
  await illustrateFilmSceneProgram(fixture, 1, recordingModel);
  expect(request.filmKit.components).toContain('coffeeCup');
  expect(request.previousPage.sceneId).toBe('p01');
  expect(request.cues[0].localStartSec).toBe(0);
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/program-director.test.ts tests/page-lanes.test.ts tests/program-source.test.ts`

Expected: FAIL because lane planning and Film Kit context are absent.

- [ ] **Step 3: Add continuity context and trusted Film Kit loading**

```ts
export function pageLanePlan(ids: string[], maxConcurrent: number): PageLane[] {
  const count = Math.max(1, Math.min(maxConcurrent, Math.ceil(ids.length / 3)));
  const size = Math.ceil(ids.length / count);
  return Array.from({ length: count }, (_, index) => ({ id: `lane-${index + 1}`, sceneIds: ids.slice(index * size, (index + 1) * size) })).filter((lane) => lane.sceneIds.length);
}
```

`program.ts` supplies `filmKit`, `previousPage`, `standingDirections`, exact cue timing, and the upstream style `GRAMMAR.md`. `renderer/program.ts` loads checked Film Kit source before page source; page source cannot redefine a Film Kit component.

- [ ] **Step 4: Run GREEN and rendering regression**

Run: `pnpm exec vitest run tests/program-director.test.ts tests/page-lanes.test.ts tests/program-source.test.ts tests/film.test.ts && pnpm typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/agent/prompts/PAGE_PROGRAM.md packages/agent/skills/program-drawing/SKILL.md packages/agent/src/director/program.ts packages/agent/src/director/page-lanes.ts packages/renderer/src/program.ts tests/program-director.test.ts tests/page-lanes.test.ts tests/program-source.test.ts
git commit -m "feat: align page director continuity"
```

### Task 8: Page check parity and automatic repair loop

**Files:**
- Modify: `packages/renderer/src/review.ts`
- Modify: `packages/renderer/src/browser-measure.ts`
- Modify: `apps/worker/src/handlers/review.ts`
- Modify: `packages/agent/src/review.ts`
- Modify: `packages/core/src/production/runner.ts`
- Test: `tests/visual-review.test.ts`
- Test: `tests/review-runner.test.ts`
- Test: `tests/integration/visual-review-workflow.test.ts`

**Interfaces:**
- Produces Frametell-equivalent sample times, determinism evidence, lint severity, screenshots, and at most two targeted repair rounds.
- Consumes V3 page source, exact cues, reviewer model, and persisted review state.

- [ ] **Step 1: Add failing sample, determinism, and repair-limit tests**

```ts
it('samples cue boundaries, action midpoints, camera endpoints, and held end state', () => {
  expect(reviewTimes(scene)).toEqual([0, 900, 1800, 2700, 3900, 4800]);
});

it('repairs a must-fix page twice and then persists needs_attention', async () => {
  await expect(run('job')).resolves.toBeUndefined();
  expect(repairCalls).toBe(2);
  expect(saved.scenes[0].review?.status).toBe('needs_attention');
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/visual-review.test.ts tests/review-runner.test.ts tests/integration/visual-review-workflow.test.ts`

Expected: FAIL on missing action/camera samples and current repair behavior.

- [ ] **Step 3: Align sampling and repair semantics**

```ts
const MUST_FIX = (issue: ReviewIssue) => issue.severity === 'error' || issue.kind === 'runtime';
while (scene.review && scene.review.issues.some(MUST_FIX) && scene.review.round < 2) {
  setReview({ status: 'repairing', round: scene.review.round + 1 });
  await checkpoint();
  p = await ops.repairScene!(p, index, signal);
  p = await ops.reviewScene!(p, index, signal, checkpoint);
}
```

Runtime/layout errors block composition. Visual warnings become `needs_attention` after the repair limit and require explicit user acceptance. Determinism renders the same time twice and records a runtime error when the pixel hash differs.

- [ ] **Step 4: Run GREEN**

Run: `RUN_INTEGRATION=1 pnpm exec vitest run tests/visual-review.test.ts tests/review-runner.test.ts tests/integration/visual-review-workflow.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/renderer/src/review.ts packages/renderer/src/browser-measure.ts apps/worker/src/handlers/review.ts packages/agent/src/review.ts packages/core/src/production/runner.ts tests/visual-review.test.ts tests/review-runner.test.ts tests/integration/visual-review-workflow.test.ts
git commit -m "feat: align page review and repair loop"
```

## Phase 3: Whole-Film Review and Rendering Parity

### Task 9: Whole-film contact sheet and vision verdict

**Files:**
- Create: `packages/renderer/src/whole-film-review.ts`
- Create: `packages/agent/src/whole-film-review.ts`
- Create: `apps/worker/src/handlers/whole-film.ts`
- Modify: `packages/renderer/src/index.ts`
- Modify: `packages/agent/src/index.ts`
- Test: `tests/whole-film-review.test.ts`
- Test: `tests/integration/whole-film-review.test.ts`

**Interfaces:**
- Produces: `captureWholeFilmReview(p, root, signal)`, `reviewWholeFilm(p, evidence, model, signal)`, and `wholeFilmReviewer(root, env, vision?)`.
- Consumes passed/accepted page reviews, final page states, exact timeline, and vision model.

- [ ] **Step 1: Add failing contact-sheet and verdict tests**

```ts
it('captures one labelled representative frame per page plus transitions', async () => {
  const evidence = await captureWholeFilmReview(film, root, signal);
  expect(evidence.pages.map((x) => x.sceneId)).toEqual(['p01','p02','p03']);
  expect(evidence.sheetKey).toMatch(/whole-film-r0\.jpg$/);
});

it('rejects issues outside real pages or time ranges', async () => {
  await expect(reviewWholeFilm(film, evidence, invalidModel, signal)).rejects.toThrow('WHOLE_FILM_REVIEW_INVALID');
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/whole-film-review.test.ts tests/integration/whole-film-review.test.ts`

Expected: FAIL because no whole-film capture/reviewer exists.

- [ ] **Step 3: Implement bounded evidence and structured verdict**

```ts
export const wholeFilmVerdictSchema = z.object({
  pass: z.boolean(),
  issues: z.array(z.object({ sceneId: id, atMs: z.number().int().nonnegative(), what: text.max(600), fix: text.max(1000) })).max(12),
}).superRefine((value, ctx) => {
  if (value.pass !== (value.issues.length === 0)) ctx.addIssue({ code: 'custom', message: '全片结论与问题数量不一致' });
});
```

Capture final stable states and page transition frames, label them outside the video canvas, persist evidence before model calls, and validate every issue against the target scene's cue range.

- [ ] **Step 4: Run GREEN**

Run: `RUN_INTEGRATION=1 pnpm exec vitest run tests/whole-film-review.test.ts tests/integration/whole-film-review.test.ts && pnpm typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/renderer/src/whole-film-review.ts packages/renderer/src/index.ts packages/agent/src/whole-film-review.ts packages/agent/src/index.ts apps/worker/src/handlers/whole-film.ts tests/whole-film-review.test.ts tests/integration/whole-film-review.test.ts
git commit -m "feat: review cross-page film consistency"
```

### Task 10: Whole-film targeted repair orchestration

**Files:**
- Modify: `packages/core/src/production/runner.ts`
- Modify: `apps/worker/src/handlers/production.ts`
- Modify: `packages/contracts/src/production-failure.ts`
- Test: `tests/production-runner.test.ts`
- Test: `tests/production-errors.test.ts`
- Test: `tests/production-recovery.test.ts`

**Interfaces:**
- Adds `reviewWholeFilm` operation and reuses `repairScene` for affected pages.
- Guarantees at most two whole-film rounds and rechecks only issue-bearing pages.

- [ ] **Step 1: Add failing affected-page and resume tests**

```ts
it('repairs only pages named by whole-film review and stops after two rounds', async () => {
  await run('job');
  expect(repaired).toEqual(['p02', 'p02', 'p04']);
  expect(saved.visual?.wholeFilmReview?.round).toBe(2);
});

it('resumes from persisted whole-film evidence without recapturing it', async () => {
  await resumedRun('job');
  expect(captureCalls).toBe(0);
  expect(reviewCalls).toBe(1);
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/production-runner.test.ts tests/production-recovery.test.ts tests/production-errors.test.ts`

Expected: FAIL because composition starts immediately after page review.

- [ ] **Step 3: Add bounded whole-film loop before compose**

```ts
for (;;) {
  p = await ops.reviewWholeFilm!(p, signal, checkpointAt(88));
  const review = p.visual?.wholeFilmReview;
  if (!review || review.status === 'passed' || review.round >= 2) break;
  for (const sceneId of [...new Set(review.issues.map((issue) => issue.sceneId))]) {
    p = await ops.repairScene!(p, sceneIndex(p, sceneId), signal, JSON.stringify(review.issues.filter((x) => x.sceneId === sceneId)));
    p = await ops.reviewScene!(p, sceneIndex(p, sceneId), signal, checkpointAt(89));
  }
  p = clearWholeFilmEvidenceForNextRound(p);
  await store.checkpoint(p, id, 90);
}
```

Map browser, vision, invalid-verdict, and repair failures to separate typed codes with the current scene ID when applicable.

- [ ] **Step 4: Run GREEN**

Run: `pnpm exec vitest run tests/production-runner.test.ts tests/production-recovery.test.ts tests/production-errors.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/production/runner.ts apps/worker/src/handlers/production.ts packages/contracts/src/production-failure.ts tests/production-runner.test.ts tests/production-recovery.test.ts tests/production-errors.test.ts
git commit -m "feat: repair whole-film consistency issues"
```

### Task 11: Preview, review, and MP4 render equivalence

**Files:**
- Modify: `packages/renderer/src/program-preview.ts`
- Modify: `packages/renderer/src/review.ts`
- Modify: `packages/renderer/src/film.ts`
- Modify: `packages/renderer/src/browser-runtime.ts`
- Test: `tests/film-timing.test.ts`
- Test: `tests/integration/preview.test.ts`
- Test: `tests/integration/browser-runtime.test.ts`
- Test: `tests/visual-parity/engine-parity.test.ts`

**Interfaces:**
- Produces a single trusted film document and `renderAt(globalMs)` path used by all browser consumers.
- Consumes exact cue timeline, engine/style assets, Film Kit, V3 pages, registered media, and render options.

- [ ] **Step 1: Add failing identical-document tests**

```ts
it('uses the same visual document for preview, review, and export', () => {
  const preview = filmHtml(film, { mode: 'preview' });
  const review = filmHtml(film, { mode: 'review' });
  const exportHtml = filmHtml(film, { mode: 'export' });
  expect(extractVisualPayload(review)).toEqual(extractVisualPayload(preview));
  expect(extractVisualPayload(exportHtml)).toEqual(extractVisualPayload(preview));
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/film-timing.test.ts tests/integration/preview.test.ts tests/integration/browser-runtime.test.ts`

Expected: FAIL where review/export build a different document or resource URL.

- [ ] **Step 3: Centralize the trusted visual payload**

```ts
export function visualFilmPayload(p: Production): VisualFilmPayload {
  return {
    timeline: exactTimeline(p),
    style: requireDrawingStyle(p),
    filmKit: checkedFilmKitSource(p),
    pages: p.scenes.map((scene) => requireProgramPage(scene)),
    media: registeredMedia(p),
    engineRevision: p.visual?.engineRevision,
  };
}
```

`mode` changes controls and debugging overlays only; it never changes visual assets, timing, canvas, DPR, or source. Export and review load registered files through the same resolver and reject missing keys before browser launch.

- [ ] **Step 4: Run GREEN and visual parity**

Run: `RUN_INTEGRATION=1 PLAYWRIGHT_CHANNEL=chrome pnpm exec vitest run tests/film-timing.test.ts tests/integration/preview.test.ts tests/integration/browser-runtime.test.ts tests/visual-parity/engine-parity.test.ts`

Expected: PASS at the spec's strict and WebGL thresholds.

- [ ] **Step 5: Commit**

```bash
git add packages/renderer/src/program-preview.ts packages/renderer/src/review.ts packages/renderer/src/film.ts packages/renderer/src/browser-runtime.ts tests/film-timing.test.ts tests/integration/preview.test.ts tests/integration/browser-runtime.test.ts tests/visual-parity/engine-parity.test.ts
git commit -m "fix: render one visual document everywhere"
```

## Phase 4: Quality Benchmark and Controlled Rollout

### Task 12: Reproducible six-topic quality benchmark

**Files:**
- Create: `benchmarks/video-parity/topics.json`
- Create: `benchmarks/video-parity/rubric.json`
- Create: `scripts/run-video-parity-benchmark.mjs`
- Create: `scripts/report-video-parity-benchmark.mjs`
- Create: `tests/video-parity-benchmark.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces `benchmark:video-parity` and a JSON/Markdown report for 18 Frametell/TimoTV pairs.
- Consumes fixed model/voice settings, six topics, production events, review state, output frames, and three blinded score files.

- [ ] **Step 1: Write failing report-gate tests**

```ts
it('passes only when every quality gate from the design is met', () => {
  expect(evaluateBenchmark(passingReport)).toEqual({ pass: true, failures: [] });
  expect(evaluateBenchmark({ ...passingReport, runtimeFailures: 1 }).pass).toBe(false);
  expect(evaluateBenchmark({ ...passingReport, meanScoreDelta: -0.26 }).pass).toBe(false);
  expect(evaluateBenchmark({ ...passingReport, preferredOrTiedRatio: 0.69 }).pass).toBe(false);
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/video-parity-benchmark.test.ts`

Expected: FAIL because benchmark schemas and gate evaluation do not exist.

- [ ] **Step 3: Add fixed topics, blind package, and exact gates**

```js
export function evaluateBenchmark(report) {
  const failures = [];
  if (report.runtimeFailures !== 0) failures.push('runtimeFailures');
  if (report.unresolvedRedLint !== 0) failures.push('unresolvedRedLint');
  if (report.reviewPassDelta < -0.05) failures.push('reviewPassDelta');
  if (report.meanScoreDelta < -0.25) failures.push('meanScoreDelta');
  if (report.preferredOrTiedRatio < 0.70) failures.push('preferredOrTiedRatio');
  return { pass: failures.length === 0, failures };
}
```

Topics are science, technical architecture, management/book, history, product introduction, and data explanation. Each runs three times with explicit provider/model/voice IDs. The report anonymizes A/B order per pair and refuses to evaluate fewer than three complete reviewer score files.

- [ ] **Step 4: Run GREEN with fixture data**

Run: `pnpm exec vitest run tests/video-parity-benchmark.test.ts && pnpm benchmark:video-parity -- --fixture`

Expected: tests PASS and fixture report lists 18 complete pairs.

- [ ] **Step 5: Commit**

```bash
git add package.json benchmarks/video-parity scripts/run-video-parity-benchmark.mjs scripts/report-video-parity-benchmark.mjs tests/video-parity-benchmark.test.ts
git commit -m "test: gate video quality against frametell"
```

### Task 13: Feature flag, UI status, E2E, and default switch

**Files:**
- Modify: `packages/contracts/src/settings.ts`
- Modify: `packages/storage/src/settings.ts`
- Modify: `apps/worker/src/handlers/production.ts`
- Modify: `apps/web/src/features/production/ProductionWorkspace.tsx`
- Modify: `apps/web/src/styles/production.css`
- Test: `tests/settings.test.ts`
- Test: `tests/e2e/production.spec.ts`
- Test: `tests/e2e/production-recovery.spec.ts`
- Modify: `docs/verification.md`
- Modify: `docs/roadmap.md`

**Interfaces:**
- Produces `videoPipeline: 'legacy-v3' | 'frametell-parity'`, environment override `TIMOTV_FRAMETELL_PARITY`, and visible Film Kit/page/whole-film progress.
- Consumes all prior phases and benchmark result.

- [ ] **Step 1: Add failing flag and E2E tests**

```ts
it('defaults existing settings to legacy and accepts parity explicitly', () => {
  expect(settingsSchema.parse({}).production.videoPipeline).toBe('legacy-v3');
  expect(settingsSchema.parse({ production: { videoPipeline: 'frametell-parity' } }).production.videoPipeline).toBe('frametell-parity');
});

test('parity production shows kit, pages, whole-film review, preview, and MP4', async ({ page }) => {
  await createParityProduction(page);
  await expect(page.getByText('正在建立影片视觉组件')).toBeVisible();
  await expect(page.getByText('正在进行全片一致性检查')).toBeVisible();
  await expect(page.getByRole('button', { name: '导出 MP4' })).toBeEnabled();
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm exec vitest run tests/settings.test.ts && PLAYWRIGHT_CHANNEL=chrome pnpm exec playwright test tests/e2e/production.spec.ts tests/e2e/production-recovery.spec.ts`

Expected: FAIL because the flag and parity statuses are absent.

- [ ] **Step 3: Add controlled selection and progress copy**

```ts
const pipeline = env.TIMOTV_FRAMETELL_PARITY === '1'
  ? 'frametell-parity'
  : settings.production.videoPipeline;
return pipeline === 'frametell-parity'
  ? parityProductionOperations(dependencies)
  : legacyProductionOperations(dependencies);
```

Keep existing projects on their recorded pipeline. New projects use the configured default. The UI shows Film Kit component count, page review progress, whole-film round, and actionable failures without exposing implementation details.

- [ ] **Step 4: Run full verification and live benchmark**

Run: `pnpm typecheck && pnpm test`

Run: `RUN_INTEGRATION=1 pnpm test:integration`

Run: `PLAYWRIGHT_CHANNEL=chrome pnpm test:e2e`

Run: `pnpm engine:audit && PLAYWRIGHT_CHANNEL=chrome pnpm benchmark:video-parity`

Expected: all automated suites PASS; live benchmark reports 18 pairs, zero runtime failures, zero unresolved red lint, review pass delta ≥ -0.05, mean score delta ≥ -0.25, preferred/tied ratio ≥ 0.70.

- [ ] **Step 5: Switch the default only after gates pass and commit**

Change the default to `frametell-parity` in `settings.ts` only when the saved live benchmark report passes. Record the report path and locked upstream hash in `docs/verification.md`.

```bash
git add packages/contracts/src/settings.ts packages/storage/src/settings.ts apps/worker/src/handlers/production.ts apps/web/src/features/production/ProductionWorkspace.tsx apps/web/src/styles/production.css tests/settings.test.ts tests/e2e/production.spec.ts tests/e2e/production-recovery.spec.ts docs/verification.md docs/roadmap.md
git commit -m "feat: enable frametell-quality video pipeline"
```

