# Drawing engine changes

TimoTV maintains its drawing engine in `packages/drawing-engine`. The initial
baseline was derived from Frametell `@frametell/engine` 0.8.0 under AGPL-3.0;
provenance and license terms are recorded in `THIRD_PARTY_NOTICES.md` and
`docs/OPEN_SOURCE.md`. The engine is vendored here and no upstream checkout is
needed to build, test, or run TimoTV.

The following reviewed changes keep the bundled example projects and the
TimoTV runtime working:

- Add missing storyboards for the `blueprint` and `isometric` examples.
- Resolve style kits through the linked engine path in the `blueprint`,
  `engraving`, `exploded`, and `old-map` examples.
- Declare the `y` variable colour and keep the final camera move inside the
  safe frame in the `math` example; finish its storyboard on the moving dot.
- Move the `one-line` Rubin caption inside the safe frame.

TimoTV also adds one isolated runtime extension in `runtime/timing.js`: when a
trusted `META.timeline` is present, the engine uses its measured page and cue
seconds exactly. Without that option the original estimated and voice timing
paths remain unchanged.

The engine's own benchmark suite verifies these changes in a real browser.
Future edits are made directly in `packages/drawing-engine`; there is no
upstream manifest, sync script, or audit job.
