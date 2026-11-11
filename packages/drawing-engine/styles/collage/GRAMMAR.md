# Collage · grammar card

Reference: the investigative paper-collage explainer (Vox, Johnny Harris, Missing Chapter): the argument laid out on a desk of real-looking evidence — newspaper cuttings, halftone archive prints, maps, documents, index cards — that a reporter's eye moves across, circling and highlighting as the narration speaks. Techniques adapted from huashu-art-motion (MIT).

## In one sentence

Every claim gets a piece of evidence on the desk, and the narration points at it: a headline is highlighted, a number circled in red marker, two facts tied together with red thread, a verdict stamped. It should feel like a documentary editor's desk, deliberately not perfect, never like a slide.

## Picture

- **The desk is always full.** Start every page with `P.desk({ seed })` (a different seed per page): faded scraps of newsprint, maps, graph paper and prints half off the edges. Then lay the page's real evidence over the middle, big: the main piece takes 50–70% of the frame, and together the pieces cover most of x 140–1780, y 180–880. A lone small card on a bare table is a failure.
- **Evidence, not boxes.** Every idea becomes a physical piece of paper, made with the kit:
  - `P.clipping` — a torn newspaper cutting (kicker, big serif headline, 2–4 body lines you write in period voice). The default way to state a fact, a date or a claim.
  - `P.photo` — a halftone print with a white border and tape. You paint the picture in plain shapes and greys with canvas 2D (`draw(g, w, h)`: silhouettes of people, machines, buildings, objects, a typewriter, a factory, a crowd); the kit turns it into a dot screen. Use gradients and 3–5 grey values so the dots have depth. `duo: 'red'` prints it in red for emphasis.
  - `P.paper` — a torn sheet you draw on through its `L` (`L.text`, `L.path`, `L.line`, `L.rect`, `L.circle`, `L.bars`…): maps, patent drawings, diagrams, a chart on graph paper ('white'), an old document ('old'), a kraft folder ('kraft'). `tone: 'black'` is the dark board for the one big statement of a section (write on it in `color: 'paper'`, 110–160px).
  - `P.note` — a lined index card with typed lines: the takeaway, a list of 2–4 points, a quote.
  - `P.label` — the black torn label strip with bold white type: names, dates, places, the key number ("1873 · REMINGTON", "500 DEAD"). Put one on or next to most pieces.
- **Layering.** Kit pieces stack in call order. Anything drawn with plain `P.*` (P.text, P.liveRough, P.path, P.canvas) lies above every kit piece — so draw what belongs printed on a sheet (a patent drawing, a map, a chart) through that sheet's `L`, never with plain `P.*`, or it floats over everything placed later.
- **Marks are the motion.** Call them after the paper they mark (later calls lie on top):
  - `clip.hl(i, at)` / `P.highlight` — yellow highlighter sweeping across the exact words being spoken.
  - `clip.ring(i, at)` / `P.scribble` — red marker loop around a word, number or face.
  - `clip.under(i, at)` / `P.redline` — red underline, strike-through (two crossing redlines = "wrong"/"removed"), or a pointer with `arrow: true`.
  - `P.string` — red thread pinned between two pieces: cause and effect, before and after, who connects to what.
  - `P.rubber` — a rubber stamp for a verdict or a date ("PATENTED", "REJECTED", "1878", "MYTH").
- **Palette: ink, paper, one red, one yellow.** Red is only the marker, thread, stamps and red labels; yellow is only the highlighter. `blue`/`orange`/`green` are archive inks for a map or a second data series, used sparingly. No gradients, no glow, no colour backgrounds.
- **Type.** Headlines are the big serif (`weight: 800`, add `cls: 'head'` to P.text for the tight headline cut); typed text (`font: 'mono'`) for captions, index cards and document fields; labels are the heavy sans. Body text at least 34px, labels at least 32px, headlines 72px and up.
- **Slightly crooked on purpose.** Pieces sit at −5°…+5°, overlap each other's paper edges a little, carry tape; marker loops overshoot. Never perfectly aligned grids. Overlap paper, never words: a later piece must not cover the text of an earlier one (plan the layout so each piece's text stays readable; 3–5 pieces per page is plenty).

## Motion and camera

- **Two frame rates.** The paper, marker, highlighter and thread move in 12 fps steps (the kit does this) — stop-motion on twos. The camera is smooth.
- **Entrances.** Archive items are simply there on a cut (`enter: 'cut'`) or slide in tilted and settle (`enter: 'slide'`, `from`); a big map or board can `drop` onto the desk. Stagger pieces to the narration: one piece per spoken fact, never everything at once.
- **Every cue gets an action** on the evidence: a highlight sweeping as the words are spoken (time it with `P.cw`), a circle landing on the number, a thread pulled to the next piece, a label typed on, a stamp slammed. One mark at a time, each about 0.5–0.9 s, then hold.
- **The camera is the reporter's eye.** Hold the wide desk, then `P.push` (1.2–1.35×) onto the line or face being discussed, `P.pan` along the thread to the next piece, `P.back` to show the whole desk again. Hold → quick move → hold; no slow drifts, no shakes.

## Pacing

- Within the first 3 seconds: a headline, a face or a date already on the desk.
- 8–14 seconds per page, a new mark or piece every 2–4 seconds.
- A page builds an investigation wall: by its end, several pieces tied by thread and marks; the section's conclusion lands on a black board or a stamp.
- End the film on the full desk with the opening question answered: the last thread pulled, the final stamp down.

## Never

- Empty desk, small floating cards, slide layouts (title + three equal boxes + arrows).
- Torn-paper page transitions, glitch effects, film burn, VHS noise, neon, glows, drop shadows heavier than the kit's.
- Generic icons or emoji standing in for evidence; draw the actual object as a halftone print instead.
- More than one marked thing at the same moment; red or yellow used as decoration.
- Long paragraphs on paper: at most 4 body lines per cutting, 4 lines per index card.
