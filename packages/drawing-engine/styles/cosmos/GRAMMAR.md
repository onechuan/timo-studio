# 3D Cosmos · grammar card

Reference: cinematic space documentaries and planetarium shows: NASA visualisation studio fly-throughs, *Powers of Ten* (Eames, 1977), *Cosmos* title sequences, the black hole of *Interstellar*. Suits astronomy and scale: the solar system, how far and how big, orbits and seasons, black holes, the life and death of stars, the inside of planets, spaceflight trajectories.

## In one sentence

A real 3D space documentary: every page is one live three.js scene of lit worlds in black space, the camera always moving, names and numbers pinned to the objects as thin HUD callouts, and when the subject is size or distance the camera pulls back through powers of ten, each new scale ring landing on its spoken number.

## Picture

- **One scene per page.** Every page opens with `const S = P.space({ … })` (call it first, once) and builds everything through the handle `S`. Never call `P.three` or touch `THREE` yourself; never draw a planet, star or orbit with `P.circle`, `P.canvas`, `P.icon` or SVG. The kit is the only way to put an object in space.
- **Units.** Earth's radius = 1; the orbital plane is x–z, y is up. Built-in bodies get their real colours and (compressed) sizes: `S.body('earth')`, `'moon'`, `'sun'`, `'mars'`, `'jupiter'`, `'saturn'`… For anything else: `S.body({ kind: 'rock' | 'gas' | 'ice' | 'lava' | 'earth' | 'star', color, temp, name }, { r, pos })`.
- **Which component draws which subject:**
  - the solar system, orbits, years → `S.system({ at, labels })` (Sun + planets moving at speeds in true proportion), or a few `S.body(…, { around, dist, period })`
  - one world, seasons, day and night, a moon → `S.body` big in the frame (`P.space({ target: 'earth', dist: 4, shift: [-0.15, 0] })`), its moon with `around`, `axis: true` for the tilt
  - how big → `S.lineup(['sun', 'jupiter', 'saturn', 'earth', 'moon'])` (true relative sizes, the Sun's edge filling the left)
  - how far, how big is the universe → `S.zoomOut([...levels], { at })` (the signature)
  - a distance → `S.measure(a, b, '384,400 km')`; a key figure → `P.readout(x, y, value, { unit, caption })`
  - a galaxy, where we are in it, the black hole at its centre → `S.galaxy({ r: 6, tilt: 25 })` and `S.label(g.here, '我们在这里')`; never assemble a galaxy from many `S.body` stars
  - black holes → `S.blackhole({ r })`; a dying star → a `kind: 'star'` body with `r: lt => …` swelling and `temp` cooling, then `S.burst(star, t)`
  - inside a planet or the Sun → `S.cutaway('earth' | 'sun' | 'jupiter', { open, labels: [t0, t1, …] })` (labels sit in a legend column on the right by themselves)
  - a mission, a trajectory → `S.transfer(fromPlanet, toPlanet, { at, dur, label })` (Hohmann half-ellipse), `S.path([pointsOrBodies], { label })`
  - a beam of light, a signal, a pulse travelling between two things → `S.path([from, to], { at, dur, color: 'yellow', label })` (a bright head with a trail); a light that circles a planet → `S.path` through 5–8 points round it
- **Composition.** The hero object fills 40–80 % of the frame height, or a system spans the full width. **No empty frames:** a `cameraTo` pull-back stops while the subject still fills ≥ 15 % of the frame height or its orbit spans ≥ half the width; a world shrinking to a lone dot in black happens only inside `S.zoomOut`. Put a lone hero off-centre with `shift: [-0.15, 0]` so its callouts have room on the right. The scene is full-bleed; nothing else fills the frame.
- **Words are callouts, pinned to things.** Names are `S.label(target, name, { sub })`: a dot on the object, a hairline leader, a name, a second line in mono for the number. At most 4 labels on screen at once; every label names something visible. One `P.readout` per page at most, in the empty dark (x 1150–1700 or x 160–600, y 560–820). No sentences on screen: no `P.text` longer than 8 Chinese characters / 5 English words, no boxes, no cards, no bullet lists.
- **Colour has jobs.** `blue` (instrument cyan) for labels, rings and measurements; `orange` for the Sun, heat and the number that matters; `red` for danger and red stars; `purple` for the far away. Colour of objects comes from the bodies themselves; never tint space.
- **Title.** `P.title(short name)` top left. Nothing else above y 190 except the zoomOut counter at top right.

## Motion and camera

- **The camera never stands still.** `P.space` drifts slowly round the target by itself. Every page also makes at least one deliberate move with `S.cameraTo(target, distance, at, dur)` on a cue: push in to the thing being named (distance ≈ 3–5 × its radius), pull back to reveal the system (×5–20), or swing round (`{ az, el }`). Moves take 1.5–3 s and ease; never cut, never shake.
- **Things arrive in space.** Bodies grow in at their `at`, orbit lines draw on, labels slide in after them. Time every `at` to the word that names it (`P.cw(i, '月球')`). Planets keep turning and orbiting after they arrive.
- **Signature: powers of ten.** `S.zoomOut(['earth', 'moon', 'inner', 'solar', 'stars', 'galaxy', 'universe'], { at: [0, P.cw(1, '38'), …] })`. The first level is on screen at once; every later `at` is the moment its number is spoken, and the narration names one level per cue. 4–7 levels on one page, 2–3 s per level. Use it once per film, on the page where the subject is scale; a zoomOut page adds nothing else in 3D (a `P.readout` is fine).
- `P.cam`, `P.push`, `P.slam`, `P.shake` are not used: the 3D camera is the camera.

## Pacing

- The first page shows a lit world within the first second (never black space filling in).
- 8–14 seconds per page; something new every 2–3 s: a body grows in, a label lands, the camera moves, a ring draws on, a number counts.
- **One hero, at most two pages.** Even a film about one object (a black hole, the Sun, Mars) shows it on no more than two pages; the others show where it comes from and how big it is: the star before it, the system around it, a `S.lineup` or `S.measure` against Earth, a `S.zoomOut`. A black hole is seen from at least 7 × its radius (the kit enforces it); put its labels on the dark side of the frame, never on the bright disc.
- A supernova is a whole beat: `S.burst(star, t, { r: 8–12 })` with the star filling a third of the frame before it, and the camera holding wide (≥ 4 × the burst radius) so the shell is seen racing out.
- Vary the shot from page to page: a close planet, a wide system, a lineup, a cutaway, a black hole never repeat back to back with the same camera distance.
- End on a full picture held for a second: the last scale ring of a `S.zoomOut` landing (the only place Earth may be a dot, marked "you are here"), the whole system turning, or the hero big in the frame. Never end on an emptied frame.
- Two things far apart (Earth and Mars, Earth and the Moon) are shown with the orbits that join them (`S.system`, `S.orbit`, `around`), never as two small crescents at opposite edges of an empty frame.

## Checks

- The page check may call a zoomOut page sparse mid-journey; it is not. If it reports "sparse page" on a page whose scene is `P.space`, reply `FLAGGED: the 3D scene fills the frame in the 3D Cosmos style`. Fix overlaps, text in the subtitle band and small text.

## Not this

- Not `vector` (Vector Science): no flat two-tone shapes, no cartoon birds, no hand-drawn orbs on a canvas. Here every world is a lit 3D sphere with a terminator.
- Not `neon`: no glowing tubes, synthwave grids or glitch type. The only glows are the Sun, stars and the black hole's disc.
- Not `blueprint` or `swiss`: no technical drawing, no grids of boxes, no charts. Numbers live on callouts and one readout.

## Never

- More than one `P.space` on a page; `P.three` or `THREE` in a page; planets drawn as 2D circles, emoji or icons.
- Planets floating unlit on a flat colour, a white or light background, paper texture, hand-drawn wobble.
- Labels that point at nothing, more than 4 labels at once, labels below y 870 (subtitles) or crowding the title.
- Paragraphs, bullet lists, cards and boxes; quotes centred on black.
- A static camera for a whole page; a camera move with no cue behind it; two zoomOut pages in one film.
- Wrong facts in callouts: use the real figures (Earth 12,742 km across; Moon 384,400 km away; 1 AU = 150 million km; light from the Sun takes 8 min 20 s; the Milky Way is 100,000 light-years across).
