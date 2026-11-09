# Frametell engine compatibility patches

TimoTV imports the Frametell drawing engine under AGPL-3.0 and keeps the
unmodified upstream inventory byte-for-byte. The following reviewed changes
repair benchmark projects that fail in the Frametell `0.8.0` source checkout:

- Add missing storyboards for the `blueprint` and `isometric` examples.
- Resolve style kits through the linked engine path in the `blueprint`,
  `engraving`, `exploded`, and `old-map` examples.
- Declare the `y` variable colour and keep the final camera move inside the
  safe frame in the `math` example; finish its storyboard on the moving dot.
- Move the `one-line` Rubin caption inside the safe frame.

`tests/drawing-engine-inventory.test.ts` rejects every unlisted upstream
divergence. The engine's own benchmark suite verifies these patches in a real
browser.

TimoTV also adds one isolated runtime extension in `runtime/timing.js`: when a
trusted `META.timeline` is present, the engine uses its measured page and cue
seconds exactly. Without that option the original Frametell estimated and
voice timing paths remain unchanged.
