# Flat vector science · grammar card

Reference: the big YouTube science channels that explain the universe with flat vector animation — deep night skies, bright saturated shapes with no outlines, tiny round birds, and zooms through orders of magnitude. These rules come from studying that genre; calibrate them against real sample films.

## In one sentence

A wondrous, cinematic tour: every page is a small illustrated world in deep, glowing colour, one big hero object carries the idea, a tiny bird shows the scale, and when the subject is size or distance the camera travels through orders of magnitude.

## Picture

- **A world, not a slide.** Every page starts with `P.vsky({ mood })` as its backdrop (call it first) and builds a scene in three depths: the sky (stars, nebula, clouds), the midground hero with its neighbours, and a foreground cut by the frame edge — `P.vfore({ kind })` (rocks, crater, plants, reef, dunes, clouds; call it last), or `hills` / `horizon` in `vsky`, `P.vcity`, `P.vtree`. Never a hero floating alone in empty dark: if a quarter of the frame is empty, fill it with a neighbour, a moon, a bird, a cloud bank, or bring the hero closer.
- **One hero, big.** The idea lives in one object drawn large — a planet, a cell, a molecule, a machine — radius 220–380 px or a shape spanning half the frame, usually off-centre (rule of thirds), with 2–4 smaller supporting objects. The page check wants the drawing to span most of x 140–1780, y 180–880.
- **Flat with two tones, no outlines.** Shapes are solid colour with a darker crescent away from the light and a thin rim light toward it (light from the top left). The kit does this: `P.vorb` (spheres: planet, moon, sun, cell, atom, virus, drop), `P.vblob` (organic shapes), `P.vtree`, `P.vcity`, and on your own canvas `PV.V.flat(ctx, path2d, color)` / `V.rect` / `V.orb` / `V.blob`. **Never** an outlined `P.box`/`P.circle` look, never hand-drawn wobble, never line-art `P.icon` doodles — build objects from flat shaded shapes instead.
- **Colour is mood.** A scene is one palette (`mood`: `space`, `night`, `dawn`, `day`, `ocean`, `cell`, `forest`, `ember`); change mood when the story moves to a new place or scale, so consecutive pages feel like different worlds. On top, at most three saturated accents: cyan (`blue`) the protagonist, warm orange/yellow the energy or the number, coral (`red`) danger; mint (`green`) life. Glow (`glow: true`, `V.glow`) only on things that emit light: stars, suns, eyes, signals, beams.
- **The bird for scale.** `P.vbird` — the round little bird with big eyes — sits beside big things, flies along paths, reacts. Use it on most pages; it is this style's signature and its joke.
- **Words are few, bold and attached.** Names are `P.vlabel` pills with a leader line to the thing (`to: [x, y]`); a key number is `P.vnum`, huge, yellow, counting up to land the moment it is spoken (set its `at` to the moment the count starts, so a bare 0 never sits on screen). Body text at most one short line per page (≥ 36 px), never paragraphs, never boxed captions. `P.title` is a small bold label with a coloured dot (pass `accent`).

## Drawing your own objects (PV.V, inside `P.canvas` or a `vjourney` level)

For anything the components don't cover (a rocket, a neuron, a whale, a factory), draw it flat on a canvas sized to the object's area: `P.canvas(x, y, w, h, (ctx, lt) => { const V = PV.V; … })`, coordinates local to that box (a canvas covering the whole frame is read as a backdrop by the page check, so keep it to the object).
- `V.flat(ctx, path2d, color)` two-tone fill of any `Path2D`; `V.rect(ctx, x, y, w, h, color, r)`; `V.orb(ctx, x, y, r, { kind, color, spin, ring, glow })`; `V.blob(ctx, cx, cy, r, color, { seed, squash, wobble })`; `V.smoothPath(points)` → a smooth closed `Path2D` through points
- `V.tree(ctx, x, y, s)`, `V.cloud(ctx, x, y, s, { alpha })`, `V.bird(ctx, x, y, s, { t: lt, face, color })`, `V.glow(ctx, x, y, r, color, alpha)`, `V.pill(ctx, x, y, text, { size, color })`, `V.mix(a, b, k)` colour blend
- Compose characters and machines from several flat shapes (body, darker belly, light highlight, big white eyes with a dark pupil). Animate with lt (bobbing, blinking, rotating parts), always as a pure function of lt.

## Motion and camera

- **Things pop into the world.** Objects appear with a short overshoot (built into the kit; `at` sets the moment), timed to the words that name them. Exits are quick fades (`out`).
- **The world is alive.** Something always moves gently: twinkling stars (`vsky`), drifting motes or sparks (`P.vfield`), planets spinning (`spin`), clouds drifting (`clouds`), birds flapping, beams shimmering (`P.vbeam`). Held frames never look frozen.
- **Scale journeys, sparingly.** At most two pages of a film are journeys; the others are rich still scenes with their own camera pulses, so the film has variety. Whenever the subject is size, distance, time or quantity across orders of magnitude, use `P.vjourney(levels, { keys })`: a continuous log zoom where each level is drawn crisp and the last level shrinks to a dot at the centre of the next, with a size counter. Each level is a whole composition, not an icon: the hero fills radius ~300 and 3–6 neighbours spread across x ±620, y ±300 (moons around a planet, houses and trees around a child, stars around the Sun, galaxies around a galaxy), drawn with `V.orb`, `V.rect`, `V.tree`, `V.bird`, `V.cloud`, `V.blob`; give it a `name`, a `size` and a `mood`. Hold on each level while it is named, then travel; one journey can carry a whole page.
- **Camera pulses.** Wide by default; push in quickly (`P.push`, 1.2–1.35×) on the detail being named, hold, back out (`P.back`). Inside a `vjourney` the journey is the camera: don't add `P.cam` on top.

## Pacing

- Within the first 3 seconds, the hero is already on screen in its world (never a dark empty page that fills in).
- 10–16 seconds per page, a new object, label, number or zoom step every 2–4 seconds.
- End on wonder: a pull-back that shows how small we are, the bird looking at something enormous, a final number landing. Never on a centred quote card.

## Never

- Outlines, sketchy strokes, handwriting, paper or chalk texture, pencil hatching (those are other styles).
- White or light cards, boxed text, bullet lists, slide-deck layouts of title + boxes + arrows.
- Grey: every shape has colour. Neon tubes, glowing outlines, lens flares on everything; glow only on light sources.
- Line-art icons from `P.icon`; build the object from flat shaded shapes.
- More than three accent colours in one frame; a hero smaller than a coin in the middle of empty space.
