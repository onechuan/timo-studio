# Isometric · grammar card

Reference: isometric explainer illustration as used by product, logistics and fintech brands — a tiny world built on a 30° grid, clean geometric blocks with three-tone faces, stations joined by belts, roads and pipes, little capsule people, a soft pastel palette with one saturated accent, white label cards on leader lines. The scene is a working model of a system, seen from above at an angle.

## In one sentence

Every page is a small working model of the idea on a floating white plate: the stations rise out of the ground on the beat, goods, money or data flow between them along roads, belts and pipes, and white label cards name each part the moment it is spoken.

## Picture

- **One scene per page, on a plate.** Start almost every page with `const S = P.iso({ unit, grid })` and build the whole picture inside it with S's methods. The plate is the stage and it should be big: unit 70–76 with grid 12×9 (defaults: unit 72, centre 960, 570). The plate's front tip may dip under the subtitle band — that is fine, it is only the plate's edge; a small plate floating in a big empty background is the most common failure. Put big numbers and label groups in the empty sky to the left and right of the plate. Never leave the plate mostly empty: **most cells hold something** — a building, a tile zone, a road, a tree, a person. Corners and edges get trees, small blocks, people, tiles, so the model looks lived in.
- **Things are solid blocks.** Buildings, machines, servers, shops, warehouses, steps of a process, stacks of money are `S.block(x, y, w, d, h, o)` — three-tone faces come free (top light, left mid, right dark). Give them life with `windows`, `door`, `screen`, `stripe` (a brand colour band). Tanks, databases, silos and coin stacks are `S.cyl`. A building's height carries meaning: the big player is the tall block.
- **Places are tiles.** `S.tile` marks a zone on the ground (a market, a department, a phase): pale tints under groups of blocks so the plate reads as districts.
- **Connections are drawn on the ground.** Roads and routes are `S.path` (wide, `color: 'faint'`, `arrow: false` for a road; narrow with an arrow for a step or a payment), conveyor belts are `S.belt`, overhead cables and pipes are `S.pipe`. A scene without connections is a city, not a system: every page shows at least one route between stations.
- **Something always flows.** `S.flow` sends goods along a route on loop: parcels (`kind: 'box'`), coins, documents, data balls, walking people, driving trucks (`kind: 'truck'`, they turn to face the road). This is the style's signature: the model is running. Use `once: true` for the one item the narration follows from A to B.
- **Colour: pastel things, one accent.** Blocks are white or a soft tint (`'white'`, `'lilac'`, `'sky'`, `'mint'`, `'peach'`, `'butter'`, `'rose'`, `'slate'`; palette names work too). **Orange is the accent**: the product, the money, the parcel, the thing the narration is about — one kind of thing per scene in orange, never decoration. Blue = information, purple = the company/platform, green = growth, red = a loss or a bottleneck.
- **Words are white label cards.** Name parts with `S.label(x, y, z, text, o)` (z = the top of the thing it names) — a card with a coloured diamond and a leader line; `sub` adds a small mono line (an English echo, a number, a unit). Keep labels inside the content area (y ≥ 200): lower `dy` or move the label aside (`dx`) when the thing is tall. **At most 4 labels on screen at once**: when the narration moves on, give the earlier labels `out` so the new ones have room; labels never overlap each other or a key number. A key number is `P.isonum`, big and counting, placed in empty sky beside the plate or above a block. At most one short line of `P.text` per page; no paragraphs, no boxes of text.
- **Data as blocks.** Comparisons are `S.bars` — an isometric bar chart standing on the plate, the one that matters in orange, with `S.label`s or `P.isonum` on the returned tops. Shares are tiles divided by area.

## The kit (already registered — call directly)
- `P.iso(o)` → S. `S.pt(x, y, z)` gives page px of a grid point (for `P.isonum`, `P.isolabel`, camera targets).
- `S.block`, `S.tile`, `S.cyl`, `S.tree`, `S.person`, `S.truck`, `S.bars` — things. `S.path`, `S.belt`, `S.pipe` — connections. `S.flow` — movement. `S.label`, `P.isolabel`, `P.isonum` — words and numbers.
- Grid coordinates: x runs to the lower right, y to the lower left, z up; a block occupies [x, x+w] × [y, y+d]. Things are depth-sorted automatically, so call them in story order, not drawing order; just don't overlap two blocks in the same cells.
- For anything else, draw on a `P.canvas` with `PV.ISO.box / cyl / ball / poly(ctx, pt, …)` using `S.pt` as `pt`.

## Motion and camera

- **The world builds on the beat.** The plate fades up at the start; each station rises out of the ground (`at`: the moment it is named — `P.cw(i, 'word') - 0.3`), with a small overshoot. Use `enter: 'drop'` for something delivered from above (a new product, a parcel landing). Routes draw themselves from source to destination, then flow starts on them.
- **The model keeps running.** Once a route exists, items keep moving on it for the rest of the page; held frames are never frozen.
- **Change by adding, not by cutting.** A page grows one scene over its cues: start with one station, add the second, connect them, start the flow, then show the result (a number, a tall block, a full warehouse). For a "before/after", let blocks `out` and new ones rise in the same cells.
- **Camera pulses.** Wide by default; push in (`P.push`, 1.1–1.25×) on the station being explained, hold, back out (`P.back`). One push per page or two, never a constant drift.

## Pacing

- Within the first second the plate and the first station are on screen: never an empty plate waiting for its first block.
- 10–16 seconds per page; a new block, route, flow or label every 2–4 seconds.
- End on the whole model running: every station built, everything flowing, the result labelled. Never on a centred quote card.

## Never

- Perspective, sketchy outlines, handwriting, hatching, paper texture (other styles), or blocks drawn with outlines.
- Floating flat icons, slide-deck layouts of boxes and arrows on empty ground: everything stands on the plate.
- More than one accent colour, saturated blocks everywhere, dark heavy palettes. Grey-only scenes: every scene has the pastel tints and its one orange thing.
- A plate with a few tiny objects in the middle; labels that overlap each other or the page title.
- Faces on people: they are capsules with a head, never drawn features.
