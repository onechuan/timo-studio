# Blueprint · grammar card

Reference: cyanotype engineering drawings and patent sheets — a mechanical drawing, a cutaway, an assembly sheet — set in motion like a drafting time-lapse. The drawing is the picture: the thing being explained is drafted in white line on blue, measured, cut open and taken apart while the narration explains it.

## In one sentence

An engineer explains how something works by drafting it in front of you: every line is pulled at an even pen speed, the key size gets a dimension that counts up as it is drawn, the assembly slides apart into numbered parts on the beat, and a red pencil circles the one thing that matters.

## Picture

- **Cyanotype sheet.** Deep Prussian-blue ground with a fine 24px grid and heavier 120px lines, a drawing border with zone marks. White (`ink`) line for everything that is drawn. Never a white or light ground.
- **Line weights carry the meaning**, like a real drawing: the object's visible outline is thick (`P.draft`, default 3.2px); hidden edges dashed (`line: 'hidden'`); axes and symmetry dash-dot (`line: 'center'`, `color: 'soft'`); dimensions and leaders thin. Three or four weights on every sheet — that contrast is what makes it look engineered.
- **Colour has jobs, not decoration.** `ink` white = the drawing. `yellow` = THE key dimension or number of the page (one per page). `red` = the red pencil: the failure point, the mistake, the answer (`P.pencil`). `blue` (cyan) = something flowing through the drawing (`P.flow`: water, current, air, data). `soft`/`muted` = construction lines, past states. Fills are translucent blue tints (`inkF`) that fade in after an outline; `hatch: true` marks a section cut.
- **Draw the object, big.** The subject is a recognisable object or system drawn as an engineering drawing — a machine, a device, a building section, a circuit, a process laid out as a plant — spanning most of the content area (x 140–1780, y 180–880). Build it from `PV.BP` shapes (below). One main drawing per screen, plus its dimensions, balloons and labels around it. A small drawing floating in empty blue is the most common failure; the second is a drawing that stops at mid-height — **the drawing (or its dimensions, a section below it, a ground line with a label) reaches down to y 800–860 on every settled frame**, and its width spans at least 1100px.
- **Technical lettering.** Labels are mono caps (`P.label`, ≥ 26px): part names, units, "SECTION A–A", "SCALE 1:20", "FIG. 2". Headings are a few words lettered along guide lines (`P.word`). Chinese labels are fine in `P.label`/`P.word`; keep each to a few characters. No paragraphs.
- **Numbers are measurements.** A size, a distance, a duration, a ratio is a `P.dim` (it counts up as its line draws) or one huge traced `P.outline` number. Not a chart card.
- **The title block.** `P.title` already draws the sheet's title block (sheet number + title) top left: keep page titles short.

### Shapes: `PV.BP` (each returns an SVG path d for `P.draft`)
`PV.BP.rect(x, y, w, h, r)` (r < 0 = chamfer) · `circle(cx, cy, r)` · `arc(cx, cy, r, a0, a1)` (degrees) · `poly([[x, y], …], closed)` · `slot(x, y, w, h)` · `gear(cx, cy, r, teeth, depth, hole)` · `spring(x1, y1, x2, y2, coils, amp)` · `bolt(cx, cy, w, len)`. Combine strings (`PV.BP.circle(…) + PV.BP.rect(…)`) or pass an array to `P.draft` to draft them in order. Raw SVG path strings (`M… L… Q… A…`) work too — draw pipes, housings, silhouettes, building sections, circuit traces with them.

### The kit (already registered — call directly)
- `P.draft(d, o)` — the signature: any outline drafted at constant pen speed. `fill: 'inkF'` tints it after, `hatch: true` cuts it in section, `line: 'hidden' | 'center'`, `move: lt => ({ rot, cx, cy, dx, dy })` turns or slides it (gears turning, a piston moving, a valve opening).
- `P.dim(x1, y1, x2, y2, o)` — a dimension between two points; `value` + `unit` counts up, or `text`; `color: 'yellow'` for the page's key number; `off` places the line beside the object.
- `P.callout(x, y, n, o)` — a numbered balloon on a part with its name (`text`). Number parts in the order the narration names them.
- `P.explode(parts, o)` — an assembly drafted, then slid apart on the beat with balloons: the move that shows "what it is made of". Once or twice per film.
- `P.outline(str, x, y, o)` — a huge hollow number or word traced by the pen, then tinted: the page's big moment (a ratio "1:3", "×10", "92%").
- `P.pencil(shape, o)` — red pencil: `ring`, `strike`, `arrow`, `under`, `cross`, with a handwritten `note`. The answer, the failure point, the correction.
- `P.flow(d, o)` — cyan dashes moving along a path: what goes through the machine.
- `P.label(x, y, str, o)` — technical mono caps lettering that types on. `P.word(x, y, str, o)` — a lettered heading on guide lines.

### Layouts that work (vary them; never two pages alike in a row)
1. **Elevation + dimensions**: the object drawn large in the left two-thirds, two or three dimensions around it, one yellow; a `P.outline` number or a `P.word` in the right third.
2. **Exploded view**: an assembly along a centre line across the whole width, parts sliding apart with balloons 1–5; a red pencil ring on the part that matters.
3. **Section cut**: the object cut open (`hatch: true` on the cut walls), something flowing through it (`P.flow`), the critical point circled in red.
4. **Before / after sheet**: two drawings side by side on one centre line ("A" and "B" labels), the difference dimensioned in yellow.
5. **Process plant**: the steps as machines/boxes connected by pipes or conveyors (`P.draft` paths), `P.flow` running through them, each station numbered with `P.callout`.
6. **Detail view**: a circle drawn around part of the main drawing (`line: 'phantom'`), then `P.cam` pushes in to it and the detail is drafted bigger beside it ("DETAIL A, 4:1").

## Motion and camera

- **The pen never eases.** Lines are drafted at an even speed, one after another, in the order an engineer would draw them: centre lines first, then the main outline, then details, then dimensions, then labels. Most of the screen time is drawing.
- **On the beat.** The object the narration names is drafted as it is named (`at: P.cw(i, 'word', -0.2)`); a dimension draws as its number is spoken (`at: P.cw(i, '50', -0.6)`); the explode happens on the verb ("拆开", "take apart").
- **Mechanisms move.** If the thing turns, slides, opens or flows, show it with `move` or `P.flow` once it is drawn — a static drawing of a machine is half the story.
- **Camera mostly still**, like a drawing board. A `P.push` into a detail view, a `P.pan` along a long assembly; no shakes, no drifts.

## Pacing

- Something is drafted the instant the page turns in: start each page with a centre line or the first outline at `at` 0–0.1 s.
- A new line, dimension, balloon or move every 1–2 seconds.
- End the film on the finished, fully dimensioned drawing with the red pencil's answer, held for a second.

## Checks

- A page that is mostly a drawing with labels is right; fix overlaps between labels, balloons and lines (move a balloon with `bx`/`by`, a dimension with `off`).
- Keep everything inside x 140–1780 and above y 880 (the subtitles); balloons and their notes too.
- The engine's check may call a page "text-dominated" only if you wrote sentences — replace them with a drawing.

## Never

- Rounded cards, icons, emoji, stock clipart, cartoon faces, gradients, glows, drop shadows.
- Paragraphs or bullet lists; slide layouts (title + three boxes + arrows).
- Hand-drawn wobble on the drawing itself (only the red pencil is freehand).
- More than one yellow number per page; red used as decoration instead of meaning.
- A tiny drawing in the middle of empty blue.
