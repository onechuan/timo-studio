# Instrument · grammar card

Reference: technical cutaway figures of real machines (the engine, gearbox and brake plates of workshop manuals and engineering textbooks, instrument catalogues), drawn as crisp isometric solids in paper white and graphite hairline with one part lit, on a numbered figure card with a legend and a live readout. Suits how a real machine works: car engines, gearboxes, differentials, brakes, steering, pumps, compressors, locks, bicycles, sewing machines, printers, turbines, household appliances, anything with moving parts.

## In one sentence

The real machine stands on a bench, cut open so its working shows: its parts settle into place as they are named, the mechanism runs on the verb (pistons rise, gears mesh, fluid flows), one part is lit in orange while it matters, and the needle, the readout and the big number all read the same variable that moves the parts.

## Picture

- **The machine is the subject, drawn as it really is.** The film is about a real machine, and every page draws that machine (or one of its assemblies) with its real parts in their real places, recognisable at a glance: an engine has a block, cylinders, pistons on a crankshaft, a timing belt, a spark; a disc brake has a pedal, a master cylinder, a brake line, a caliper and a drilled disc. Cut it open (`S.crank` draws cylinders cut away, a `S.block` can be left out) so the moving parts inside show. Never replace a real machine with an analogy or with boxes. The director lists, for the whole film, the machine's assemblies and which page shows which; pages show the machine whole, one assembly of it, the same assembly in another state, or a push in on the part that decides it.
- **Real numbers.** Real ratios, pressures, speeds and counts (4 cylinders, 2 crank turns per cycle, 3.5 : 1 final drive, 80 bar line pressure); the motion obeys them (the cam pulley turns at half the crank's speed; meshing gears turn opposite ways at the inverse ratio of their teeth).
- **One bench per page.** `const S = P.bench({ azimuth })`, then `const z = S.base(x, y, w, d).z` and every other part stands on that `z` (or on the `.z` of the part below it). The bench fits itself into the card: never place it with pixel maths. World units are millimetres of the real object; a machine is 160–260 across. Two benches (`box: [150, 176, 780, 630]` and `box: [990, 176, 780, 630]`) compare two machines or before / after. **The machine is big**: it fills most of the card. A `P.value` takes a narrow right margin (`box: [150, 176, 1300, 630]`, the value at x ≥ 1480); never shrink the machine to make room for type.
- **Dense, real parts.** A page's machine has **at least 12 parts**, each sitting on another part: base, structure (blocks, posts, rails, cases), mechanism (pins, springs, gears, carriages, drawers, turntables), readers (a dial, a ruler, a screen, dots) and fittings (plates, knobs with `knurl`, wires that end on parts). Bare corners get a ruler, a label plate, a knob or a screen. Scale carries meaning: the bigger drawer holds more bytes, the taller pin is the larger value.
- **Colour has one job each.** Paper white solids, grey facing shades, graphite lines. **Orange** is the part to watch: `lit` on exactly one part at a time (`handle.lit(at, until)` hands it on), the dial needle, the moving ball, the matching dots. **Blue** only for what flows (a `wire`'s colour, a `blue` signal). Green / red only for a match / a fault. Everything else is graphite.
- **No words inside the drawing.** Parts are named the way a figure does it: `S.key(n, [x, y, z], 'Pins · inputs')` puts a numbered dot on the part and the same number with its name in the legend along the card's bottom edge (at most 5). The machine's name goes top right with `P.caption('PIN-TUMBLER LOCK · 5 PINS')`. Text the machine itself displays goes on an `S.screen` on one of its faces, and one short engraved word may go on an `S.plate`. No `P.text` sentences, no arrows, no leader lines, no labels floating in the air.
- **Numbers are readings.** Make the page's model once: `const v = P.track([[P.c(1), 3], [P.cw(2, '5'), 5]])`. Pass `v` to everything it drives (a needle's `value`, a pin's `height`, a drawer's `open`, a gear's `angle`) **and** to `P.readout(v, { label, unit })` (bottom right, every page) and, when the number is the claim, to `P.value(x, y, v, { unit, label })`, a big figure in the margin beside the machine. The reading and the drawing can never disagree. `P.phase([[t, 'ARMING'], [t2, 'TURNING']])` names what the machine is doing, bottom right, before the readout.
- **The title** is `P.title(str)`: it prints "FIG nn" in orange and the title in graphite, top left. Keep it under 16 characters in Chinese, 6 words in English.

### The kit (already registered — call directly)
- Scene: `P.bench(o)` → S · `S.base` · `S.block` · `S.cyl` (any axis; `knurl`, `bands`, `pointer`, `hole`, `holes`: a drilled disc, a flywheel) · `S.rail` · `S.ruler` · `S.plate`.
- Mechanisms: `S.crank` (crank, connecting rod, piston in a cut-open cylinder) · `S.gear` (spur gears that mesh, flat or standing on a shaft: `axis: 'x'`) · `S.belt` (a belt or chain over two pulleys) · `S.pipe` (fluid lines; `flow` in blue) · `S.spring` · `S.pins` · `S.drawer` · `S.turntable` · `S.ball` (something travelling a route) · `S.wire` (with a `pulse`) · `S.glow` (combustion, a spark, heat: the one glow allowed).
- Readers: `S.dial` (needle) · `S.dots` (cells set) · `S.screen` (what the machine shows) · `P.readout` · `P.value` · `P.phase`.
- Naming and camera: `S.key` · `P.caption` · `S.view`. Every part takes `at`, `out`, `move: lt => [dx, dy, dz]`, `lit`, and `front` / `back` to fix the paint order of a long part.

### Layouts that work (vary them; never the same twice in a row)
1. **The whole machine**: one bench, the machine at rest, its assemblies settling in as they are named; readout at its starting value. The film's first page.
2. **Cutaway running**: the machine cut open and running through its cycle once (intake → compression → power → exhaust; pedal → pressure → clamp), one part lit per step, `P.phase` naming the step.
3. **One assembly**: a single assembly big on the bench (the crank and one piston, the planetary set, the caliper on its disc), its parts named with `S.key`.
4. **Detail**: `S.view` pushes in on the part that decides it (the spark over the piston, the pads on the disc, the spider gears), with `P.value` beside it.
5. **Two states**: two benches side by side (straight / cornering, released / pressed, low gear / high gear), the same reading on both with different values.
6. **Payoff**: the whole machine running, every assembly named in the legend, the readout at its final value held for a second.

## Motion and camera

- **Assembly on the beat.** The base is there at 0 s; structure settles in within the first second; each mechanism part arrives (`at`) on the word that names it, settling down from just above with no bounce. Parts never pop in; they never leave unless the narration removes them (`out`).
- **The machine runs on the verb.** Motion comes from the page's `P.track` variable: it settles to each new value on its cue (`P.cw(i, 'word') - 0.3`), and everything that reads it moves with it. Between cues the machine is still, except what runs continuously in the idea (a turning gear, a pulse on a wire, a ball rolling).
- **The signature:** the cutaway runs. The parts settle into place, then the machine runs through its cycle with every linked part moving together at its real ratio (the crank turns, the pistons rise and fall, the belt runs, fluid flows), and the needle and the readout land on the number as it is spoken. The decisive part is lit the moment it acts (`handle.lit(t)`), and hands the light on when the next part takes over.
- **Camera, inside the figure only** (`S.view`); the card never moves:

| Move | What it says | When |
|---|---|---|
| `S.view([{ at, focus: [x, y, z], zoom: 1.6–2 }])` | "look at this part" | the part that decides the idea, once it acts |
| `{ at, zoom: 1 }` | "back to the whole machine" | after the detail has made its point |

At most two pushes per page; never a slow drift.

## Pacing

- Within the first second the base and the structure are on the card; never an empty card waiting.
- 10–16 s per page; a new part, motion, lit hand-off or reading every 1.5–3 s.
- End the film on the whole machine at rest, every part named, the readout showing the answer, held 1–2 s.

## Not this

- **Not Blueprint** (`blueprint`): no white line drawing on blue, no dimension lines or balloons; the parts are shaded paper-white solids in isometric, running, with a live readout.
- **Not Isometric** (`isometric`): no pastel tinted worlds, towns, trucks, people or label cards on leader lines; one graphite instrument on a bench, paper white with a single orange part.
- **Not 3D Exploded View** (`exploded`): no photographic render, no studio sweep, no materials or reflections; a drafted figure with hairline outlines and flat facing tones.
- **Not Tech Dark** (`tech-dark`): no dark screens, glowing code or HUD panels; the page is a white figure card.

## Never

- An analogy or a diagram in place of the real machine; boxes, arrows and labels standing for parts; one big slab with a few lines on it. A part is drawn as what it is (a piston, a gear, a disc, a pipe), with its real shape and place.
- Motion that breaks the mechanism: gears that mesh but turn the same way, a piston that moves without its crank turning, a belt that runs while its pulleys stand still.
- Parts floating in the air: everything stands on the base or on another part (`z` from the part below).
- More than one lit part at a time; orange on decoration; a second accent colour; tinted solids.
- Words in the drawing other than an `S.screen`, one `S.plate` word and the numbered `S.key` dots; sentences on the card; `P.text` paragraphs.
- A number on screen that is not read from the same `P.track` the parts move with; a readout that disagrees with the needle.
- A wire crossing the subject's face or ending in the air: wires run along the structure and end on a part.
- Anything outside the card or in the bottom row of the card (y > 820) apart from the kit's own legend and readout; `P.value` sits beside the machine, never over it.
- A different machine on every page (show assemblies of the one machine instead).
- More than one `S.glow` at a time, or a glow anywhere but where the machine really makes light or heat.
