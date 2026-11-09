# Watercolor · grammar card

Reference: an illustrator's travel sketchbook and a picture-book painter at work — loose pencil drawing, then transparent watercolour flooded in, colours melting into each other, dark pooled edges where the paint dried, granulation in the paper's tooth, and plenty of white paper left untouched. Good for nature and geography, travel, culture and history stories, gentle life lessons, anything that wants warmth, light and a human hand.

## In one sentence

A painter sketches the scene in pencil while the narrator speaks, then on the key word floods it with colour that spreads, bleeds and dries: one painted scene per page, bright, airy, with the white of the paper as the light.

## Picture

- **White paper is the light.** Leave at least 35 % of every frame unpainted. Never paint a full background colour or a box around everything; a scene is a vignette that fades out into white paper at its edges. The sky, if any, is one `P.sky` sweep with clouds left white.
- **Transparent, overlapping washes.** Colour is laid with the kit, never with flat fills: `P.wash` (any shape), `P.blot` (round shapes), `P.paint` (pencil, then wash). Let washes overlap: where two meet they glaze darker, which is the beauty of the medium. Pair colours wet-in-wet with `bleed` (blue → purple for shadow and water, green → yellow for sunlit leaves, orange → red for warmth). Tones 0.45–0.8; the one thing that matters gets the richest tone.
- **Pencil stays visible.** Objects are pencilled first (`P.paint` does it; `P.pencil` for lines on their own). The graphite is a light grey sketch, two quick passes, ends overshooting — it is not an outline to fill neatly: the wash may spill past it a little.
- **Draw the subject, big.** Each page is a painted picture of the thing being said — a map, a landscape, a street, an object, a creature, a person at a small scale — placed off-centre and large (it spans at least half the content area). Build things from simple polygons with `P.paint` (a house is a wall + a roof + a door; a ship is a hull + a sail; a cup is a body + a handle + coffee). Use the ready scene pieces: `P.sky`, `P.hills`, `P.water`, `P.tree`, `P.person` (no faces).
- **Words are hand lettering in a sketchbook.** The page title is lettered over a loose wash stripe (`P.title` does it). Annotate with `P.label` (a caption, often with a pencil leader line `to` the thing and a red dot); key terms or steps as `P.swatch` paint chips; the one key number or word of a page as `P.painted` (giant letters filled with wash). Sizes: `P.label` 40–48 px (never smaller than 38), `P.swatch` 40–52 px, `P.painted` 150–260 px. At most 3 text elements per page besides the title. No bullet lists, no cards, no tables.
- **Numbers are painted.** A number that matters is `P.painted('1,600 km', …)` timed to the word (`at: P.cw(i, '1600') - 0.6`), or a `swatch`. Comparisons are drawn: two blots of different size, a path that gets longer, a stack of painted coins.
- Plain primitives (`P.box`, `P.arrow`, `P.line`, `P.circle`) render as pencil with a pale wash; use them only for small marks — an arrow of movement, a dotted route on a map (`dashed: true`, `color: 'soft'`).

### The kit (already registered — call directly)
- `P.paint(parts, o)` — **the signature**: pencil sketches the shapes, then colour floods into them (`fill`: the beat) and dries. parts: a polygon or `[{ p, color, tone, bleed }]`.
- `P.wash(pts, o)` — a transparent wash in any polygon, spreading from `from`, drying to a dark edge; `bleed` for wet-in-wet; `bloom` for backruns.
- `P.blot(cx, cy, r, o)` — a round wash (sun, moon, planet, apple, crown of a tree, coin, a dot of colour).
- `P.pencil(lines, o)` — graphite underdrawing lines; a horizon, a route, construction lines, a leader.
- `P.sky(o)` — one wet-in-wet sweep across the top (two colours, white clouds lifted out).
- `P.hills(o)` — overlapping washes of rolling land, far pale/blue to near warm.
- `P.water(x0, y, x1, o)` — broken horizontal strokes with paper glinting between them; shimmers.
- `P.tree(x, y, h, o)` — trunk + wet crown (`kind: 'round' | 'pine' | 'bare'`); sways.
- `P.person(x, y, h, o)` — a small faceless painted figure (`pose: 'stand' | 'walk' | 'point'`).
- `P.painted(str, x, y, o)` — giant letters painted in watercolour: the page's key number or word.
- `P.swatch(x, y, str, o)` — a paint chip with a word or number on it.
- `P.label(x, y, str, o)` — hand-lettered caption; `to: [x, y]` adds a pencil leader and a red dot.
- `P.spatter(cx, cy, o)` — a flick of paint droplets: punctuation for a discovery or a conclusion (≤ 2 per film).

## Motion and camera

- **Sketch, then flood, then dry.** Every object arrives in that order: pencil lines (0.5–0.9 s) while the narration introduces it, colour flooding in on the word that names it (`fill: P.cw(i, 'word')`), the edge darkening as it dries. Nothing slides, bounces or pops in.
- **Wet-in-wet transformations are the signature.** A colour bleeding into the next to show change (`bleed`), a second wash glazed over the first to show something growing deeper, a wash spreading across a map region to show something spreading. Time it to the word.
- **Gentle life after it dries.** Trees sway, water shimmers; otherwise the painting holds. Camera: wide by default; a calm `P.push` toward a detail at most once per page (≤ 1.2×), or a slow `P.pan` along a landscape/journey. No shakes, no slams.

## Pacing

- Within the first 1.5 s of a page the pencil is already moving; never a blank sheet waiting.
- 10–16 s per page, one painted scene per page, a visible change every 2–4 s (a shape sketched, a wash flooding in, a label written, a figure appearing).
- End the film on a wide, light painted scene with lots of white paper — never on a text card.

## Never

- Flat vector fills, hard-edged shapes without pencil, solid colour backgrounds, gradients that look digital, neon, glow, drop shadows, 3D.
- Boxes with text inside, cards, bullet lists, tables, chips, icons (`P.icon`), emoji, logos, slide layouts.
- Black ink outlines (this is not a comic) or monochrome ink painting (another style): colour always carries the picture.
- Filling the whole frame with paint; text under 34 px; text laid over a busy wash (put labels on white paper beside the painting); anything in the subtitle band (y > 900).
