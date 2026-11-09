# Inked · grammar card

Reference: hand-inked isometric object illustration in the tradition of risograph prints and "how things work" picture books: one everyday object drawn big at 30°, flat colour in three tones per face, a heavy brown-black outline with finer inner lines, a flat blue cast shadow, warm paper, cream pill labels on leader lines, pill buttons with a hard ink shadow. Suits how an everyday object works: kettles, toasters, washing machines, vending and gumball machines, coffee makers, fridges, locks, lamps, printers, cameras, a desk set; and a product walkthrough where the product is a thing you press.

## In one sentence

One everyday object stands big on warm paper and does its real job step by step as the narration presses its buttons: each step's pill sinks and lights mustard, the part that does the work moves and its label turns mustard while it works, and what travels (water, a coin, bread, clothes) moves only along its real path.

## Picture

- **One object, big, every page.** Each page is `const F = P.figure({ size: [W, D, H] }, (D, lt) => { … })` with the film's object (or one assembly of it, or the object plus what feeds it: the jug, the cup, the coin). Model in centimetres, about 1 unit per cm; a small thing (a kettle, a toaster) is modelled 60–100 units across so detail reads. `size` is the true bounding box of the object and what moves (the lifted lid, the open door, the board), no padding: a loose `size` makes a small object. The figure fills the default box (x 380–1640, y 150–890). Never shrink it to make room for words.
- **Coordinates.** x = depth (the front face is at x = W and faces the viewer's right), y = width (+y goes to the viewer's left), z = up, ground at z = 0. You see the front (+x, lit), the left side (+y, in shade) and the top. The view and the light never change.
- **Draw back to front, in this order** (there is no depth buffer; D draws in call order):
  1. `D.board(…)` if the object sits on a table or counter (a little bigger than its footprint; floor machines stand on the paper), then every cast shadow `D.shadow(outline, z0)` (on the board it stops at the board's edge by itself).
  2. What is seen through an opening, inside `D.clip(openingPoints, () => …)`: back wall, then floor and sides, then contents, sorted with `D.sort` (larger x + y + z later). A point (x, y, z) inside shows on the front plane x = W at (y + (W − x), z + (W − x)): place contents with that sum so they land inside the opening.
  3. The reveals of the opening (its thin side walls), then `D.glass(…)` over it.
  4. Parts behind the body (a spout on the far side), the body (`D.extrude` for rounded machines, `D.loft` between rings for round ones, `D.box` for blocks), then what is mounted on it (buttons, dials with `D.cylX`, `D.lamp`, `D.text`), then what stands in front of it (a handle, a cup, the hand-off tray).
  5. Each part's silhouette `D.hullInk` right after that part (a pot and its saucer get one each), and `D.tag` labels last (they draw on top by themselves).
- **The look comes from the kit; keep it.** Bodies in one material (`'mustard' 'tomato' 'mint' 'cobalt' 'blush'`), fittings in `'metal' 'ceramic' 'dark' 'rubber'`, glass in `'clear'`, boards in `'board'` or `'wood'`, any other colour with a hex. One body colour per object; a set (a coffee maker and its cup) may use two. Accents are small and few: a status `D.lamp` (green ready, red heating), a screen (`'#1d2a26'` with `'#8af0ae'` text), water `'#4f9fdc'`. Mustard on a body only if the object really is yellow; mustard is otherwise the colour of "working right now" (the lit tag, the pressed step).
- **Shapes that look right.** Picture the real object first and write its proportions and joints in a comment (a gooseneck leaves low and rises to lid height; a handle meets the body at two points). Thin things stay thin (rods, arms, handles, spouts: `D.rod` with r 1–3), attached parts touch their body at both ends, nothing floats. Neat over busy: 8–18 repeated lines at most (vents, grille bars, slats), every detail big enough to read at full frame. Convex profiles only in `D.extrude`/`D.loft`: split an L or a C into pieces. A tall part on a thin support casts a shadow that touches its base: include the top of the support in the head's shadow points. See-through parts cast a lighter shadow (`D.shadow(pts, z0, clip, 0.45)`).
- **Liquids and streams.** A liquid inside is drawn inside its container's `D.clip`, level (horizontal) even when the container tilts, and only visible near the rim or through a window. A pour is `D.stream(from, to)`: split it at the rim, the part inside goes in the container's clip. Powder and beans are `dash: true`; steam rises (to above from).
- **Words.** Parts are named with `D.tag(point, dx, dy, 'HEATER', on)`: a cream pill on a leader line, aimed outward into empty paper, 3–5 per page, one or two words (capitals in English, 2–4 characters in Chinese); a pill never covers the object, another pill or anything moving. Print the object's own text with `D.text` on its face (a brand, a dial scale, "25¢"), ≥ 2 units high, only on a face that looks at the viewer. No `P.text` sentences on the figure; at most one short `P.text` line on a page, away from the object.
- **The controls.** `P.steps([...])` is the left column of pill buttons, one per real step in the order a person does them, pressed on the word (`press: [P.cw(0, 'fill'), …]`). The same steps on every page of one process; a page about another process gets its own. `P.stat(1780, 200, 'TEMP', lt => v, { unit: '°C' })` (top right, at most 2) shows a measured quantity: credit, litres, °C, seconds left; it reads the same variable that moves the drawing (`const v = lt => …`, used by both). `P.note(x, y, 'tank empty — fill it first')` is what the machine says back (a wrong order, a click, a done).
- **The title** is `P.title(str)`: a tomato dot and the title typed in mono, top left. Under 14 characters in Chinese, 7 words in English.

### The kit (already registered — call directly)
- `P.figure(o, draw)` → F (`F.pt(x, y, z)` gives page px for `P.push`, `P.note`). Two objects to compare: two figures with two `box`es side by side (`[150, 170, 800, 700]` and `[970, 170, 800, 700]`).
- Inside draw: `D.board` `D.shadow` `D.boardTop` · bodies `D.extrude` `D.loft` `D.box` `D.cyl` `D.cylX` `D.rod` `D.ball` · flat `D.shape` `D.fill` `D.line` `D.ink` `D.hullInk` · `D.clip` `D.glass` `D.sort` · `D.text` `D.tag` `D.lamp` · `D.tube` (cords, hoses) `D.stream` (pours, steam) · time `D.part` `D.k` · profiles `D.rr(u0, v0, u1, v1, r)` `D.rect` `D.ell(cu, cv, ru, rv)` `D.arc` mapped to 3D by `D.on(D.PX(x) | D.PY(y) | D.PZ(z), uv)` (PX: u = y, v = z; PZ: u = x, v = y) · `D.mat('#hex')`, `D.tone(normal, mat)` for a face of your own.
- A moving part is drawn from its pose at time lt: compute the angle or offset with `D.k(at, dur)` and build its points from it (a door turning about its hinge, a lever, bread rising, a drum turning).

### Layouts that work (vary them; never the same twice in a row)
1. **The whole object**: the figure at rest, its parts inking in as they are named, steps all unpressed. The film's first page.
2. **Doing one step**: the step pressed, the part moving, its tag lit, the stat changing.
3. **Inside**: a door open or a window, `D.clip` showing the mechanism or contents (the drum, the heating element, the coil, the wheel that carries one gumball).
4. **The out-of-order press**: a later step pressed first, the machine refuses or does the missing step (`P.note`, a red lamp), then it is done properly.
5. **Close-up**: the figure's `size` cut down to one assembly (the thermostat, the slot and the wheel), big.

## Motion and camera

- **The object inks itself in.** The figure draws its lines on in the first second, then the colour floods in; a part named later arrives the same way with `D.part(P.cw(i, 'word') - 0.3, () => …)`. Something put in drops into place (`from: 'drop'`: a slice, a cup, a coin), something used up fades out (`out`).
- **Buttons drive the machine.** A step's pill is pressed on its word; at that moment the part it controls starts moving (`D.k(pressTime, dur)`), its tag lights (`on: [start, end]`), its lamp turns on, its stat starts counting. Nothing moves that no step started. Moves are eased, mostly 0.4–2 s; a process that takes minutes is compressed and the stat says the real number.
- **Follow the real process.** Before drawing, write the real sequence as a comment: each step and where every material is after it (water in the jug → in the kettle → boiling → steam on the bimetal disc). Things move only along their real path, and every supply has a visible source (a tap, a jug, a bag, a hand with a coin). No container is skipped.
- **The machine keeps running.** Between steps the working part keeps working (the drum turns, bubbles rise, steam drifts, the lamp stays on): a held frame is never frozen while a step runs.

| Camera move | What it says | When |
|---|---|---|
| Wide (default) | the whole object and its controls | most of every page |
| push: `P.cam([P.push(at, ...F.pt(x, y, z), 1.2–1.35), P.back(at2)])` | "look at this part" | the moment the part that decides it works (the disc snaps, the ball drops) |
| back: `P.back(at2)` in the same `P.cam` list | back to the whole | after the push, before the next step |

At most two pushes per page, never a slow drift; the steps, stat and title stay put (they are on the HUD). A push keeps the whole object below y 190 on screen (the title band fades whatever rises into it): push on a point in the object's lower half, s 1.15–1.25.

## Pacing

- Within the first second the object is inking in and the step pills are on screen.
- 10–18 s per page; a new pressed step, moving part, lit tag or changing number every 2–4 s.
- End on the job done: the last step lit, the result visible on or beside the object (the cup full, the ball in the tray, the toast up), the stat at its final reading. Never on a centred quote card.

## Not this

- **Not Isometric** (`isometric`): no floating plate, no grid world of many small blocks joined by belts and roads; one object, big, hand-inked with a heavy outline on warm paper.
- **Not Mechanism** (`instrument`): no paper-white solids in graphite hairline, no numbered legend, no workshop machinery; colourful household objects with cream pill labels on leader lines and buttons that get pressed.
- **Not 3D Exploded View** (`exploded`): no lit photographic render and no parts flying apart along an axis; flat three-tone colour, and the inside is seen through doors, windows and cut openings.
- **Not Crayon Picture Book** (`crayon`): no characters with faces, no crayon texture; the object is the hero and its lines are inked.

## Never

- Slide habits: bullet lists, text boxes, arrows between labelled boxes, icons standing in for the object. The object is always drawn.
- A small object in a big empty frame, a `size` padded "to be safe", a board much bigger than what stands on it.
- More than one heavy outline per part, dark edge strips along silhouettes, one `D.hullInk` over two separate parts (it draws false straight lines across the gap), ink of a far part crossing a nearer part (draw the far one completely first).
- A shadow detached from its object, two shadows for one thing, a shadow falling off the board.
- Contents drawn outside their opening's clip, a liquid that tilts with its container, a stream drawn over the near wall of what it pours into.
- Mustard used as decoration; more than one tag lit at a time unless two parts truly work together; tags covering the object or each other.
- Things that appear with no source, steps that do nothing visible, a machine that moves before its step is pressed.
- Emoji or symbols in `D.text`/`D.tag` (they render as blobs); text printed on a face turned away from the viewer.
- Glows, particle bursts, perspective, turning the object round or moving the light: one view, one light.
