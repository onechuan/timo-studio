# 3D Miniature City · grammar card

Reference: tilt-shift miniature photography (Olivo Barbieri's aerial "site specific" series, Vincent Laforet, Keith Loutit's time-lapse films) and the architect's scale model on its display base — a real landscape made to look like a toy: saturated colours, low sun with long shadows, a lens blur above and below a sharp band. It suits cities, geography and how places work: urban growth, planning and density, traffic, floods and rivers, ports and logistics, energy across a landscape.

## In one sentence

Every page looks at the same small 3D model of a place on a floating soil slab, photographed through a tilt-shift lens: the camera glides over it while blocks grow out of the ground year by year or water rises on the spoken number, little cars, trains and ships never stop moving, and white pin flags name the parts.

## Picture

- **One model per page, and one model per film.** Every page is `const D = P.diorama({ seed })` plus D's methods; nothing else draws the picture. Use the **same `seed`, `D.terrain` and main `D.city` on every page**, so the film keeps returning to one place, and change what happens on it (growth, water, traffic, light, highlights) and where the camera looks. A page about a different place (a second city, a coast) may change them, at most twice per film.
- **Build the place from these, in this order:** `D.terrain` (hills, a river, a coast, a low district), `D.city` (streets and buildings; `kind`: `mixed` towers in the middle, `houses`, `towers`, `old`, `industrial`), `D.zone` (park, forest, farm, lot, sand), `D.road` (road, highway, rail with a train, flood wall), `D.port`, `D.landmark`, `D.wires`. Most of the slab holds something: a city or two, zones on the open land, a river or coast. A slab of bare grass with one building is unfinished.
- **Sizes.** The slab is 32 × 20 cells (x 0→32 left to right, z 0→20 far to near). A main city covers 12–22 × 8–14 cells (e.g. `area: [6, 3, 20, 13]`). Keep things the narration points at between z 3 and z 16: the front edge sits under the subtitles.
- **Comparisons are built, not charted.** Density: a `towers` city beside a `houses` city of the same size. Growth: `D.grow`. Height: a `skyscraper` or `tower` landmark beside low blocks. A before/after: the same model with water, traffic or light changed. Never a flat bar chart.
- **Words are pin flags and placards only.** `D.label(point, text, { sub })` sticks a white flag into the model (≤ 8 汉字 / 3 words; `sub` a short mono echo or number). **At most 4 flags at once**: give earlier ones `out` when new ones come. One number is a `P.placard(x, y, value, { from, unit, sub })` in an upper corner (x 1450–1780 or 140–480, y 190–320), never more than 2 placards on a page. `D.grow` makes its own year placard top right; a year in a placard always matches what the model shows (never a fixed 1980 over a grown city). No `P.text`, no `P.box`, no arrows drawn over the picture.
- **Colour.** The model's own toy colours (green land, blue water, cream and white blocks with red roofs, bright cars) are fixed by the kit. Point at things with colour: `D.highlight(area, { color })` and the flag colour — `orange` the subject, `red` danger (flood, jam, failure), `blue` water, `green` parks and growth, `yellow` power. One highlight colour per page, at most 2 highlights.
- **The title** is drawn for you as a white card top left (`P.title`). Keep flags and placards below y 190.

## The kit (already registered — call directly)
- `P.diorama({ seed, sky, tilt, glide })` → D. `sky`: `'day'` (default), `'dusk'`, `'night'`; `tilt` 0.5–1.1 (default 0.76); `glide` 0–2 (default 1). Leave `yaw` alone: the model is always seen from the same corner.
- `D.terrain({ hills, river, riverAt, coast, coastWidth, low, lake, trees })` · `D.city({ area, density, height, kind, block, at })` → point · `D.zone(area, kind, { at })` · `D.road(points, { kind, at, dur, height })` · `D.port({ side, from, to, fill, ships, at })` · `D.landmark(kind, point, { at, s, count })` → point (`tower skyscraper stadium factory plant windmill solar dam bridge station house crane pump tank`) · `D.wires(points, { at, dur, flow })`.
- Change over time: `D.grow(fromYear, toYear, at, dur, { sub })` · `D.water(level, at, dur, { muddy })` · `D.rain(at, { out })` · `D.traffic({ density, speed, at })` · `D.sky(kind, at, dur)` · `D.power(level, at)`. Values written as keys `[[t, v], [t, v, dur], …]` glide between them (e.g. `speed: [[0, 1], [P.c(2), 0.1]]` jams the city on cue 2).
- Pointing: `D.highlight(area, { color, at, out })` · `D.label(point, text, { at, out, sub, color })` · `D.flyTo(point|area, at, dur, { zoom, tilt, yaw })` · `D.back(at, dur)` · `P.placard(x, y, value, { at, from, unit, sub, align })`.
- Areas: `'all' 'center' 'downtown' 'north' 'south' 'east' 'west' 'nw' 'ne' 'sw' 'se'` or `[x, z, w, d]`; points: `[x, z]`, an area, or a handle (`D.city`, `D.landmark`).
- Water levels: 0 normal · 0.25 rivers over their banks and the `low` district flooded · 0.5 every flat street under water · 1.2 only hills dry.

## Motion and camera

- **The model is alive the whole time.** Traffic is on from the first frame on every page with streets (`D.traffic`; default density 0.45); boats run the river, trains the rails, ships the port, smoke leaves chimneys. Held frames are never frozen.
- **Things arrive on their word.** What exists before the page's story starts is simply there (anything with `at` ≤ 0.5, the default, is standing from the first frame). What the narration introduces rises on its word: cities in a wave from their middle at `at`; landmarks pop up; roads build from end to end; flags pop on `P.cw(i, '词')`. Time each to its cue or word.
- **Signature moves (one per page, on its cue):** the city grows year by year (`D.grow`, 6–12 s, from a small core to towers, with the year counting); water rises across the terrain as the number is spoken (`D.water(level, P.cw(i, '…'), 2–4, { muddy: true })`, rain first); traffic thickens and stops (`D.traffic` keys + a red `D.highlight` on the jam); the lights go out (`D.sky('night')` then `D.power(0, …)`); a port fills (`D.port({ fill: [[0, 0.2], [t, 0.95, 4]] })`).
- **Camera: a slow aerial glide.** It always drifts on its own; on the page's key moment `D.flyTo` the place (zoom 2–3 for a district, 4 for a street), then `D.back` to the whole model. One or two flyTo per page, each 2–3 s, never back and forth on every cue. `tilt: 0.55` for a low dramatic look across the towers.

## Pacing

- The model is on screen, built and moving, from the first frame; first change (a flag, a city rising, a flyTo) by 1.5 s.
- 10–16 s per page; a visible change every 2–4 s: a flag, a flyTo, water moving, blocks growing, a highlight.
- End the film wide on the whole model, everything moving, the answer flagged — never on a placard alone.

## Never

- More than one `P.diorama` on a page, or drawing over it with `P.box`, `P.arrow`, `P.text`, `P.path` or icons. Words only as flags and placards.
- Slide habits: a flag with a sentence, more than 4 flags at once, a placard holding a paragraph, a bar chart.
- Points in the front band (z > 17) or under the subtitles; flags on things the camera has flown away from.
- A camera that never stops moving between distant places, or more than 3 flyTo per page.
- Flat orthographic views, outlines, pastel-only colour or hand-drawn marks: this is a lit 3D model, not an illustration.
- An empty slab, or a page where nothing moves.

## Not this

- **Isometric** (flat 30° illustration on a pastel plate, no perspective, no blur, no shadows on the ground): here the camera has perspective, a lens blur and real sunlight.
- **Clay** (puppets with faces on a tabletop set): no characters and no faces here; the place is the subject.
- **Blueprint**, **old maps**, **transit diagrams** and **globes**: no line drawings, paper, schematic lines or planet; always the solid model seen from above at an angle.
