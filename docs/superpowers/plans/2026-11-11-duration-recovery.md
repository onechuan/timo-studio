# 配音时长校正与恢复

Goal: Preserve measured audio and enable explicit recovery after duration correction is exhausted, including existing failed revisions.
Architecture: Keep current job pipeline and explicit accept-duration action. Use measured cue timing to calibrate correction requests, retain the closest measured version, and present a duration decision instead of an unrecoverable error.
Tech stack: TypeScript, React, Vitest, Playwright.

Constraints: Preserve existing uncommitted work. Do not automatically accept a shorter film or run paid generation. Keep two measured correction rounds and preserve verbatim narration.

- [x] Add failing service tests for legacy failure acceptance, timing validation and target-only edits preserving audio.
- [x] Add failing director tests for measured feedback and rejection of unhelpful rewrites.
- [x] Add runner tests for needs-input, best measured version retention and no repeat narration on explicit acceptance.
- [x] Implement recovery predicate and guarded service action, duration-only updates, measured feedback and bounded correction retention.
- [x] Update UI to display a pending duration decision, exact measured duration and recovery action; provide guidance to existing content/target editors.
- [x] Run focused Vitest tests, TypeScript/build checks and desktop/mobile Playwright recovery tests. Verify the existing revision read-only.

Verification: pnpm typecheck passed; Vitest 243 passed / 1 skipped; measured-correction integration test passed; four duration recovery Playwright cases passed across desktop and mobile. Live project (now revision 9) verified read-only, with no acceptance or generation triggered. Each narration mix now has a content-specific filename to preserve earlier takes.
