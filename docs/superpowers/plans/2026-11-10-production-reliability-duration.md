# Production Reliability and Duration Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single browser execution boundary, actionable structured production failures, and a measured TTS duration loop that keeps ordinary generated videos within ±10% of the selected target.

**Architecture:** Renderer-owned `BrowserRuntime` installs versioned browser code and owns Chrome lifecycle. Core production operations throw `ProductionFailureError`, which is sanitized and persisted as a typed failure instead of being reduced to a generic string. Planning and scripting allocate duration budgets; narration measures real audio and runs at most two script-correction rounds while reusing unchanged cue audio.

**Tech Stack:** TypeScript 5.9, Zod, Prisma/PostgreSQL, BullMQ/Redis, Playwright Core/Chrome, Vitest, React, Fireworks-style Pi model runtime, Volcengine TTS, FFmpeg.

## Global Constraints

- Ordinary AI-authored narration is accepted only when measured TTS duration is between 90% and 110% of `brief.durationSec`.
- Automatic duration correction runs at most two rounds.
- `verbatim` narration is never automatically rewritten, expanded, or shortened.
- Existing completed productions are not automatically rewritten; the new policy applies when production is run again.
- Public failures must never expose API keys, tokens, authorization headers, cookies, URL passwords, database credentials, or raw provider responses.
- Completed model, TTS, artwork, and review checkpoints remain reusable when their input fingerprint is unchanged.
- Production code must not pass imported or closure-dependent functions directly to `page.evaluate`.
- Every behavior change follows red-green-refactor and ends with a focused commit.

---

## File Structure

**Create**

- `packages/contracts/src/production-failure.ts`: failure codes, phases, context schema, and public contract.
- `packages/core/src/production/failure.ts`: typed error class, sanitizer, and unknown-error mapper.
- `packages/renderer/src/browser-runtime.ts`: Chrome discovery, page bootstrap, browser runtime calls, and browser error mapping.
- `packages/renderer/src/browser-measure-script.ts`: browser-installable measurement source with no Node closure.
- `packages/agent/src/director/duration.ts`: duration bands, narration estimation, scene budgets, and correction prompts.
- `tests/production-failure.test.ts`: failure mapping and secret-redaction tests.
- `tests/duration-policy.test.ts`: duration policy, estimation, and budget tests.
- `tests/integration/browser-runtime.test.ts`: real TSX + Chrome browser-boundary tests.
- `tests/integration/duration-correction.test.ts`: measured-duration correction and cue-cache tests.

**Modify**

- `packages/contracts/src/production.ts`: narration mode, source narration, scene budget, duration state, and failure fields.
- `packages/contracts/src/index.ts`: export new contracts.
- `packages/core/src/production/runner.ts`: carry typed failures and add duration-correction checkpoints.
- `packages/core/src/production/service.ts`: validate narration mode and expose retry/accept-duration actions.
- `packages/core/src/ports/index.ts`: typed failure store interface.
- `packages/db/src/production-run.ts`: persist failure code/context and duration checkpoints atomically.
- `packages/db/src/production.ts`: reset/preserve duration state correctly across actions.
- `packages/agent/src/director/index.ts`: plan scene budgets, estimate script duration, and generate correction drafts.
- `packages/agent/prompts/PLANNER.md`: require per-scene duration budgets.
- `packages/agent/prompts/SCRIPT.md`: require narration to consume scene budgets.
- `packages/agent/skills/shared/planning.md`: duration allocation rules.
- `packages/agent/skills/shared/script.md`: target-band and correction rules.
- `packages/speech/src/film.ts`: cue fingerprint cache and measured-duration result.
- `packages/renderer/src/review.ts`: use `BrowserRuntime` for review capture.
- `packages/renderer/src/film.ts`: use `BrowserRuntime` for MP4 frames.
- `packages/renderer/src/index.ts`: export runtime types needed by worker preflight.
- `apps/worker/src/handlers/production.ts`: map component errors into typed failures and wire correction operations.
- `apps/worker/src/bootstrap/index.ts`: run dependency preflight and log sanitized diagnostic IDs.
- `apps/api/src/routes/production.ts`: return structured production failure and duration actions.
- `apps/web/src/features/production/BriefFields.tsx`: explicit AI/verbatim narration mode.
- `apps/web/src/features/production/ProductionWorkspace.tsx`: actionable failure card and duration decisions.
- `apps/web/src/features/production/FilmStage.tsx`: target, estimated, and measured duration display.
- `apps/web/src/features/production/useProduction.ts`: accept actual duration and retry exact failure action.
- `apps/web/src/styles/production.css`: failure and duration status styling.
- `tests/production-runner.test.ts`: typed failure persistence and resume tests.
- `tests/production-service.test.ts`: narration mode and duration action validation.
- `tests/production-errors.test.ts`: component error mapping expectations.
- `tests/volcengine-film.test.ts`: changed-cue cache reuse.
- `tests/e2e/production.spec.ts`: five-minute selection and duration status.
- `tests/e2e/production-recovery.spec.ts`: exact phase retry without repeated TTS.
- `docs/development.md`: local preflight, failure codes, and duration policy.

---

### Task 1: Structured Production Failure Contract

**Files:**
- Create: `packages/contracts/src/production-failure.ts`
- Create: `packages/core/src/production/failure.ts`
- Modify: `packages/contracts/src/production.ts`
- Modify: `packages/contracts/src/index.ts`
- Test: `tests/production-failure.test.ts`

**Interfaces:**
- Produces: `ProductionFailure`, `ProductionFailureContext`, `ProductionFailureError`, `toProductionFailure(error, fallback)` and `sanitizeCause(value)`.
- Consumes: no new project interfaces.

- [ ] **Step 1: Write failing contract and sanitizer tests**

```ts
import { expect, it } from 'vitest';
import {
  ProductionFailureError,
  sanitizeCause,
  toProductionFailure,
} from '../packages/core/src/production/failure.js';

it('preserves typed failure phase and retry context', () => {
  const failure = toProductionFailure(
    new ProductionFailureError({
      code: 'REVIEW_BROWSER_RUNTIME_FAILED',
      phase: 'reviewing',
      retryable: true,
      publicMessage: '第 2 页关键帧检查失败，可重试本页',
      context: { sceneId: 'p02' },
    }),
    { phase: 'illustrating' },
  );
  expect(failure).toMatchObject({
    code: 'REVIEW_BROWSER_RUNTIME_FAILED',
    phase: 'reviewing',
    retryable: true,
    context: { sceneId: 'p02' },
  });
  expect(failure.diagnosticId).toMatch(/^[a-f0-9-]{36}$/);
});

it('redacts credentials from internal cause summaries', () => {
  expect(
    sanitizeCause(
      'Authorization: Bearer secret-token postgresql://user:pass@localhost db API_KEY=abc',
    ),
  ).not.toMatch(/secret-token|user:pass|abc/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm exec vitest run tests/production-failure.test.ts`

Expected: FAIL because `packages/core/src/production/failure.ts` and the exported contract do not exist.

- [ ] **Step 3: Implement the failure schema and mapper**

```ts
export const productionPhaseSchema = z.enum([
  'planning', 'scripting', 'narrating', 'illustrating', 'reviewing',
  'composing', 'rendering', 'storage', 'queue',
]);
export const productionFailureSchema = z.object({
  code: z.string().regex(/^[A-Z][A-Z0-9_]+$/),
  phase: productionPhaseSchema,
  retryable: z.boolean(),
  publicMessage: z.string().min(1).max(500),
  diagnosticId: z.string().uuid(),
  context: z.object({ sceneId: z.string().optional(), cueId: z.string().optional() }).optional(),
  causeSummary: z.string().max(800).optional(),
});
```

Implement `ProductionFailureError` so its constructor accepts all fields except `diagnosticId`, adds `randomUUID()`, and retains the original error through `ErrorOptions.cause`. Implement `sanitizeCause` with explicit redaction for bearer credentials, URL passwords, key/token assignments, and known environment variable names. Unknown errors map to `PRODUCTION_UNKNOWN_FAILED` with the supplied fallback phase and safe public copy.

- [ ] **Step 4: Add optional `failure?: ProductionFailure` to `Production` and export all types**

Keep the existing `error?: string` during migration. New writes populate both `failure.publicMessage` and `error`; readers prefer `failure`.

- [ ] **Step 5: Run tests and typecheck**

Run: `pnpm exec vitest run tests/production-failure.test.ts && pnpm --filter @timotv/contracts build && pnpm --filter @timotv/core build`

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/contracts/src/production-failure.ts packages/contracts/src/production.ts packages/contracts/src/index.ts packages/core/src/production/failure.ts tests/production-failure.test.ts
git commit -m "feat: add structured production failures"
```

### Task 2: Persist Failures and Resume Exact Phases

**Files:**
- Modify: `packages/core/src/production/runner.ts`
- Modify: `packages/core/src/ports/index.ts`
- Modify: `packages/db/src/production-run.ts`
- Modify: `packages/db/src/production.ts`
- Modify: `apps/worker/src/handlers/production.ts`
- Test: `tests/production-runner.test.ts`
- Test: `tests/production-errors.test.ts`

**Interfaces:**
- Consumes: `ProductionFailure`, `toProductionFailure` from Task 1.
- Produces: `ProductionRunStore.fail(p, id, action, failure)` and stable component error mapping.

- [ ] **Step 1: Write failing runner persistence tests**

Add a store spy whose operation throws `ProductionFailureError` with phase `reviewing` and scene `p01`. Assert the store receives that exact failure, `p.failure` matches it, `p.error` equals its public message, and the failed scene retains `resume: 'checking'`.

- [ ] **Step 2: Verify RED**

Run: `pnpm exec vitest run tests/production-runner.test.ts tests/production-errors.test.ts`

Expected: FAIL because `ProductionRunStore.fail` still accepts a string and the job always stores `PRODUCTION_FAILED`.

- [ ] **Step 3: Change the runner/store boundary from string to `ProductionFailure`**

```ts
fail(
  p: Production,
  id: string,
  action: Job['type'],
  failure: ProductionFailure,
): Promise<void>;
```

Track the current phase and scene index in `runner.ts`. In the catch block call `toProductionFailure(error, { phase, sceneId })`, persist it, then throw `ProductionFailureError.from(failure)` so BullMQ keeps a safe message.

- [ ] **Step 4: Persist stable Job and Production fields atomically**

In `production-run.ts`, write `failure.code` to `Job.errorCode`, `failure.publicMessage` to `Job.errorMessage`, and the full sanitized failure object to Production JSON. Clear `failure` when claiming a new task. Keep `failedAction` for backward-compatible retry routing.

- [ ] **Step 5: Replace string heuristics with explicit component mappings**

Keep a compatibility adapter for existing model error codes, but return typed failures for TTS, artwork, review, Chrome, FFmpeg, database, and queue errors. The final unknown branch must be `PRODUCTION_UNKNOWN_FAILED`, not a message blaming every service.

- [ ] **Step 6: Run focused and integration tests**

Run: `pnpm exec vitest run tests/production-runner.test.ts tests/production-errors.test.ts tests/integration/production.test.ts`

Expected: all tests pass and public errors contain no injected secret strings.

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/production/runner.ts packages/core/src/ports/index.ts packages/db/src/production-run.ts packages/db/src/production.ts apps/worker/src/handlers/production.ts tests/production-runner.test.ts tests/production-errors.test.ts
git commit -m "feat: persist actionable production failures"
```

### Task 3: BrowserRuntime Boundary

**Files:**
- Create: `packages/renderer/src/browser-runtime.ts`
- Create: `packages/renderer/src/browser-measure-script.ts`
- Modify: `packages/renderer/src/review.ts`
- Modify: `packages/renderer/src/film.ts`
- Modify: `packages/renderer/src/index.ts`
- Test: `tests/integration/browser-runtime.test.ts`
- Test: `tests/integration/review-capture.test.ts`
- Test: `tests/integration/v3-video.test.ts`

**Interfaces:**
- Consumes: `ProductionFailureError` from Task 1.
- Produces: `createBrowserRuntime(options)`, `runtime.newFilmPage(production)`, `page.renderAt(ms)`, `page.measure(input)`, `page.screenshot(path)`, `runtime.preflight()`.

- [ ] **Step 1: Write a failing real-TSX browser test**

The test launches a child with `process.execPath`, `--import tsx`, and a fixture module that imports `createBrowserRuntime`. It opens a film page, calls `measure`, and expects a non-empty result without `ReferenceError: __name is not defined`. A second test supplies a browser function that throws and expects code `REVIEW_BROWSER_RUNTIME_FAILED`.

- [ ] **Step 2: Verify RED**

Run: `RUN_INTEGRATION=1 pnpm exec vitest run tests/integration/browser-runtime.test.ts`

Expected: FAIL because BrowserRuntime is not implemented.

- [ ] **Step 3: Implement browser discovery and lifecycle**

```ts
export interface BrowserRuntimePage {
  renderAt(timeMs: number): Promise<void>;
  measure(input: ReviewMeasureInput): Promise<ReviewIssue[]>;
  screenshot(path: string): Promise<void>;
  close(): Promise<void>;
}
export interface BrowserRuntime {
  preflight(): Promise<void>;
  newFilmPage(p: Production, signal?: AbortSignal): Promise<BrowserRuntimePage>;
  close(): Promise<void>;
}
```

The runtime owns Chrome path lookup, `chromium.launch`, viewport selection, abort listeners, `filmHtml`, font readiness, and cleanup. Map missing executable, launch errors, page errors, evaluate errors, timeout, and abort separately.

- [ ] **Step 4: Install versioned browser measurement code**

Expose `window.TIMO_BROWSER_RUNTIME = { version, renderAt, measure }` through a string script generated in `browser-measure-script.ts`. `measure` contains all DOM helpers in browser scope. Node calls only short entry expressions; it never sends `measureReviewFrame` itself through Playwright serialization.

- [ ] **Step 5: Migrate review and export rendering**

Replace Chrome lookup and direct complex `page.evaluate` calls in `review.ts` and `film.ts`. Remove the temporary global `__name` injection after both call sites use BrowserRuntime.

- [ ] **Step 6: Run real browser suites**

Run: `RUN_INTEGRATION=1 pnpm exec vitest run tests/integration/browser-runtime.test.ts tests/integration/review-capture.test.ts tests/integration/v3-video.test.ts`

Expected: all tests pass in the TSX dev loader and compiled renderer.

- [ ] **Step 7: Commit**

```bash
git add packages/renderer/src/browser-runtime.ts packages/renderer/src/browser-measure-script.ts packages/renderer/src/review.ts packages/renderer/src/film.ts packages/renderer/src/index.ts tests/integration/browser-runtime.test.ts tests/integration/review-capture.test.ts tests/integration/v3-video.test.ts
git commit -m "refactor: centralize browser rendering runtime"
```

### Task 4: Worker Dependency Preflight

**Files:**
- Modify: `apps/worker/src/bootstrap/index.ts`
- Modify: `apps/api/src/routes/production.ts`
- Modify: `packages/core/src/production/service.ts`
- Test: `tests/dev-runtime-stability.test.ts`
- Test: `tests/production-service.test.ts`

**Interfaces:**
- Consumes: `BrowserRuntime.preflight()` and failure codes from Tasks 1 and 3.
- Produces: `ProductionCapabilities.runtime` with `database`, `queue`, `browser`, and `ffmpeg` status.

- [ ] **Step 1: Write failing capability and retry tests**

Assert a missing Chrome path returns `{ browser: { ready: false, code: 'REVIEW_BROWSER_MISSING' } }` without labelling the director model unavailable. Assert transient database/Redis startup failures are retried and do not leave a live watcher with no worker child.

- [ ] **Step 2: Verify RED**

Run: `pnpm exec vitest run tests/dev-runtime-stability.test.ts tests/production-service.test.ts`

Expected: FAIL because runtime dependency status is not exposed.

- [ ] **Step 3: Add preflight and bounded retry**

Run DB, Redis, Chrome runtime, and FFmpeg checks independently. Retry only recognized connection/startup errors with capped exponential delay between 500 ms and 5 seconds. Configuration and code errors fail immediately. Log only diagnostic ID, code, and component.

- [ ] **Step 4: Expose runtime capability without secrets**

Add runtime readiness to `/production/capabilities`; do not expose executable paths or connection strings. Reject an action before queueing only when the action requires an unavailable dependency.

- [ ] **Step 5: Run tests and commit**

Run: `pnpm exec vitest run tests/dev-runtime-stability.test.ts tests/production-service.test.ts`

```bash
git add apps/worker/src/bootstrap/index.ts apps/api/src/routes/production.ts packages/core/src/production/service.ts tests/dev-runtime-stability.test.ts tests/production-service.test.ts
git commit -m "feat: preflight production runtime dependencies"
```

### Task 5: Duration Contracts and Scene Budgets

**Files:**
- Create: `packages/agent/src/director/duration.ts`
- Modify: `packages/contracts/src/production.ts`
- Modify: `packages/agent/src/director/index.ts`
- Modify: `packages/agent/prompts/PLANNER.md`
- Modify: `packages/agent/skills/shared/planning.md`
- Test: `tests/duration-policy.test.ts`
- Test: `tests/director.test.ts`

**Interfaces:**
- Produces: `durationBand(targetSec)`, `allocateSceneBudgets(scenes, targetSec)`, `estimateNarrationMs(scenes, profile)`, `DurationState`, `narrationMode`, and `sourceNarration`.
- Consumes: existing `ProductionBrief`, `StoryboardPlan`, and scene schemas.

- [ ] **Step 1: Write failing duration-policy tests**

```ts
expect(durationBand(300)).toEqual({ targetMs: 300000, minMs: 270000, maxMs: 330000 });
expect(allocateSceneBudgets([{ weight: 1 }, { weight: 2 }], 300).reduce((n, x) => n + x, 0)).toBeGreaterThanOrEqual(285);
expect(allocateSceneBudgets([{ weight: 1 }, { weight: 2 }], 300).reduce((n, x) => n + x, 0)).toBeLessThanOrEqual(315);
```

Also assert `verbatim` requires non-empty `sourceNarration`, while `ai` strips an accidental source narration field from writes.

- [ ] **Step 2: Verify RED**

Run: `pnpm exec vitest run tests/duration-policy.test.ts tests/director.test.ts`

Expected: FAIL because budgets and narration modes do not exist.

- [ ] **Step 3: Add backward-compatible contracts**

Add optional persisted fields with defaults at service boundaries: `brief.narrationMode`, `brief.sourceNarration`, `planned.targetDurationSec`, and `production.durationState`. Existing JSON without fields must parse and display.

- [ ] **Step 4: Implement deterministic duration helpers**

Use scene `say`, beats, and visual complexity only to assign relative weights. Normalize integer seconds so total budget is within ±5% of target. Estimation profiles use configurable Chinese characters/second and English words/second plus punctuation pause costs; return both estimate and confidence.

- [ ] **Step 5: Require planner budgets and validate model output**

The planner prompt requires `targetDurationSec` for each scene. Normalize otherwise-valid output through `allocateSceneBudgets` so a weak model cannot omit or radically undershoot the budget.

- [ ] **Step 6: Run tests and commit**

Run: `pnpm exec vitest run tests/duration-policy.test.ts tests/director.test.ts tests/production-service.test.ts`

```bash
git add packages/agent/src/director/duration.ts packages/contracts/src/production.ts packages/agent/src/director/index.ts packages/agent/prompts/PLANNER.md packages/agent/skills/shared/planning.md tests/duration-policy.test.ts tests/director.test.ts tests/production-service.test.ts
git commit -m "feat: add production duration budgets"
```

### Task 6: Script Estimate Gate and Verbatim Mode

**Files:**
- Modify: `packages/agent/src/director/index.ts`
- Modify: `packages/agent/prompts/SCRIPT.md`
- Modify: `packages/agent/skills/shared/script.md`
- Modify: `packages/core/src/production/runner.ts`
- Test: `tests/director.test.ts`
- Test: `tests/production-runner.test.ts`

**Interfaces:**
- Consumes: duration helpers and contracts from Task 5.
- Produces: `reviseScriptForDuration(p, target, model, signal)` and pre-TTS duration checkpoint.

- [ ] **Step 1: Write failing AI and verbatim tests**

For an AI 300-second project whose generated text estimates at 90 seconds, assert one correction request includes per-scene deficits and the accepted revision estimates at least 255 seconds before TTS. For a verbatim project, assert output cue text concatenates to `sourceNarration` unchanged and no correction model call occurs.

- [ ] **Step 2: Verify RED**

Run: `pnpm exec vitest run tests/director.test.ts tests/production-runner.test.ts`

Expected: FAIL because script generation currently accepts any non-empty cue set.

- [ ] **Step 3: Implement pre-TTS estimate gate**

Generate the script, estimate duration, save `durationState.status = 'estimating'`, and request one estimate correction only outside 85%–115%. The correction prompt includes approved facts, original scenes, scene budgets, estimated deficit, and a prohibition on unsupported claims or filler.

- [ ] **Step 4: Implement exact verbatim cue segmentation**

Segment only on existing punctuation/newlines, preserve every Unicode code point and ordering, and assign stable cue IDs. Verify reconstruction equals `sourceNarration`; otherwise throw `VERBATIM_SEGMENTATION_FAILED`.

- [ ] **Step 5: Run tests and commit**

Run: `pnpm exec vitest run tests/director.test.ts tests/production-runner.test.ts`

```bash
git add packages/agent/src/director/index.ts packages/agent/prompts/SCRIPT.md packages/agent/skills/shared/script.md packages/core/src/production/runner.ts tests/director.test.ts tests/production-runner.test.ts
git commit -m "feat: enforce narration duration estimates"
```

### Task 7: Measured TTS Correction and Cue Cache

**Files:**
- Modify: `packages/speech/src/film.ts`
- Modify: `packages/agent/src/director/duration.ts`
- Modify: `packages/core/src/production/runner.ts`
- Modify: `apps/worker/src/handlers/production.ts`
- Test: `tests/volcengine-film.test.ts`
- Test: `tests/integration/duration-correction.test.ts`

**Interfaces:**
- Consumes: `reviseScriptForDuration`, `DurationState`, structured failures.
- Produces: cue audio fingerprint cache and a maximum-two-round measured correction loop.

- [ ] **Step 1: Write failing cache and correction-loop tests**

Create a six-cue fixture where round one measures 95 seconds for a 300-second target and the model changes two cues. Assert round two synthesizes only those two cue fingerprints. Assert a 285-second result is accepted; a third correction call is never made.

- [ ] **Step 2: Verify RED**

Run: `RUN_INTEGRATION=1 pnpm exec vitest run tests/volcengine-film.test.ts tests/integration/duration-correction.test.ts`

Expected: FAIL because narration always accepts the first measured duration.

- [ ] **Step 3: Fingerprint and reuse cue audio**

Fingerprint provider, voice, normalized text, rate-affecting settings, and synthesis version. Reuse an existing WAV only when the fingerprint matches and the file passes WAV validation. Rebuild concat order and subtitle timing every round.

- [ ] **Step 4: Add measured-duration loop to the runner**

After narration, compare `durationMs` with `durationBand`. For AI mode outside the band, checkpoint `status: 'correcting'`, increment `correctionRound`, revise only deficient/excess scenes, and narrate again. Stop after two rounds with `DURATION_CONTENT_INSUFFICIENT`. For verbatim mode, checkpoint `status: 'needs-input'` immediately without rewriting.

- [ ] **Step 5: Preserve restart semantics**

Persist script, fingerprints, measured duration, and round before each external call. On retry, load the current round and reuse unchanged WAVs. Do not clear artwork until the accepted script actually changes cue timing.

- [ ] **Step 6: Run tests and commit**

Run: `RUN_INTEGRATION=1 pnpm exec vitest run tests/volcengine-film.test.ts tests/integration/duration-correction.test.ts tests/production-runner.test.ts`

```bash
git add packages/speech/src/film.ts packages/agent/src/director/duration.ts packages/core/src/production/runner.ts apps/worker/src/handlers/production.ts tests/volcengine-film.test.ts tests/integration/duration-correction.test.ts tests/production-runner.test.ts
git commit -m "feat: correct measured narration duration"
```

### Task 8: Duration Decisions and Actionable Failure UI

**Files:**
- Modify: `packages/contracts/src/production.ts`
- Modify: `packages/core/src/production/service.ts`
- Modify: `apps/api/src/routes/production.ts`
- Modify: `apps/web/src/features/production/BriefFields.tsx`
- Modify: `apps/web/src/features/production/ProductionWorkspace.tsx`
- Modify: `apps/web/src/features/production/FilmStage.tsx`
- Modify: `apps/web/src/features/production/useProduction.ts`
- Modify: `apps/web/src/styles/production.css`
- Test: `tests/production-service.test.ts`
- Test: `tests/e2e/production.spec.ts`

**Interfaces:**
- Consumes: typed failure and duration state from earlier tasks.
- Produces: `accept-duration` action and contextual UI actions.

- [ ] **Step 1: Write failing service and browser tests**

Assert only `needs-input` productions can accept actual duration; the action records `policy: 'accepted-source'`, uses measured duration as the accepted target, and does not call the model. In E2E, assert a 300-second selection displays `目标 5:00`, measured duration, accepted band `4:30–5:30`, and a specific failure card when injected review failure occurs.

- [ ] **Step 2: Verify RED**

Run: `pnpm exec vitest run tests/production-service.test.ts && pnpm exec playwright test tests/e2e/production.spec.ts`

Expected: FAIL because the action and UI do not exist.

- [ ] **Step 3: Add explicit narration mode fields**

`BriefFields` defaults to “AI 创作口播”. Selecting “逐字原稿” reveals a required `sourceNarration` textarea and explains that AI will not expand it. Switching back to AI mode removes the persisted source text after an explicit inline confirmation in the form state.

- [ ] **Step 4: Render duration state**

Show target, estimated, and measured times; current correction round; and the 90%–110% band. Use `aria-live="polite"` for progress. Do not label an out-of-band duration as ready.

- [ ] **Step 5: Render actionable failures**

Use `failure.phase`, `failure.context`, and `failure.retryable` to choose exactly one primary action. Include diagnostic ID in a collapsed “技术信息” area without cause text containing secrets.

- [ ] **Step 6: Add accept-duration and retry APIs**

Validate revision and stage, update policy atomically, clear the failure, and resume at illustration without regenerating accepted audio. Exact review failures retry only the failed scene.

- [ ] **Step 7: Run tests and commit**

Run: `pnpm exec vitest run tests/production-service.test.ts tests/web-api.test.ts && pnpm exec playwright test tests/e2e/production.spec.ts`

```bash
git add packages/contracts/src/production.ts packages/core/src/production/service.ts apps/api/src/routes/production.ts apps/web/src/features/production/BriefFields.tsx apps/web/src/features/production/ProductionWorkspace.tsx apps/web/src/features/production/FilmStage.tsx apps/web/src/features/production/useProduction.ts apps/web/src/styles/production.css tests/production-service.test.ts tests/e2e/production.spec.ts
git commit -m "feat: surface duration and production recovery"
```

### Task 9: End-to-End Recovery, Documentation, and Full Verification

**Files:**
- Modify: `tests/e2e/production-recovery.spec.ts`
- Modify: `tests/e2e/studio-workbench.spec.ts`
- Modify: `docs/development.md`
- Modify: `docs/verification.md`

**Interfaces:**
- Consumes: all earlier task outputs.
- Produces: documented operational workflow and release-level verification evidence.

- [ ] **Step 1: Add failing recovery coverage**

Inject a browser review failure on page 2 after TTS. Assert the UI names page 2 and review phase, retry resumes from page 2, unchanged cue synthesis count stays zero, and the production reaches preview. Add a five-minute fixture where measured rounds are 95 seconds, 240 seconds, and 285 seconds; assert drawing starts only after 285 seconds.

- [ ] **Step 2: Verify RED before final wiring**

Run: `pnpm exec playwright test tests/e2e/production-recovery.spec.ts tests/e2e/studio-workbench.spec.ts`

Expected: any missing integration wiring fails with the exact unmet assertion.

- [ ] **Step 3: Finish only the wiring exposed by the E2E failures**

Connect existing typed contracts and actions; do not add new policy behavior in this task. Update development docs with preflight output, stable failure codes, diagnostic ID lookup, duration bands, verbatim behavior, and recovery commands.

- [ ] **Step 4: Run complete verification**

```bash
pnpm typecheck
pnpm test
pnpm test:integration
pnpm exec playwright test tests/e2e/production.spec.ts tests/e2e/production-recovery.spec.ts tests/e2e/studio-workbench.spec.ts
pnpm build
git diff --check
```

Expected: every command exits 0, no failed/skipped-required test, and no whitespace errors.

- [ ] **Step 5: Manually verify the original project path**

Open `http://localhost:5173/products/new#656d2d23-b8cc-4fed-9dce-64da003d5a41`. Confirm the existing 95.5-second production remains playable, displays target-versus-measured mismatch, and is not silently rewritten. Start a new 300-second AI production and confirm illustration does not begin until measured TTS duration is within 270–330 seconds or the UI requests a user decision.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/production-recovery.spec.ts tests/e2e/studio-workbench.spec.ts docs/development.md docs/verification.md
git commit -m "test: verify production recovery and duration policy"
```

## Final Review Checklist

- [ ] Every design acceptance criterion maps to at least one task and test.
- [ ] Production Playwright calls use BrowserRuntime.
- [ ] Known failures have stable codes, phases, retryability, and safe copy.
- [ ] Unknown failures do not blame unrelated services.
- [ ] Five-minute AI narration must measure 270–330 seconds before illustration.
- [ ] Two automatic correction rounds are enforced.
- [ ] Verbatim text reconstructs exactly and is never automatically edited.
- [ ] Unchanged cue audio is reused across correction and restart.
- [ ] Old completed productions remain readable and playable.
- [ ] Full unit, integration, E2E, typecheck, and build verification is green.
