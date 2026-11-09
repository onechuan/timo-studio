# Drawing Engine V3 Integration Verification

Date: 2026-11-10

## Outcome

TimoTV now generates, previews, reviews, seeks, and exports programmable drawing pages through the migrated Frametell drawing engine. New production and repair jobs use `SceneProgramV3`; persisted V1/V2 artwork remains renderable through a bridge in the same measured timeline.

The production path is:

```text
approved storyboard
  -> measured TTS cues
  -> director emits TIMO.visual(sceneId, draw)
  -> trusted validation + SHA-256
  -> self-contained drawing-engine preview
  -> deterministic keyframe capture and visual review
  -> Chrome frame rendering
  -> FFmpeg H.264/AAC MP4
```

## Security and determinism

- The model cannot provide the persisted source hash; the worker computes lowercase SHA-256 after validation.
- A page may register exactly one matching `TIMO.visual(sceneId, ...)` callback.
- Dynamic code, network, workers, browser storage, navigation, parent-window APIs, `ENGINE`, and script-closing markup are rejected.
- Style IDs and component extras are allowlisted and resolved below the bundled engine package; model output cannot provide filesystem paths.
- The preview document is self-contained, has `default-src 'none'`, contains no external script/link URLs, and runs in the existing sandboxed iframe.
- Preview, pause/seek, review capture, and export all call `window.renderAt(globalMilliseconds)`.
- Exact measured cue boundaries are passed to the engine. Repeated seeks to the same timestamp produced byte-identical screenshots.
- Engine build/render failures recorded in `ENGINE.errors` are surfaced as repairable review issues instead of silently exporting placeholders.

## Compatibility

- V1/V2 schemas and their renderer remain unchanged.
- A production can contain legacy and V3 pages; Chrome verified both kinds on one timeline.
- Pre-version review records retain their historical element IDs.
- Product-facing styles map to audited engine styles:
  - `warm` -> `warm-story` plus the `warm` component kit
  - `chalk` -> `chalkboard`
  - `tech` -> `tech-dark`
  - `brand` -> `vector`
- The imported engine contains 42 upstream style packs. The director intentionally exposes only the four mappings above until vendor-dependent packs receive product-level QA.

## Verification evidence

Commands executed from `/Users/onechuan/code/ai/timo/timo-studio`:

```bash
pnpm --filter @timotv/drawing-engine test
# 55 passed

pnpm typecheck
# passed for packages, web, API, worker, and root tests

pnpm test
# 34 test files passed
# 216 tests passed, 1 environment-gated test skipped

RUN_INTEGRATION=1 pnpm vitest run \
  tests/integration/preview.test.ts \
  tests/integration/review-capture.test.ts \
  tests/integration/v3-video.test.ts
# 3 files / 10 browser and media integration tests passed
```

The MP4 integration test generated a real two-second chalkboard program, wrote a measured WAV track, rendered 24 full-HD frames in Chrome, encoded H.264 video plus AAC audio with FFmpeg, and verified the `ftyp` MP4 header and final artifact path. Runtime was approximately 10.4 seconds on the verification machine.

## Operational notes

- Existing projects keep their current artwork until a page or the full illustration stage is regenerated.
- New `produce`, `illustrate`, and repair jobs use V3 automatically through the worker adapter.
- Volcengine TTS remains the configured production narration provider; the MP4 smoke test uses a local generated WAV only to avoid a paid external request.
- AGPL provenance, the unmodified upstream inventory, and reviewed compatibility patches remain documented in `THIRD_PARTY_NOTICES.md`, `packages/drawing-engine/LICENSE`, and `docs/UPSTREAM_PATCHES.md`.
