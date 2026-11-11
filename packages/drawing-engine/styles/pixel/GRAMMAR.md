# Pixel game · grammar card

Reference: an 8-bit console platformer from the mid-1980s, used as an explainer. The idea becomes a level: a small robot hero walks through it, hits blocks, collects coins, stomps bugs and reaches the flag, and every action is one step of the explanation. This card adapts ideas from huashu-art-motion's 8-bit recipe (MIT).

## In one sentence

The concept is a game level and the hero plays through it: each step of the explanation is something the hero does (hit, collect, open, stomp, jump, unlock), each number is a score, a counter or a lamp in the level, and the film ends on LEVEL CLEAR.

## Picture

- **Everything is one pixel stage.** Every page is drawn with `P.pixel((g, lt) => { … })`: a 320×180 canvas of square logical pixels (1 logical px = 6 screen px). Coordinates are logical: x 0–320, y 0–180. **Keep y < 28 clear** (the page title) and nothing important at y > 150 (subtitles; ground tiles may run under them). Draw in layers, back to front: `g.sky` → `g.mountains` / `g.hills` / `g.clouds` (parallax) → `g.ground` and level props → sprites → text and panels → `g.hud` → `g.wipe`.
- **Pick the world from the topic.** `g.sky('day')` overworld, `'dusk'`/`'sunset'` a dramatic turn, `'night'` a quiet or ominous beat, `'cave'` underground (deep inside a system), `'sea'` underwater, `'circuit'` **inside a computer** (a green circuit board with copper traces). Ground kinds: `'grass'`, `'brick'`, `'stone'`, `'circuit'`, `'cloud'`. **Every page is a different world** (World 1-1 → 1-2 → 2-1…): never the same sky on two pages in a row, and `'circuit'` on at most two pages of a film (green on green gets monotonous — pair it with `'stone'` or `'brick'` ground, not `'circuit'` ground every time). A film that travels day → cave → circuit → sunset → night looks like a real game and keeps the eye fresh.
- **Concepts become level objects, never boxes and arrows.** A component is a `g.chip` with a pixel label (CPU, RAM, ALU, CACHE…) or a `g.block` (? block = something unknown waiting to be hit, `label` on it once revealed). Data is a `coin`, a `gem` or a `key` that travels along a wire (`g.path` with `k` animating, a sprite at its head). A memory address or a register is a row of lamps (`g.bits`). A process is a pipe the hero enters (`g.pipe`), a goal is the `g.flag` or a `g.door`, a reward is `g.chestOpen`, a problem is a `g.bug` (or a `ghost` sprite) that must be stomped. A quantity is `g.bar` (an HP / progress meter) or the score in `g.hud`.
- **The hero is the protagonist of every page.** `g.hero(x, groundY, { pose, scale })` — poses `idle` (blinks), `walk` (3-frame cycle), `jump`, `win`, `hurt`. **Default scale 2** (32 logical px tall: big enough to read its face and pose); scale 1 only in a wide scrolling shot with many props, scale 3 for a reaction or the final win. Recolour secondary robots with `swap` (`{ t: 'p', T: 'P' }` makes a pink one) for a second character.
- **Pixel type only.** Words on the stage use `g.text` (Latin and digits in the 8px console face; `scale: 2–4` for a headline number or a shout like `"FETCH!"`, with `outline: 'k'` over busy backgrounds). Speech and explanations go in `g.dialog` (an RPG text box that types out) or a `g.box` panel. CJK text on the canvas uses the 16px pixel face (`size: 16`, automatic); for long CJK lines prefer `P.pixelText` (DOM, any glyph). At most ~4 words per label; a headline at most 12 characters.
- **The console palette, flat.** Sprite characters: `k` outline black, `w e E D` greys, `r R` red, `o` orange, `y Y` gold, `g G h` greens, `c b B` blues, `t T` teal, `p P v V` pinks/purples, `s S n N` skin/browns. No gradients except the dithered skies, no blur, no glow, no soft shadows: depth comes from parallax layers and 1px black outlines. Everything is drawn at integer logical pixels.
- **A HUD makes it a game.** Most pages show `g.hud({ score, coins, lives })` top right, and the numbers *mean* something in the explanation (score = the result so far, coins = items collected, lives = retries left). `P.title(str, { world: '1-2' })` writes the page title as a console banner with a WORLD tag; number the worlds through the film.

- **Fill the playfield.** A page reads like a screenshot of a busy, handsome level: 3+ depth layers (sky, far mountains or hills, clouds, ground), props at different heights (platforms, pipes, blocks, a door), the subject objects big (a chip 60–110 px wide, a headline number at `scale: 3–4`). No large flat empty areas; nothing important smaller than 12 logical px.

## Motion and camera

- **Stepped, like a console.** Poses switch on frames (`g.step(lt, 12)`), coins spin in 4 frames, sparkles blink. Positions move in whole logical pixels (that is automatic) — no smooth tweens of size or opacity: things appear by popping, bumping, typing, or a wipe.
- **The hero acts on the cue.** Time the action to the word: the jump lands on the block exactly when the narration says the thing it reveals (`P.cw(i, 'word')`). A hit is a sequence: walk in → jump (≈0.4 s up) → `bump` the block (0.25 s) → `coinPop` / `pop('+1')` / `burst` → the HUD changes. A stomp is jump → `squash` → `burst`.
- **The level scrolls.** For a process with steps, lay the steps out left to right and scroll with `g.view(PV.keys([[t0, 0], [t1, 160]], lt))` while the hero walks — hills and clouds parallax automatically. Keep the hero roughly a third in from the left while scrolling.
- **Signals really travel.** A fetch is a gem running along a copper `g.path` from RAM to CPU; a decode is the chip's `glow` turning on and a `g.dialog` typing the instruction; an execute is a `burst` and the register `g.bits` lighting up. Show the movement, don't caption it.
- **Camera.** Hold wide; `P.push(at, x, y, 1.15–1.3)` (screen pixels: logical × 6) onto the hero or the block at the payoff, `P.back` after. `P.shake` only for a crash or a boss hit (≤ 2 per film).
- **Transitions are console wipes.** Close a section with `g.wipe(k, 'iris', { x, y })` on the hero, or `'blocks'` / `'bars'`; open the next page with `g.wipe(1 - k, …)`.

## Pacing

- **Frame one is already a finished, beautiful level** with the hero in it — never an empty sky that fills in. Within the first 2 seconds something moves (a walk, a coin spinning, a cloud drifting).
- 10–16 seconds per page, a game event every 2–4 seconds (a hit, a pickup, a door, a lamp lighting, a score roll).
- The last page lands on the payoff in game terms: the flag slides down, `"LEVEL CLEAR!"` (or `"1-UP"`, `"HIGH SCORE"`), the hero's `win` pose, the final number on the HUD. Never a centred quote card.

## Never

- Smooth vector shapes, hand-drawn wobble, rough boxes and arrows (`P.box`, `P.arrow`), or slide-deck layouts of cards and bullets.
- Anti-aliased or blurred pixels, glows, gradients other than the dithered skies, drop shadows other than the 1px pixel shadow.
- Copying real game characters, logos or level layouts (no plumbers, no famous mushrooms or turtles): this world has its own robot hero, bugs, chips and coins.
- Text in a non-pixel face on the stage, labels longer than ~4 words, more than one dialog box at a time.
- A page where the hero does nothing.

## The pixel kit: `g` inside `P.pixel((g, lt) => …)`

Logical pixels throughout (x 0–320, y 0–180). Colours are sprite characters (`k w e E D r R o y Y g G h c b B t T p P v V s S n N`), palette names or hex. Anything that changes takes a progress value you compute from `lt` (e.g. `(lt - P.c(2)) / 0.6`), so it stays a pure function of time. `g.lt` is the current page time.

- `g.step(lt, fps = 12)` — time snapped to console frames — feed sprite poses and bobbing through it
- `g.view(x)` — scroll the level so world x sits at the left edge (tiles, sprites and text follow; sky, hud, wipes stay)
- `g.rect(x, y, w, h, color) / px(x, y, color)` — raw pixels, in logical units
- `g.line(x0, y0, x1, y1, color, w = 1)` — a Bresenham line of square pixels
- `g.path(points, color, { k = 1, w = 1, dash }) → [x, y] of the head` — a right-angle or free polyline drawn up to fraction k (a signal running along a wire)
- `g.sky(kind = 'night')` — fill the frame — 'day' | 'dusk' | 'night' | 'sunset' | 'cave' | 'sea' | 'circuit' (a green circuit board with copper traces: inside a computer)
- `g.clouds(y, { par = 0.3, n = 5, color = 'w', shade = 'e', drift = 0 })` — a row of pixel clouds; drift = logical px/s of wind (use g.step time)
- `g.hills(y, { par = 0.5, color = 'G', shade = 'h', big = 34 })` — rolling pixel hills along the horizon (repeat across the level)
- `g.mountains(y, { par = 0.2, color = 'V', snow = 'w' })` — far stepped mountains (pixel triangles) behind the hills
- `g.bush(x, y, w = 1)` — a green bush sitting on y (w = 1..3 lumps)
- `g.ground(y, kind = 'grass', { from, to })` — fill the floor from y to the bottom with 16px tiles — 'grass' | 'brick' | 'stone' | 'circuit' | 'cloud'. Default spans the whole view
- `g.tile(x, y, kind, top)` — one 16×16 tile (see ground); top=true draws the surface row
- `g.platform(x, y, n, kind = 'brick')` — a floating row of n tiles at (x, y)
- `g.block(x, y, { kind = 'q', bump = 0, label })` — a 16×16 block, top-left at (x, y) — 'q' (? block) | 'used' | 'brick' | 'chip'; bump 0..1 pops it up 5px (when hit); label: up to 3 pixel letters on it
- `g.chip(x, y, w, h, { label, color = 'D', pins = 'e', glow })` — a microchip (CPU, ALU, RAM…) with pins on all sides; label in pixel type centred; glow 0..1 lights its edge
- `g.pipe(x, y, h, { color = 'g' })` — a pipe whose 32px-wide lip sits at (x, y), body running h px down (or set up:true to hang from the top)
- `g.flag(x, groundY, k = 1, { color = 'g' })` — the end-of-level flagpole at x; k 0..1 slides the flag from the top to the bottom
- `g.door(x, groundY, { open = 0, color = 'N' })` — a castle door (24×32) standing on the ground; open 0..1
- `g.sprite(name, x, y, { frame, flip, scale = 1, swap, anchor = 'bc' })` — draw a library sprite — hero.idle hero.blink hero.walk1 hero.walk2 hero.jump hero.win hero.hurt bug.1 bug.2 coin.1-3 heart heart.empty star gem chest key ghost arrow qblock used — or your own string-art array (rows of palette characters, '.' transparent). anchor 'bc' = (x, y) is the bottom centre, 'tl' = top left. swap recolours, e.g. { t: 'p', T: 'P' }
- `g.hero(x, y, { pose = 'idle' | 'walk' | 'jump' | 'win' | 'hurt', t, flip, scale = 2, swap })` — the robot hero (24×32 at the default scale 2), feet at (x, y). walk cycles 3 frames on t (pass lt; stepped at 10 fps); idle blinks now and then
- `g.bug(x, y, { t, flip, scale, squash })` — the enemy beetle (a bug in the code), feet at (x, y); squash 0..1 flattens it when stomped
- `g.coin(x, y, { t, scale })` — a spinning coin, bottom centre at (x, y) (4-frame spin at 8 fps)
- `g.coinPop(x, y, k)` — a coin shooting out of a block at (x, y) (block top centre) — k 0..1 over ~0.6 s; it rises 28px, spins and vanishes into a "+1"
- `g.chestOpen(x, y, k, { scale })` — a treasure chest at (x, y) (bottom centre); k 0..1 lifts the lid and lets gold light rise out
- `g.text(str, x, y, { color = 'w', scale = 1, align = 'l' | 'c' | 'r', shadow = 'k', outline, fixed, k })` — pixel type — Latin and digits in an 8px console face (scale 2–4 for headlines), CJK in a 16px pixel face (set size: 16). (x, y) is the top. k 0..1 types it out letter by letter. fixed: ignore view scrolling
- `g.box(x, y, w, h, { fill = 'k', border = 'w', fixed })` — a console window — black panel, double pixel frame, cut corners
- `g.dialog(x, y, w, h, str, k, { title, color, fixed })` — an RPG text box that types str out as k goes 0→1, a blinking ▼ when done; title sits on the frame (e.g. a speaker name)
- `g.hud({ score, coins, lives, time, label })` — the console HUD along the top right (score as 6 digits, a coin ×count, hearts for lives out of 3, a TIME countdown, a gold label) — fixed on screen
- `g.burst(x, y, k, { color = 'y', n = 10, r = 26, seed })` — a pixel explosion / sparkle ring flying out from (x, y) as k goes 0→1 (bricks breaking, a correct answer, a bug destroyed)
- `g.sparkle(x, y, t, { color = 'w' })` — a 4-point twinkle that blinks on stepped time (on a gem, a correct answer, a powered-up chip)
- `g.pop(x, y, str, k, { color = 'w' })` — a score popup ("+100", "OK!", "1 CYCLE") floating up 16px as k goes 0→1, then gone
- `g.bar(x, y, w, v, { color = 'g', back = 'D', label, segs })` — a segmented console meter (HP / progress / a register filling), v 0..1
- `g.bits(x, y, value, n = 8, { on = 'g', off = 'D', k, size = 8, digits = true })` — a row of n bit lamps showing value in binary (a register, a byte on a bus); k 0..1 lights them left to right
- `g.wipe(k, kind = 'iris', { x, y, color = '#000' })` — a screen transition covering the frame as k goes 0→1 — 'iris' (a closing circle on x, y), 'blocks' (a staircase of 16px blocks), 'bars' (horizontal shutters). Use 1-k to open
- `g.fixed(fn)` — draw fn() in screen space even while the level scrolls (labels, a pinned panel)
- `g.par(p, fn)` — draw fn() with parallax factor p (0 = stays with the screen, 1 = moves with the level)
