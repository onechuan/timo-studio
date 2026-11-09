# 3D Exploded View · grammar card

Reference: product-launch keynote renders and industrial-design exploded views — the hardware reveal film where a device turns on a turntable, floats apart into its layers and clicks back; teardown and cutaway illustrations of engines, motors and batteries. Suits how things are built and how they work inside: devices, machines, engines, batteries, chips, locks, structures — anything explained by its parts.

## In one sentence

One real-looking object on a seamless studio sweep turns once on the turntable, comes apart along one axis into its layers with each part's label landing as the narration names it, the part that matters glows orange while the rest go glassy, and at the payoff everything clicks back together.

## Picture

- **One product per page, rendered.** Every page is built on exactly one `P.studio(…)` (or `P.reveal(…)`) — a three.js studio render with soft key and rim light, contact shadows, brushed metal, satin plastic and glass. The studio fits the product to the frame by itself; don't place it with pixel maths. The product (with its labels) fills most of x 170–1750, y 180–870.
- **Use the ready-made products when the subject is one of them**: `'phone'` (back, battery, board, frame, display, glass), `'motor'` (rearcap, housing, stator, rotor, frontcap), `'battery'` (a pouch cell: caseback, anode, separator, cathode, casefront), `'chip'` (board, balls, substrate, die, lid), `'turbofan'` (fan, compressor, combustor, turbine, nozzle, nacelle). Part names are labelled in the film's language automatically.
- **Otherwise build the object from parts** with `S.part(name, shape, { pos, rot, mat, … })` — 3 to 7 parts, each a real component, stacked or nested so that, assembled, they make one closed recognisable object. Units: the object is 2–4 across. Shapes: `slab` (rounded box), `panel` (an upright slab), `cyl`, `disc`, `tube`, `shell` (an open tray / case), `frame`, `coil`, `spring`, `gear`, `board` (circuit board with chips), `chip`, `die`, `cell` (a cylindrical battery), `screen`, `fan`, `rotor`, `screw`, `lens`, `sphere`, `cone`, `torus`, `pipe`, `balls`, `grid`, `fins`, `magnets`, `stator`. Give each part its `slot` (0, 1, 2… = its place along the explode axis) and choose `axis: 'x'` for long things (an engine, a pen, a drill), `'y'` for stacks (a chip, a floor plan, a lock cylinder), `'z'` for flat layers (a phone, a tablet, a panel).
- **Materials tell what a part is**: `aluminum` / `metal` (housings, shafts, frames), `dark` (steel, cores), `copper` (windings, foils, wires), `plastic` / `satin` (shells, covers; pass `color`), `glass` / `frosted` (covers, lenses, windows), `rubber` / `black` (seals, chips), `pcb`, `silicon`, `screen`, `heat` (something hot), `glow` (something live). At most two coloured plastics per product; everything else neutral.
- **Colour discipline.** Studio grey ground, graphite type. `orange` is the one signal: the highlighted part, the key number's rule, a hot tag — once per page. `blue` is what flows (`S.flow`: current, ions, air, fuel). Red and blue only for magnet poles or bad/good.
- **Labels are flat type on thin leader lines** (`S.label`, `S.labelAll`): a small index number, the part's name, an optional mono `sub` line (a spec: "12 SLOTS · COPPER", "3.7 V"). The studio lays them out in a row above/below or columns beside the product so they never overlap it, each other or the subtitles. Name every part the narration names; at most 6 labels on screen.
- **Type beside the product, not over it.** `P.headline(x, y, str)` (2–6 words, a keynote line) or `P.spec(x, y, value, { unit, caption })` (the page's key number, counting up as it is spoken) sit in the empty third the product leaves: pass the studio `box: [x, y, w, h]` to keep the product in the other two-thirds (e.g. `box: [700, 190, 1060, 680]` with the type at x 160–620), and `labelSide: 'right'` (or `'left'`) so labels stay away from the type. `P.tag(x, y, 'SECTION A–A')` for small mono marks. `P.title` draws the numbered page title top left: keep it short.

### The studio (`const S = P.studio(o)`; every method returns S, so chain them)
- Entrance: the studio fades in at `o.at`; `S.build(at, step)` drops parts into place one by one (building the object up).
- `S.turntable(at, { dur: 5 })` one slow full turn · `S.turn(at, deg)` a partial turn to show a side.
- `S.explode(at, { dur: 1.6 })` the parts float apart along the axis · `S.assemble(at)` they snap back with a click.
- `S.label(part, text?, { at, sub, side })` / `S.labelAll(at, step)` — labels draw their leader line, then the name rises in.
- `S.highlight(part, at, { until })` the part glows orange and the others go glassy · `S.ghost(part, at)` makes one part glassy (see what is behind it).
- `S.section(at, { cut: 'quarter' | 'half', parts, until })` — the cutaway: a quarter of the object is sliced away and the cut faces show flat in each part's own colour, revealing the inside without taking it apart. Combine it with `S.highlight` on the inner part that matters.
- `S.spin(part, { at, speed })` a rotor, fan or gear keeps turning · `S.move(part, lt => ({ x, y, z, rx, ry, rz }))` a piston, a key, a latch moves · `S.flow(from, to, { at, color })` particles stream between two parts (or two [x, y, z] points).
- Camera: `S.focus(part, at, { zoom: 1.9 })` pushes in on one part · `S.dolly(at, zoom)` a slow dolly · `S.camera([{ at, zoom, pitch, focus: null }])` for several moves (focus null = back to the whole).
- `P.reveal(model, { explode, labels, highlight, assemble, spin, flow })` does the whole signature on a ready-made product in one call.

### Layouts that work (vary them; never the same two in a row)

A film about one product still needs different pictures: at most 3 pages show the whole product at the same distance. The other pages show a sub-assembly built from parts (one stator tooth and its coil, a magnet pair, a single cell), the product in its context built from parts (the motor on an axle between two wheels), or a push-in on one part.
1. **Hero turn**: the assembled product alone, big, turning once on the turntable; one `P.headline` in the free third. The film's first page.
2. **Exploded view**: the product comes apart on the verb, 4–6 labels land on their names, one part highlighted at the point. The film's central page, used 2–3 times on different products or sub-assemblies.
3. **Cutaway**: `S.section` slices the object open while it is assembled; a flow runs through the inside; labels on the 2–3 inner parts.
4. **Detail push-in**: `S.focus` into one part (the die, the winding, the separator); a `P.spec` number beside it.
5. **Mechanism**: the assembled object working — `S.spin` / `S.move` / `S.flow` — with a `P.spec` or tags for the readings.
6. **Payoff**: everything clicks back together (`S.assemble`) on the conclusion and the product rests, with one `P.headline`.

## Motion and camera

- **Slow and weighted, like a launch film.** Moves take 1.2–2 s and ease in and out; nothing bounces except the assemble click. The product never stands dead still: the turntable or the camera keeps a slow drift.
- **The signature**: turn once (≈ 4–5 s) → explode on the verb ("拆开", "take apart", "inside") → each label lands as its part is named (`at: P.cw(i, 'stator', -0.2)`) → highlight the part that matters → `S.assemble` on the payoff line. Once per film, the full sequence; on other pages, parts of it.
- **Camera**: at most two moves per page (a `focus` push and a return, or one dolly). No shake, no spin of the camera itself — the product turns, the camera stays calm.

## Pacing

- The studio is visible from 0 s on every page (`at: 0`); the first move starts by 0.3 s.
- A visible change every 1.5–2.5 s: a turn, an explode, a label, a highlight, a section, a push.
- 8–14 s per page; 5–7 pages in a 60 s film. The film ends on the reassembled product at rest with one headline, held 1.5 s.

## Checks

- Labels name parts that exist (`S.parts` lists them; the ready-made products' names are listed above).
- Type you add with `P.headline` / `P.spec` / `P.tag` sits in the third the studio `box` leaves free, inside x 160–1760 and above y 870.
- One studio per page; a second product is a second page.

## Not this

- Not `blueprint`: no white line drawing on blue, no dimension lines or drafted outlines — this is a lit, shaded, photographic render.
- Not `isometric`: no flat-shaded isometric worlds, towns or dioramas of many small objects — one product, big, in perspective.
- Not `clay` or toy styles: no soft rounded cartoon blobs or bright toy colours — engineered parts in real materials.
- Not `tech-dark` / `neon`: no dark HUD screens, glowing grids or code — a bright studio sweep.

## Never

- Flat 2D drawings, icons, emoji, cards, bullet lists, charts drawn with `P.box` — the picture is always the rendered object.
- Toy blocks: a "product" made of one or two plain boxes; an object whose parts don't fit together when assembled.
- More than one studio per page, more than 7 parts, more than 6 labels at once, more than one orange highlight at a time.
- Saturated backgrounds, coloured lights, rainbow materials; more than two coloured plastics on one product.
- Text over the product, sentences on screen, labels you placed by hand with `P.text` (use `S.label`).
- Fast spins, camera shakes, whip pans; exploding and reassembling on every page.
- Anything in the subtitle band (y > 880) or off the stage.
