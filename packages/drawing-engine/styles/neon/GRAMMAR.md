# Neon noir · grammar card

Reference: synthwave and cyberpunk title sequences, Tokyo and Hong Kong neon signage at night, 1980s arcade and VHS graphics, HUD interfaces in sci-fi films. The frame is a city at night and everything on it is drawn in light: tubes switch on, flicker, hum, and the dark between them is part of the picture.

## In one sentence

A night-city storyteller explains the future in light: every key word switches on like a neon sign the moment it is spoken, numbers glitch into place, ideas are glowing nodes joined by links that carry pulses, and the world under them is a grid floor running to a glowing horizon.

## Picture

- **Darkness first.** The ground is near-black violet. Light is precious: a frame holds 2–4 lit things, never a wall of glow. Empty dark is fine; empty *grey* never happens.
- **Three neon colours with jobs.** `red` is hot magenta — THE accent: the point, the number that matters, the warning. `blue` is electric cyan — the system, data, the path. `purple` is violet — the world: horizon, grid, edges, secondary links. `green` means "online / works", `yellow` is a rare spark (sun, a coin, a highlight), `orange` is cost or heat. `ink` is cool white for plain type. Never more than two neon colours fight on one screen besides violet.
- **Everything is a lit tube.** Outlines, arrows, frames, underlines are `P.tube` / `P.neonBox` / `P.neonRing` / `P.neonLine` — round caps, white-hot core, coloured bloom. Engine shapes (`P.box`, `P.arrow`, `P.icon`) glow automatically and fit too, but the kit's tubes are the signature.
- **Scale contrast.** One huge lit thing per screen: a `P.sign` word 140–260px, or a `P.glitch` number 220–360px. Supporting lines 40–56px; mono labels 26px. **Every settled frame has at least one element ≥ 180px tall.**
- **Fill the frame with the world, not with boxes.** Anchor the lower half: a `P.horizon` floor (with or without the striped sun), a `P.skyline` on the horizon, a `P.meter` or a row of nodes low in the frame, a rule at y 840–870 with a label. A composition floating in the top half above black is unfinished.
- **Nothing small on the floor.** The grid floor is busy light: never put a label, a caption or small text over it. Labels live above the horizon, inside a `P.panel`, or on plain dark. If the floor fills the lower half, the composition sits above the horizon line.
- **No page opens on an empty world.** A horizon or skyline alone is a stage, not a picture: the subject (a sign, a number, a node, a tube drawing) lights within the first second of the page and sits large in the frame.
- **Legibility beats glow.** Neon glow belongs to signs, big numbers and tubes. Sentences are plain white `P.text` (weight 600, ≥ 40px) with no extra effects; captions are `P.label` (mono, ≥ 26px). Never put small text on a bright tube or inside the sun.
- **HUD as the information layer.** Mono labels in caps (`SYS://02`, `LATENCY 30MS`, an English echo of a Chinese key word), `P.readout` stats, `P.panel` frames with corner brackets — they make it feel like a screen in a film, and they carry the facts.

### The kit (already registered — call directly)
- `P.sign(str, o)` — neon-sign lettering: characters switch on in turn with an ignition flicker, then glow. The headline voice. `{b:word}` cyan, `{p:…}` violet, `{k:…}` white. `hollow: true` makes outlined tube letters for one or two huge words. `buzz: i` keeps one letter stuttering (a dying sign) — once a film.
- `P.glitch(x, y, o)` — the number: digits scramble, lock left to right, land with an RGB split on the spoken word (`at: P.cw(i, '30%') - dur`). `mode: 'count'` counts up instead (growth).
- `P.tube(d, o)` + `P.neonBox`, `P.neonRing`, `P.neonLine` (`head: true` for an arrow) — tubes that draw on and stutter alight. `PV.rr(x, y, w, h, r)` and `PV.circ(cx, cy, r)` make paths; any SVG path works (a hand-made icon outline, a chart line, a lightning bolt).
- `P.node(cx, cy, o)` and `P.link(x1, y1, x2, y2, o)` — glowing nodes (ring + core or an engine icon inside, a ripple on switch-on, a label below) joined by links that carry travelling pulses. Networks, models, people, money flows, pipelines.
- `P.meter(x, y, w, items, o)` — segmented LED bars lighting up cell by cell; `hi` = the magenta row. Comparisons and rankings.
- `P.readout(x, y, o)` — mono caption + counting number + a thin tube rule: dashboard stats beside a picture.
- `P.label(x, y, str, o)` — mono HUD caption that types on with a block cursor; `no: '01'` prints a magenta index.
- `P.horizon(o)` — the synthwave floor: a perspective grid scrolling toward the viewer from a glowing horizon, optionally `sun: true` (the striped sun rising behind it). The world of this style; a backdrop under everything.
- `P.skyline(o)` — a city silhouette on the horizon, edges traced in violet, windows switching on one by one ("everyone", "a market", "a city").
- `P.rain(o)` — thin cyan rain streaks: mood for an opening or a dark turn.
- `P.panel(x, y, w, h, o)` — a HUD panel (dark glass, corner brackets, tab label, a scan line on open); **returns a layer**: draw its contents on it.
- `P.scan(at, o)` — a scanline cut: blacks out and re-reveals the frame; swap content at the returned `mid`. Once or twice a film.
- `P.flash(at, o)` — a bloom hit on the thesis or the reveal, with `P.slam`. At most twice a film.

### Layouts that work (vary them; never two pages alike in a row)
1. **Sign over the horizon**: `P.horizon({ sun: true })` low, a 180–240px `P.sign` above the sun, a mono label under it. The opening or the thesis.
2. **Number + city**: `P.skyline` along y 760, a 300px `P.glitch` in the sky on the left, a `P.readout` or two on the right.
3. **Network**: 3–6 `P.node`s spread across the whole content area (not a tight cluster in the middle), `P.link`s carrying pulses between them, each node lit on its cue; the one that matters in magenta.
4. **Meter board**: a `P.panel` across the width with a `P.meter` inside, the winner's row in magenta, a sign or glitch number above the panel.
5. **Split screen**: two `P.panel`s side by side — before/after, them/us, human/machine — each with a sign and a readout.
6. **Tube diagram**: one big idea drawn as tubes — a funnel, a loop, a rising chart line drawn with `P.tube`, a lightning bolt — filling the frame, labels in mono.
7. **Dying sign**: one huge `hollow` sign word, one letter buzzing, rain behind — for the problem, the cost, the warning.

## Motion and camera

- **Switch on, don't fade in.** Things enter by igniting: a tube draws on and stutters alight, a sign's letters flicker on in turn, a number glitches into place. Every key word lights at the moment it is spoken (`at: P.cw(i, 'word', -0.1)`).
- **One light at a time.** Stagger entrances to cues; the newest thing is the brightest; older things may dim (re-draw them in `muted` or hide them).
- **The world keeps breathing.** The grid floor scrolls, pulses travel along links, windows switch on, rain falls — slow continuous motion under fast entrances. That is what makes a still moment still feel alive.
- **Camera**: mostly locked off; a quick `P.push` toward a number as it lands, one `P.slam` with `P.flash` on the thesis, a `P.pan` along a row of nodes. No shakes beyond that, no slow drifts.

## Pacing

- Within the first 3 seconds something switches on big (a sign or a number), ideally over the horizon or the city.
- **Something is lit the instant a page turns in**: start each page with a tube, a label or the first sign at `at` 0–0.1 s.
- A lighting event every 1.5–3 s (a sign switches on, a number glitches, a node lights, a link fires, a meter fills).
- End the film on the thesis sign or the final number over the horizon, held for a full second.

## Checks

- The engine may report **"text-dominated page"** on a sign page: if a huge neon word is deliberately the subject, reply `FLAGGED: the neon sign is the subject in the Neon noir style`. Fix every other issue (overlaps, subtitle band, small text, empty opening).
- Keep text off y > 900 (subtitles) and inside x 140–1780. Backdrops (`P.horizon`, `P.skyline`, `P.rain`) may bleed to the frame edges.

## Never

- Light-grey or white grounds, paper textures, hand-drawn wobble, highlighter swipes, emoji.
- Glow on body text, glow on everything, more than four lit elements competing at once.
- Rounded "SaaS" cards in rows with icons and three bullet points; a centred title with a subtitle under it as a page.
- Neon colours used as decoration without meaning: magenta is the point, cyan the system, violet the world.
- Paragraphs: no line longer than ~16 Chinese characters (≈ 8 English words) at sign size; long ideas are split into words that light one at a time.
