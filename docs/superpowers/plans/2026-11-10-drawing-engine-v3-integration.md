# Drawing Engine V3 Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe `SceneProgramV3` contract and make TimoTV preview, seek, visual review, and MP4 export render the imported drawing engine while preserving V1/V2 behavior.

**Architecture:** A production may keep legacy V1/V2 pages, but the presence of a V3 page selects a self-contained drawing-engine film document. That document embeds the trusted runtime/style assets, validates untrusted page source before embedding it, gives the engine exact measured cue timing, and bridges legacy pages into the same timeline. Browser preview and FFmpeg frame capture continue to call the single global `renderAt(milliseconds)` function.

**Tech Stack:** TypeScript 5, Zod 3, Vitest 3, JavaScript browser runtime, Playwright Core, Rough.js, FFmpeg, CSP sandboxed iframe.

## Global Constraints

- Preserve V1/V2 schema, preview, review, and export behavior.
- `sourceHash` is a lowercase SHA-256 computed by trusted code, never accepted from a model unchecked.
- V3 source registers exactly its own scene through `TIMO.visual(sceneId, draw)`.
- Reject dynamic code, network, storage, worker, navigation, and parent-window APIs before browser execution.
- The generated document has `default-src 'none'`, inline script/style only, and no network access.
- Extras are logical component IDs resolved only below `packages/drawing-engine/lib`; style kits are selected by the validated style ID.
- Preview, review, pause/seek, and export all use `window.renderAt(globalMilliseconds)`.
- Every behavior change follows red-green-refactor and every commit stages only files in the task.

---

### Task 1: SceneProgramV3 contract and compatibility guards

**Files:**

- Modify: `packages/contracts/src/artwork.ts`
- Modify: `packages/contracts/src/production.ts`
- Test: `tests/artwork-contract.test.ts`

**Interfaces:**

- Produces: `sceneProgramV3Schema`, `SceneProgramV3`, `isLegacyArtwork(artwork)` and `sceneArtworkSchema` accepting versions 1, 2, and 3.
- Consumes: existing V1/V2 schemas unchanged.

- [x] **Step 1: Add failing contract tests**

```ts
it('accepts a bounded V3 page program and preserves V1/V2', () => {
  const v3 = sceneArtworkSchema.parse({
    version: 3,
    runtime: 'timotv-dsl-1',
    intent: '画出一颗火箭逐级拆解',
    source: "TIMO.visual('s1', P => P.title('第一性原理'));",
    sourceHash: 'a'.repeat(64),
    style: 'chalkboard',
    extras: ['timeline'],
  });
  expect(v3.version).toBe(3);
  expect(sceneArtworkSchema.parse(fixtureV1).version).toBe(1);
  expect(sceneArtworkSchema.parse(fixtureV2).version).toBe(2);
});
```

Also assert invalid hashes, path-like extras, unknown styles, and source over 100,000 UTF-8 bytes fail.

- [x] **Step 2: Run RED**

Run: `pnpm vitest run tests/artwork-contract.test.ts`

Expected: FAIL because version 3 is not accepted.

- [x] **Step 3: Implement the schema and guards**

```ts
export const drawingStyleSchema = z.enum(DRAWING_STYLE_IDS);
export const sceneProgramV3Schema = z
  .object({
    version: z.literal(3),
    runtime: z.literal('timotv-dsl-1'),
    intent: z.string().trim().min(1).max(1000),
    source: z.string().min(1).max(100000),
    sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
    style: drawingStyleSchema,
    extras: z.array(z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/)).max(32),
  })
  .strict();
export const sceneArtworkSchema = z.union([
  artworkV1Schema,
  artworkV2Schema,
  sceneProgramV3Schema,
]);
export const isLegacyArtwork = (
  value: SceneArtwork | undefined,
): value is ArtworkV1 | ArtworkV2 =>
  value?.version === 1 || value?.version === 2;
```

Update scene cue refinement so only legacy artwork reads `.elements`.

- [x] **Step 4: Run GREEN and typecheck**

Run: `pnpm vitest run tests/artwork-contract.test.ts && pnpm typecheck`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add packages/contracts/src/artwork.ts packages/contracts/src/production.ts tests/artwork-contract.test.ts
git commit -m "feat: add programmable V3 artwork contract"
```

### Task 2: Exact measured timing in the drawing engine

**Files:**

- Modify: `packages/drawing-engine/runtime/timing.js`
- Modify: `tests/drawing-engine-inventory.test.ts`
- Modify: `docs/UPSTREAM_PATCHES.md`
- Create: `tests/drawing-engine-timeline.test.ts`

**Interfaces:**

- Produces: `TIMING.layout(pages, { timeline })`, where timeline is `{ duration, pages: [{ start, end, cues: [{ start, end }] }] }` in seconds.
- Consumes: existing estimated/voice timing when `timeline` is absent.

- [x] **Step 1: Add a failing exact-timeline test**

```ts
const result = TIMING.layout(pages, {
  timeline: {
    duration: 4.2,
    pages: [
      {
        start: 0,
        end: 4.2,
        cues: [
          { start: 0, end: 1.7 },
          { start: 1.7, end: 4.2 },
        ],
      },
    ],
  },
});
expect(result.pages[0].cues.map(({ start, end }) => [start, end])).toEqual([
  [0, 1.7],
  [1.7, 4.2],
]);
expect(result.duration).toBe(4.2);
```

- [x] **Step 2: Run RED**

Run: `pnpm vitest run tests/drawing-engine-timeline.test.ts`

Expected: FAIL because `timeline` is ignored.

- [x] **Step 3: Add the optional timing branch**

At the start of `layout`, validate page/cue counts and finite increasing seconds, then return page objects with exact starts/ends. Leave the existing path untouched when no timeline is supplied.

- [x] **Step 4: Run GREEN and engine regression**

Run: `pnpm vitest run tests/drawing-engine-timeline.test.ts tests/drawing-engine-inventory.test.ts`

Run: `pnpm --filter @timotv/drawing-engine test`

Expected: exact timing PASS; engine 55/55 PASS.

- [x] **Step 5: Commit**

```bash
git add packages/drawing-engine/runtime/timing.js tests/drawing-engine-timeline.test.ts tests/drawing-engine-inventory.test.ts docs/UPSTREAM_PATCHES.md
git commit -m "feat: drive drawing engine from measured cues"
```

### Task 3: Source validator and trusted engine asset loader

**Files:**

- Create: `packages/renderer/src/program.ts`
- Modify: `packages/renderer/src/index.ts`
- Modify: `packages/renderer/package.json`
- Test: `tests/program-source.test.ts`

**Interfaces:**

- Produces: `hashProgramSource(source): string`, `validateProgramSource(sceneId, source): void`, and `drawingEngineAssets(style, extras)` returning trusted inline CSS/JS.
- Consumes: `@timotv/drawing-engine/package.json`, style IDs, and logical extras.

- [x] **Step 1: Add failing source-security tests**

Assert one valid `TIMO.visual('s1', ...)` passes and each of `fetch`, `XMLHttpRequest`, `WebSocket`, `Worker`, `import(`, `eval`, `Function`, `window`, `document`, `parent`, `top`, `opener`, storage, navigation, `</script`, a second registration, a wrong scene ID, path traversal extras, and unknown component IDs fails.

- [x] **Step 2: Run RED**

Run: `pnpm vitest run tests/program-source.test.ts`

Expected: FAIL because `program.ts` does not exist.

- [x] **Step 3: Implement minimal validation and asset resolution**

Resolve the engine package with `createRequire(import.meta.url).resolve('@timotv/drawing-engine/package.json')`. Read only a fixed runtime file list, `styles/<validated-style>/{style.css,style.js,kit.js}`, and `lib/<validated-extra>.js`. Escape closing script/style tags before returning inline content.

- [x] **Step 4: Run GREEN and typecheck**

Run: `pnpm vitest run tests/program-source.test.ts && pnpm typecheck`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add packages/renderer/src/program.ts packages/renderer/src/index.ts packages/renderer/package.json tests/program-source.test.ts
git commit -m "feat: validate and load V3 drawing programs"
```

### Task 4: Unified V3 preview with a legacy-page bridge

**Files:**

- Create: `packages/renderer/src/program-preview.ts`
- Modify: `packages/renderer/src/preview.ts`
- Modify: `packages/renderer/src/film.ts`
- Test: `tests/film.test.ts`
- Test: `tests/integration/preview.test.ts`

**Interfaces:**

- Produces: `programFilmHtml(production, { controls })` and makes `filmHtml` select it when any scene uses V3.
- Consumes: exact measured cues, trusted engine assets, V3 source, and compiled legacy frames.

- [x] **Step 1: Add failing HTML and browser tests**

Assert the V3 document contains the strict CSP, no external `src`/`href`, a frozen `TIMO.visual`, and `window.renderAt` in milliseconds. In Chrome render a V3 chalkboard page at two cue times, seek backward, and assert the first screenshot repeats byte-for-byte. Add one mixed V2/V3 production and assert both pages render.

- [x] **Step 2: Run RED**

Run: `pnpm vitest run tests/film.test.ts`

Run: `RUN_INTEGRATION=1 pnpm vitest run tests/integration/preview.test.ts`

Expected: V3 tests FAIL while legacy tests remain green.

- [x] **Step 3: Implement the self-contained engine document**

Build `SCRIPT` from production scenes and `META.timeline` from measured milliseconds. Embed runtime/style assets in order, register legacy scenes through a trusted bridge using `renderArtworkFrame`, expose only frozen `TIMO.visual` to V3 source, call `ENGINE.init`, and define `window.renderAt(ms) { ENGINE.renderAt(ms / 1000) }`. Reuse the existing player markup so pause and seek keep their current event model.

- [x] **Step 4: Run GREEN and legacy regression**

Run: `pnpm vitest run tests/film.test.ts tests/artwork-renderer.test.ts tests/artwork-motion.test.ts`

Run: `RUN_INTEGRATION=1 pnpm vitest run tests/integration/preview.test.ts`

Expected: all PASS.

- [x] **Step 5: Commit**

```bash
git add packages/renderer/src/program-preview.ts packages/renderer/src/preview.ts packages/renderer/src/film.ts tests/film.test.ts tests/integration/preview.test.ts
git commit -m "feat: preview drawing programs on measured timeline"
```

### Task 5: Review capture and MP4 adapter

**Files:**

- Modify: `packages/renderer/src/review.ts`
- Modify: `packages/agent/src/review.ts`
- Test: `tests/review-capture.test.ts`
- Test: `tests/integration/review-capture.test.ts`
- Test: `tests/film.test.ts`

**Interfaces:**

- Produces: V3-aware review fingerprints/samples and makes the existing `captureSceneReview` and `renderFilm` consume the same unified `filmHtml`.
- Consumes: `SceneProgramV3` source hash and V3 runtime error events.

- [x] **Step 1: Add failing V3 review tests**

Assert fingerprint changes with source/style/extras, sample planning includes cue boundaries and midpoints for V3, browser capture returns PNG frames, and blocked source/runtime errors become review issues. Assert V1/V2 review tests remain unchanged.

- [x] **Step 2: Run RED**

Run: `pnpm vitest run tests/review-capture.test.ts`

Run: `RUN_INTEGRATION=1 pnpm vitest run tests/integration/review-capture.test.ts`

Expected: V3 cases FAIL.

- [x] **Step 3: Implement V3 guards**

Use source hash/style/extras in fingerprints, skip legacy motion-track sampling for V3, and make decorative-ID measurement conditional on legacy elements. Keep the existing Playwright screenshot and FFmpeg code unchanged so they render the unified document.

- [x] **Step 4: Run GREEN**

Run: `pnpm vitest run tests/review-capture.test.ts tests/film.test.ts`

Run: `RUN_INTEGRATION=1 pnpm vitest run tests/integration/review-capture.test.ts`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add packages/renderer/src/review.ts packages/agent/src/review.ts tests/review-capture.test.ts tests/integration/review-capture.test.ts tests/film.test.ts
git commit -m "feat: review and export V3 drawing programs"
```

### Task 6: Integration verification and handoff

**Files:**

- Create: `docs/verification/drawing-engine-v3-integration.md`
- Modify: `docs/superpowers/plans/2026-11-10-drawing-engine-v3-integration.md`

**Interfaces:**

- Produces: evidence for Agent generation, deterministic review, and real MP4 acceptance.

- [x] **Step 1: Run focused and full tests**

Run: `pnpm --filter @timotv/drawing-engine test`

Run: `pnpm test`

Run: `pnpm typecheck`

Expected: engine 55/55, repository tests green, typecheck exit 0.

- [x] **Step 2: Run browser integration**

Run: `RUN_INTEGRATION=1 pnpm vitest run tests/integration/preview.test.ts tests/integration/review-capture.test.ts tests/integration/v3-video.test.ts`

Expected: deterministic seek, mixed preview, V3 review capture, runtime-error evidence, and real MP4 encoding PASS.

- [x] **Step 3: Record evidence and complete the plan**

Document exact counts and any intentional skip. Check every completed step only after its command passed.

- [x] **Step 4: Commit**

```bash
git add docs/verification/drawing-engine-v3-integration.md docs/superpowers/plans/2026-11-10-drawing-engine-v3-integration.md
git commit -m "docs: verify V3 drawing engine integration"
```
