# TimoTV Topic-to-Video Agent Handoff and Next-Phase Implementation Plan

> **Status update (2026-11-12):** The project no longer depends on a Frametell
> checkout. The engine is vendored in `packages/drawing-engine`; upstream sync,
> audit, parity, and A/B benchmark tooling were removed. The pipeline flag is
> now `drawing-engine-v3` (previously `frametell-parity`), and the environment
> override is `TIMOTV_VIDEO_PIPELINE` (previously `TIMOTV_FRAMETELL_PARITY`).
> Old pipeline values are normalized on read.
>
> **Superseded sections:** Sections 4 (pixel regression), 6 (benchmark/audit
> gaps), 7 (benchmark release loop), 9 (live benchmark gate), 10 (upstream
> audit command) and 13 (upstream audit criterion) describe removed tooling and
> are retained as history only. Do not run `pnpm engine:audit` or
> `pnpm benchmark:video-parity`. Current release state is recorded in
> `docs/verification.md` and `docs/roadmap.md`. Section 8 is still the next
> implementation task; use `drawing-engine-v3` as the pipeline value.
>
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hand off the merged topic-to-video studio with an evidence-based current-state snapshot and finish the remaining drawing-engine release work without overstating automated checks.

**Architecture:** The merged system keeps product state in PostgreSQL, submits long-running work through Redis/BullMQ, and executes model, TTS, browser-review, and FFmpeg operations in a separate Worker. `Production.videoPipeline` freezes the selected pipeline per production; `legacy-v3` is still the persisted default, while `drawing-engine-v3` adds Film Kit, page review/repair, and whole-film consistency review before preview/export.

**Tech Stack:** Node.js 22.19+, pnpm 10.33.2, TypeScript, React/Vite, Hono, Prisma/PostgreSQL, BullMQ/Redis, Pi Agent, Zod, Playwright/Chrome, FFmpeg, Vitest, and Playwright Test.

## Global Constraints

- GitHub default branch is `master`. Start all new work from current `origin/master`, not the already merged `codex/topic-to-video` branch.
- The drawing engine is vendored in `packages/drawing-engine`; there is no upstream revision lock, sync script, or audit job.
- Do not change the persisted default from `legacy-v3` until manual acceptance with real generated results is complete.
- Historical productions without `videoPipeline` must continue to resolve to `legacy-v3`; do not migrate or reinterpret them silently.
- Preview, automated review, and MP4 export must consume the same trusted visual payload and deterministic `renderAt(globalMs)` timeline.
- Keep API keys server-side. Never commit `.env`, `.data/`, generated videos, review screenshots, or private score files.
- Use exact file staging. The workspace contains intentionally untracked agent/process documents; never run `git add .`.
- The removed parity benchmark is historical; release confirmation now relies on manual acceptance with a fixed model and voice.
- Every behavior change follows red-green-refactor, includes focused tests, and ends in a reviewable commit.

---

## 1. Delivery Snapshot

| Item | State on 2026-11-12 |
| --- | --- |
| Repository | `git@github.com:onechuan/timo-studio.git` |
| Default branch | `master` |
| Merged PR | [#1 feat: complete topic-to-video studio with Frametell parity](https://github.com/onechuan/timo-studio/pull/1) |
| Merge commit | `685d8ee7da088aca13c6e614db0c515e70b0a4f7` |
| Last feature commit | `a87bb55221c471d17dfc456bab9078337db10ccd` |
| Old feature branch | `codex/topic-to-video`, retained remotely for traceability |
| Redundant remote branch | `main`, points to the original baseline and is not the default branch |
| Current handoff branch | `codex/topic-to-video-handoff`, created from `origin/master` |
| License | AGPL-3.0-only; Frametell provenance recorded in `docs/OPEN_SOURCE.md` |

PR #1 is merged. The old local `master` was behind before this handoff branch was created, so a future Agent must fetch before starting new work.

## 2. What Is Implemented

### User flow

```text
topic or materials
  → storyboard planning
  → human approval
  → narration writing
  → real TTS and cue timing
  → Film Kit (parity pipeline only)
  → page generation and review/repair
  → whole-film consistency review/repair (parity pipeline only)
  → deterministic preview
  → MP4 and SRT export
```

### Capability inventory

| Area | Implemented behavior | Primary code |
| --- | --- | --- |
| Product UI | Project list, topic/material input, storyboard approval, script/scene editing, review panel, preview, export, service settings | `apps/web/src/features/` |
| API | Production CRUD/actions, settings, voice preview, capability checks, safe artifact serving with Range support | `apps/api/src/` |
| Workflow | Revision checks, claims, checkpoints, recovery, retries, structured failures, duration decisions | `packages/core/src/production/` |
| Director | Pi Agent with structured submit tools, content-direction Skills, page artwork and repair prompts | `packages/agent/` |
| Speech | Volcengine, macOS system voice, ElevenLabs, PCM measurement, sentence cache, SRT | `packages/speech/` |
| Visual engine | Frametell-derived 42-style engine, V3 programs, deterministic timeline, local media registry | `packages/drawing-engine/`, `packages/renderer/` |
| Review | Browser screenshots, layout measurement, optional vision model, page repair loop, whole-film lint and repair | `packages/renderer/src/review.ts`, `apps/worker/src/handlers/review.ts` |
| Persistence | Production state, job ownership, run checkpoints, settings file, artifact ownership | `packages/db/`, `packages/storage/` |
| Background execution | Separate production queue, Worker recovery scan, AbortSignal propagation | `packages/queue/`, `apps/worker/` |
| Quality gates | Pixel parity, engine audit, 18-pair benchmark harness, blinded score report | `tests/visual-parity/`, `scripts/*video-parity*`, `benchmarks/video-parity/` |

### Video-effect parity work already merged

- The drawing engine is locked to upstream commit `6145f7e3482628543bd6f2d68fe3b618d366213a`.
- Six visual scenarios plus the image-metric test run as seven pixel-regression cases.
- Film Kit components have generation, visual review, downgrade, and persisted checkpoint states.
- Page prompts consume continuity context from previous pages and Film Kit output.
- Page review supports evidence capture, bounded repair rounds, explicit acceptance, and resume.
- Whole-film review checks cross-page identity, palette, typography, and continuity; repair is persisted and bounded.
- Preview, review, and export use one serialized visual document. Debug controls differ by mode, content does not.
- A controlled pipeline selector exists in contracts, storage, Production creation, Worker dispatch, and progress UI.

## 3. Current Runtime State

The local services were healthy when this handoff was generated:

- Web: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:3001`
- PostgreSQL and Redis: running through `infra/compose.yaml`
- Director: DeepSeek `deepseek-flash`, API key configured
- Speech: Volcengine TTS configured
- Vision reviewer: disabled and not configured
- Persisted video pipeline: `legacy-v3`
- Local ignored `.env`: `TIMOTV_VIDEO_PIPELINE=drawing-engine-v3`, so this machine forces the effective pipeline to `drawing-engine-v3`

Do not copy credentials into issues, logs, prompts, or this repository.

### Existing project used during the work

Project `9afee149-9b05-46fc-8cc5-a14ab3fb4246` is no longer failed:

| Field | Value |
| --- | --- |
| Revision | 11 |
| Stage | `ready` |
| Scenes | 5 |
| Measured duration | 174,792 ms |
| Duration policy | `accepted-source` |
| Duration correction rounds | 2 |
| Artifacts | audio, preview, subtitles |
| MP4 | Not exported yet |
| Failure | None |
| Persisted `videoPipeline` | Absent, because this production predates pipeline persistence |
| Film Kit / whole-film review | Absent on this historical production |

This record proves the earlier 175-second failure was recovered by an explicit duration decision. It does not prove the full parity workflow, because the production was created before `videoPipeline` was persisted. Create a new production for end-to-end parity acceptance.

## 4. Verification Evidence

### Clean checkout verification

| Check | Result |
| --- | --- |
| Frozen lockfile resolution | Passed |
| `pnpm typecheck` | Passed |
| `pnpm test` | 40 files passed; 277 tests passed; 1 optional test skipped |
| Engine suite | `pnpm --filter @timotv/drawing-engine test`: 55 tests passed |

### Full local verification run before merge

| Command | Result |
| --- | --- |
| `RUN_INTEGRATION=1 PLAYWRIGHT_CHANNEL=chrome pnpm test:integration` | 35/35 passed using real PostgreSQL, Redis, Worker, system TTS, Chrome, and FFmpeg |
| `PLAYWRIGHT_CHANNEL=chrome pnpm test:e2e` | 60 passed; 2 optional live-preview cases skipped |
| `pnpm engine:audit` | Historical; the audit job and upstream checkout were removed |
| `pnpm benchmark:video-parity -- --fixture` | Historical; the benchmark tooling was removed |

### Evidence boundary

`--fixture` generates zero failures, equal scores, and ties. It verifies report shape and threshold logic only. It is not real video-quality evidence and must never be cited as a three-person blind-review pass.

## 5. Decisions That Must Survive the Handoff

1. **Safe rollout over a dramatic default switch.** `legacy-v3` stays the persisted default until live evidence passes every gate.
2. **Per-production pipeline immutability.** Production creation records the selected pipeline. Later settings changes affect new productions only.
3. **Historical compatibility.** Missing `Production.videoPipeline` resolves to `legacy-v3` unless the operator explicitly uses the environment override.
4. **One visual truth.** Preview, review, and export cannot rebuild similar-but-different HTML.
5. **Reviewer independence.** The vision reviewer has separate configuration and credentials; it does not silently fall back to the director model.
6. **No false green states.** When the vision reviewer is disabled, pages are `unreviewed`, not visually passed.
7. **Bounded repair.** Page and whole-film automatic repair rounds are finite, persisted, and resumable.
8. **Fixture honesty.** Synthetic benchmark data is test infrastructure, not product validation.
9. **Local-first scope.** The merged system is a single-user local studio. Authentication, multi-tenant isolation, quotas, and production deployment are not implemented.

## 6. Known Gaps and Risks

### P0 release blockers

- The settings backend supports `production.videoPipeline`, but `SettingsPage.tsx` has no video-pipeline control.
- README currently says the pipeline can be selected in service settings. That statement is ahead of the UI; today selection requires the settings API or an environment override.
- `LocalSettingsStore.get()` returns the effective pipeline after applying `TIMOTV_VIDEO_PIPELINE`; it does not expose the persisted value and override state separately. A UI added without fixing this will be confusing on this machine.
- The live benchmark adapter and the 18-pair blinded gate were removed. No automated quality gate replaces them; release confirmation depends on manual acceptance with real generated results.
- No real generated acceptance run has been recorded for the vendored engine yet.
- The vision reviewer is not configured locally. The existing probe proves image input is accepted, not that judgments are accurate.

### Engineering and operations risks

- Root `package.json` still says Node `>=22.12.0`, while Pi dependencies require Node 22.19+. README correctly says 22.19+; align the package engine in the next dependency-maintenance change.
- A normal first install runs the `ffmpeg-static` download script and can wait on network delivery. A download timeout is not a source-code failure.
- DB state and Redis submission are not transactional. There is recovery scanning, but no full transactional outbox.
- There is no cancel API, cost budget, authentication, authorization, quota, rate limit, cloud object storage, deployment pipeline, or backup/restore runbook.
- Remote `main` is redundant and still points at the original baseline. It is not the default; do not delete it without an explicit repository-cleanup decision.

### Workspace hygiene

The following are intentionally untracked and were excluded from PR #1:

- `.archify/`
- `.superpowers/`
- `docs/plans/`
- older 2026-11-08/09/11 design and planning files under `docs/superpowers/`

Do not bulk-stage them. Private `.env`, `.data/`, `node_modules/`, and `test-results/` are ignored and must stay private.

## 7. Overall Roadmap

### P0: Finish the controlled release

1. Add an honest pipeline selector to service settings, including persisted/effective/overridden state (Section 8).
2. Review real generated results with a fixed model and voice, and record the acceptance evidence in `docs/verification.md`.
3. Only after acceptance, change the persisted default for newly created productions from `legacy-v3` to `drawing-engine-v3` while preserving old productions.
4. Record the environment fingerprint and final decision in verification docs.

### P1: Production hardening

Recommended order:

1. Transactional outbox, compensation, and a terminal state for stalled jobs.
2. End-to-end cancellation and resource/cost budgets across model, TTS, Chrome, and FFmpeg.
3. Authentication, project authorization, rate limits, and per-user quotas.
4. Cloud object storage and multi-instance secret management.
5. CI, deployment, monitoring, alerting, and backup/restore drills.
6. Real vision-reviewer calibration against a labeled frame set.

Acceptance must include: forbidden cross-project access returns 403, cancellation stops paid work, DB success plus Redis failure is recoverable, resource limits fail safely, secrets never round-trip to the browser, and recovery does not duplicate paid calls.

### P2: Real media editing

Build in this order:

1. Restricted streaming or multipart upload with ownership, size, MIME, and path validation.
2. Persistent FFprobe jobs and explicit Asset processing states using real valid/corrupt media fixtures.
3. Single ordered video/image track editing with trim, reorder, preview, and revision-conflict UX.
4. Timeline MP4 export through a deterministic FFmpeg filter graph, progress, retry, Range playback, and download tests.
5. Audio mixing, subtitle editing, ASR, model-assisted real-asset selection, then a desktop host.

Each P1/P2 item is an independent subsystem. Write a separate design spec and implementation plan before coding it.

---

## 8. Next Agent Execution Plan: P0 Pipeline Settings

This is the recommended first task. It is small, testable, and removes the mismatch between README and the product before the expensive benchmark run.

### Task 1: Expose configured and effective pipeline state

**Files:**
- Modify: `packages/contracts/src/settings.ts`
- Modify: `packages/storage/src/settings.ts`
- Test: `tests/settings.test.ts`

**Interfaces:**
- Consumes: `VideoPipeline`, `resolveVideoPipeline(configured, env)`
- Produces: `AppSettings.production` with `videoPipeline`, `effectiveVideoPipeline`, and `overriddenByEnvironment`
- Preserves: `SettingsUpdate.production.videoPipeline` as the only writable pipeline field

- [ ] **Step 1: Write the failing public-settings test**

Add this expectation to the existing pipeline settings test:

```ts
const overridden = new LocalSettingsStore(join(dir, 'overridden.json'), {
  TIMOTV_VIDEO_PIPELINE: 'drawing-engine-v3',
});
expect((await overridden.get()).production).toEqual({
  videoPipeline: 'legacy-v3',
  effectiveVideoPipeline: 'drawing-engine-v3',
  overriddenByEnvironment: true,
});
```

- [ ] **Step 2: Run the test and confirm the contract is missing**

Run:

```sh
pnpm exec vitest run tests/settings.test.ts
```

Expected: FAIL because the public response currently exposes only the resolved `videoPipeline`.

- [ ] **Step 3: Extend the public contract**

Change the public type to:

```ts
production: {
  videoPipeline: VideoPipeline;
  effectiveVideoPipeline: VideoPipeline;
  overriddenByEnvironment: boolean;
};
```

Keep `productionSettingsSchema` and the private saved JSON shape unchanged. They store only `videoPipeline`.

- [ ] **Step 4: Return configured, effective, and override state**

In `LocalSettingsStore.publicSettings`, compute:

```ts
const effectiveVideoPipeline = resolveVideoPipeline(
  s.production.videoPipeline,
  e,
);
const overriddenByEnvironment =
  normalizeVideoPipeline(e.TIMOTV_VIDEO_PIPELINE) !== undefined;
```

Return:

```ts
production: {
  videoPipeline: s.production.videoPipeline,
  effectiveVideoPipeline,
  overriddenByEnvironment,
},
```

- [ ] **Step 5: Run focused tests**

```sh
pnpm exec vitest run tests/settings.test.ts
pnpm typecheck
```

Expected: both pass.

- [ ] **Step 6: Commit the contract change**

```sh
git add packages/contracts/src/settings.ts packages/storage/src/settings.ts tests/settings.test.ts
git commit -m "feat: expose effective video pipeline setting"
```

### Task 2: Add the pipeline selector to the settings page

**Files:**
- Modify: `apps/web/src/features/settings/SettingsPage.tsx`
- Modify: `apps/web/src/styles/settings.css`
- Modify: `tests/e2e/settings.spec.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: the extended `AppSettings.production` from Task 1
- Produces: a labeled `视频质量管线` selector that writes `SettingsUpdate.production.videoPipeline`
- Behavior: environment override is visible, and the selector is disabled while an override is active

- [ ] **Step 1: Extend the E2E settings stub**

Add to `initial()`:

```ts
production: {
  videoPipeline: 'legacy-v3',
  effectiveVideoPipeline: 'legacy-v3',
  overriddenByEnvironment: false,
},
```

Merge `patch.production` into the routed PUT response and remove no fields from it.

- [ ] **Step 2: Write the failing UI test**

```ts
test('视频质量管线保存后只影响新制作', async ({ page }) => {
  const patches = await settingsRoutes(page);
  await page.goto('/#settings');
  await page.getByRole('tab', { name: '视频制作', exact: true }).click();
  await page
    .getByLabel('视频质量管线', { exact: true })
    .selectOption('drawing-engine-v3');
  await page.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('配置已保存');
  expect(patches[0].production).toEqual({
    videoPipeline: 'drawing-engine-v3',
  });
  await expect(page.getByText('只影响新制作')).toBeVisible();
});
```

- [ ] **Step 3: Run the E2E test and confirm the missing tab**

```sh
PLAYWRIGHT_CHANNEL=chrome pnpm exec playwright test tests/e2e/settings.spec.ts
```

Expected: FAIL because no `视频制作` tab exists.

- [ ] **Step 4: Send the setting in the existing save request**

Add to the `SettingsUpdate` object in `save()`:

```ts
production: {
  videoPipeline: draft.production.videoPipeline,
},
```

- [ ] **Step 5: Add the tab and panel**

Extend `Pane` with `production`, add a `Clapperboard` icon tab, and render a native select:

```tsx
<label>
  视频质量管线
  <select
    value={draft.production.videoPipeline}
    disabled={draft.production.overriddenByEnvironment}
    onChange={(event) =>
      setDraft({
        ...draft,
        production: {
          ...draft.production,
          videoPipeline: event.target.value as VideoPipeline,
        },
      })
    }
  >
    <option value="legacy-v3">Legacy V3（稳定默认）</option>
    <option value="drawing-engine-v3">绘图引擎 V3（受控发布）</option>
  </select>
</label>
```

Show both facts in copy:

```tsx
<p>保存后只影响新制作；已有制作继续使用创建时记录的管线。</p>
{draft.production.overriddenByEnvironment && (
  <p role="status">
    当前环境变量强制使用 {draft.production.effectiveVideoPipeline}；移除覆盖并重启服务后，保存值才会生效。
  </p>
)}
```

- [ ] **Step 6: Run focused UI and type checks**

```sh
PLAYWRIGHT_CHANNEL=chrome pnpm exec playwright test tests/e2e/settings.spec.ts
pnpm typecheck
```

Expected: pass on desktop and narrow Playwright projects without horizontal overflow.

- [ ] **Step 7: Correct README behavior**

Keep the statement that the settings page can select the pipeline, and add that `TIMOTV_VIDEO_PIPELINE=drawing-engine-v3|legacy-v3` is an operator override that disables the UI control until removed.

- [ ] **Step 8: Commit the UI change**

```sh
git add apps/web/src/features/settings/SettingsPage.tsx apps/web/src/styles/settings.css tests/e2e/settings.spec.ts README.md
git commit -m "feat: select the video quality pipeline in settings"
```

### Task 3: Verify new-production binding and historical stability

**Files:**
- Modify: `tests/production-service.test.ts` only if the combined behavior is not already explicit
- Test: `tests/settings.test.ts`, `tests/production-service.test.ts`, `tests/e2e/settings.spec.ts`

**Interfaces:**
- Consumes: `ProductionService.defaultPipeline()`
- Produces: evidence that settings affect new productions and never mutate existing records

- [ ] **Step 1: Inspect the existing service test**

The current test `records the selected video pipeline when a production is created` already proves creation and later edit stability. Do not duplicate it.

- [ ] **Step 2: Run the focused release-switch suite**

```sh
pnpm exec vitest run tests/settings.test.ts tests/production-service.test.ts
PLAYWRIGHT_CHANNEL=chrome pnpm exec playwright test tests/e2e/settings.spec.ts
```

Expected: all pass.

- [ ] **Step 3: Run the standard regression gate**

```sh
pnpm typecheck
pnpm test
```

Expected: all test files pass. The removed upstream audit and pixel-regression suites are no longer part of this gate.

- [ ] **Step 4: Commit only if Task 3 added evidence**

```sh
git add tests/production-service.test.ts
git commit -m "test: preserve production pipeline selection"
```

If no file changed because existing coverage is sufficient, do not create an empty commit.

---

## 9. Live Benchmark Gate After the Settings Task

> **Historical:** The benchmark scripts and thresholds in this section were removed on 2026-11-12. Do not run them.

Do not start paid generation until the user confirms the expected model/TTS cost and the exact way to invoke the reference Frametell system.

The runner contract is already fixed by `scripts/run-video-parity-benchmark.mjs`:

```ts
export async function runSystem(input: {
  system: 'frametell' | 'timotv';
  pairId: string;
  topic: { id: string; category: string; title: string; prompt: string };
  run: number;
  settings: {
    language: 'zh';
    aspectRatio: '16:9';
    durationSec: 90;
    modelProvider: string;
    modelId: string;
    voiceProvider: string;
    voiceId: string;
  };
  upstreamRevision: string;
  outputDir: string;
}): Promise<{
  runtimeFailures: number;
  unresolvedRedLint: number;
  reviews: { passed: number; total: number };
  artifacts: { video: string; frames: string };
  costs?: { modelUsd: number; speechUsd: number };
}>;
```

Create `scripts/video-parity/live-runner.mjs` only after both real systems have a reproducible invocation. The adapter must validate that the MP4 and frame directory exist before returning success, capture an environment fingerprint, and return nonzero failure counts instead of manufacturing success.

Run the real set with:

```sh
PLAYWRIGHT_CHANNEL=chrome pnpm benchmark:video-parity -- \
  --runner scripts/video-parity/live-runner.mjs \
  --out .data/video-parity/real-20261112
```

The output must contain 18 pairs and 36 real MP4 files. Three different people then fill:

```text
.data/video-parity/real-20261112/scores/reviewer-1.json
.data/video-parity/real-20261112/scores/reviewer-2.json
.data/video-parity/real-20261112/scores/reviewer-3.json
```

Generate the report:

```sh
node scripts/report-video-parity-benchmark.mjs \
  --run-dir .data/video-parity/real-20261112
```

Every gate must pass:

- 18 complete pairs
- 3 unique reviewers
- 0 runtime failures
- 0 unresolved red lint findings
- review pass-rate delta at least `-0.05`
- mean score delta at least `-0.25`
- TimoTV preferred or tied ratio at least `0.70`

If any gate fails, keep `legacy-v3` as default, fix the failed dimension, and rerun the same fixed set. Do not tune the topics or thresholds after seeing the result.

## 10. Default Switch Procedure After a Real Pass

Modify only after the signed-off report exists:

- `packages/contracts/src/settings.ts`
- `packages/storage/src/settings.ts`
- `tests/settings.test.ts`
- `README.md`
- `docs/roadmap.md`
- `docs/verification.md`

Change defaults for new settings/new productions to `drawing-engine-v3`. Preserve this Worker fallback forever unless a separate migration is approved:

```ts
production.videoPipeline ?? 'legacy-v3'
```

Record the report path, SHA-256, upstream revision, model/voice IDs, generation date, reviewer IDs, and gate result. Then run:

```sh
pnpm typecheck
pnpm test
RUN_INTEGRATION=1 PLAYWRIGHT_CHANNEL=chrome pnpm test:integration
PLAYWRIGHT_CHANNEL=chrome pnpm test:e2e
```

Do not call the rollout complete until all commands pass and a newly created production visibly records `drawing-engine-v3`.

## 11. Next Agent Startup Commands

```sh
cd /Users/onechuan/code/ai/timo/timo-studio
git fetch origin --prune
git switch master
git pull --ff-only origin master
git switch -c codex/video-pipeline-settings-ui
pnpm install --frozen-lockfile
pnpm infra:up
pnpm db:migrate
pnpm typecheck
pnpm test
```

Do not overwrite the existing `.env`. There is no upstream audit step; the engine is vendored in this repository.

## 12. Copy-Paste Prompt for the Next Agent

```text
You are continuing TimoTV from merged PR #1 on GitHub repository onechuan/timo-studio.

Start from origin/master, not codex/topic-to-video. Read these files in order:
1. README.md
2. docs/superpowers/plans/2026-11-12-topic-to-video-agent-handoff.md
3. docs/verification/drawing-engine-v3-integration.md
4. docs/DRAWING_ENGINE_CHANGES.md
5. docs/verification.md

Your first implementation task is Section 8 of the handoff: add an honest video-pipeline selector to service settings. Use TDD. Expose configured, effective, and environment-overridden pipeline state; save only the configured value; disable the selector while TIMOTV_VIDEO_PIPELINE forces an override; state that changes affect new productions only. Preserve historical productions and the Worker fallback to legacy-v3.

Run the focused tests and then pnpm typecheck plus pnpm test. Do not switch the default to drawing-engine-v3 until manual acceptance with real generated results is recorded. Never commit .env, .data, generated videos, or untracked agent/process artifacts. Stage exact files only.
```

## 13. Completion Definition

The next phase is complete only when:

1. The settings UI honestly controls the persisted pipeline and displays environment overrides.
2. Manual acceptance with real generated results is recorded in the verification docs.
3. The default changes only for new productions, with historical fallback preserved.
4. Typecheck, unit, integration, and E2E all pass.
5. Verification docs contain the evidence and do not overstate automated checks.

That is the handoff boundary. Everything after it belongs to production hardening or media editing, not the drawing-engine release gate.
