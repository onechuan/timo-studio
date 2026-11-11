# Drawing engine baseline verification

- Source: `/Users/onechuan/code/ai/open/frametell/packages/engine`
- Upstream package: `@frametell/engine` 0.8.0, AGPL-3.0-only
- Target package: `@timotv/drawing-engine` 0.1.0
- Inventory: complete upstream tree imported; 42 styles plus `_fonts`
- Reviewed divergence: 11 repaired upstream example files and 2 added storyboards; every other imported file remains byte-identical
- Engine unit, Chrome benchmark, and component-gallery tests: 55 passed, 0 failed
- Warm-story screenshot parity: passed, byte-identical PNG
- Chalkboard screenshot parity: passed, byte-identical PNG
- TimoTV regression suite: 31 files passed; 180 tests passed; 1 integration test skipped because `FILM_INTEGRATION` was not enabled
- TimoTV typecheck: passed
- Baseline import commit: `f79c62d`
- Upstream compatibility repair commit: `90c143e`
- Visual parity commit: `dfdf194`

This evidence proves the equivalent and repaired engine baseline. V3 contracts,
sandbox execution, Agent generation, review repair, preview integration, and
MP4 export remain the subsequent implementation required for the user-visible
goal.
