# One line · grammar card

Reference: continuous single-line drawing — Picasso's one-line animals, Saul Steinberg's line that walks off the page, the minimalist one-line prints of faces, hands and plants with one flat spot of colour behind them; set moving: the pen never lifts, and each picture unwinds into the next. Good for ideas and philosophy, psychology and feelings, relationships, creativity and habits, life lessons: abstract ideas that are best said as a metaphor.

**People in this style.** One-line people are part of the medium, so the general rule against faces is replaced by this one: people are drawn only with the kit's people subjects (`'profile'`, `'faces'`, `'walker'`, `'sitter'`, `'hand'`) or your own one-line contour — a profile edge (brow, nose, lips, chin) is allowed; eyes, eyebrows, pupils, ears, hair strands, fingernails and any line inside a face are not. Never a front-facing face. Set the storyboard's `cast` to the subjects, e.g. "a walker (one-line figure)".

## In one sentence

One unbroken line of fine black ink, led by a pen that never lifts, draws one metaphor at a time on warm paper; a single soft spot of colour sits behind it like a print, and each drawing unwinds into the next.

## Picture

- **One line on the paper.** At any moment the page holds one continuous line (at most two, while one hands over to the next). Everything is drawn by the kit; the line is always `ink`, width 3.4 (5 for a subject ≥ 1300 px).
  - `P.oneLine(subject, x, y, size, o)` — one subject, finished on its word (`done: P.cw(i, 'word')`). The library: hand profile faces heart bird tree house road key sprout flower mountain wave cat cup chair knot tangle ladder door walker sitter fish boat moon spiral balloon umbrella plane cloud leaf. For something not in it, pass your own control points (one path, 8–40 points, corners marked) — keep it as simple as the library.
  - `P.morph(a, b, o)` — **the signature**: the drawing on the paper becomes the next one (`'unwind'` by default; `'melt'` when b is a change of state of a; `'straighten'` when the idea is "untangle", "simplify", "get clear"). Always pass `replaces:` the handle it takes over.
  - `P.lineStory(steps, o)` — a page that is one stroke: 2–4 subjects (and at most one cursive word) linked by the thread, laid out left to right in reading order (each subject begins at its left and ends at its right). `trail` (3–5 s) makes the past wind away behind the pen: "it passes", "habits", "memory".
  - `P.held(subject, x, y, size)` — the previous page's last drawing, already on the paper at the page's start.
  - `P.horizon(y, o)` — the ground or the sea of a wide scene, edge to edge.
  - `P.thread(pts, o)` — a horizon, a path, the rise and fall of a feeling, the line between two drawings.
  - `P.cursive(word, x, y, o)` — the line writes one latin word in connected script (≤ 12 letters, lower case), x-height 80–120, finished at least 0.8 s before the page's narration ends (`done ≤ P.endT - 0.8`); at most one per page, and in a Chinese film only for an English word that is spoken.
- **Scale: the line is big, the paper is empty.** The film is watched on a phone. The drawing that carries the idea is drawn at size 750–950 (its line spans at least 650 px tall, about 60 % of the content height y 180–880); a second drawing on the same page at 550–750; only a figure set against a wide scene (`walker`, `sitter` beside a `mountain` or a long horizon) may be 340–450. Never a page whose biggest drawing is under 600 px tall. At least one page per film is an extreme close-up: one subject at size 1300–2000 running off the frame (a profile, a hand). At least one is a wide: a small `walker` or `sitter` (340–450) beside a big `mountain` (size 900+), a winding `road` (900+, the walker beside it, never inside it), `wave` or a long `thread` horizon.
- **Bare paper, wide reach.** At least 55 % of the frame is empty paper, yet the page's parts reach across the content area (x 140–1780): the subject off-centre on one side (its centre at x 560–760 or 1160–1360), its caption or a second drawing on the other, a thread or horizon joining them. Never a grid or a row of equal things.
- **One spot of colour.** At most one `P.spot` per page, always behind the subject, offset so it overlaps a third to half of the line (a sun beside the peak, warmth behind the two faces), r 120–280. Pick one colour per meaning for the whole film and keep it: e.g. `red` terracotta = warmth, love; `blue` = calm, freedom; `yellow` = attention, a thought; `green` = growth. A page with no spot is fine; never a spot as decoration, never a second one, never colour inside the line or on the line.
- **Words are gallery captions.** Besides the title, at most one `P.caption` per page (line 1 ≤ 6 words / 10 汉字 at size 44–56, never under 34 px; line 2 ≤ 6 words / 12 汉字, at least 28 px), set beside the drawing on bare paper, 60–200 px from the line, never over it and never in a corner. Prefer the one word the page is about. Numbers are written in a caption ("10,000 hours"), never as a chart.
- **The title** is a thin serif line top left (`P.title`); keep content below y 170 and above y 880.
- Plain primitives (`P.text`, `P.line`, `P.path`) only when the kit cannot do it, and then in `ink`, thin, with no fill.

## Motion and camera

- **The pen draws everything.** A subject appears only by being drawn, at the pen's pace (~950 px a second), finishing on the word that names it; the pen lowers just before, rests on the paper while the line waits, and lifts away when the line is done. Nothing fades, slides or pops in except the spot (it swells in over ~1 s, a beat before its word) and the caption.
- **The line never breaks between pictures.** Every page after the first opens with the previous page's last drawing already on the paper, in the same place and size (`const h = P.held(...)`, then `P.morph(prev, next, { replaces: h, done: P.cw(0, '…') })`), and turns it into this page's first picture on its word: a hand opens into a bird, a heart melts into a knot, a tangle straightens into a road, a road becomes a horizon, a sprout grows into a tree. Within a page, a new picture is either a morph of the one on the paper or the next step of the same `lineStory`. Pick the pair for the metaphor ("letting go" → hand to bird), never for decoration.
- **Undrawing is a move.** `undraw` winds a line back into the pen: forgetting, losing, taking back words. Use it at most once a page.
- **Camera: a slow, quiet eye.**

  | Move | What it says | When |
  |---|---|---|
  | hold (default) | "watch the line" | almost always |
  | `P.push` to ≤ 1.2× on the pen's last drawing | "look closer" | the turn of the idea, once a page at most |
  | `P.pan` sideways to where the line goes next | "and then…" | a `lineStory` wider than the frame |
  | `P.back` | "the whole picture" | after a push, before the page ends |

  Never a slam or a shake.

## Pacing

- Anything written or drawn finishes at least 0.8 s before the page ends; nothing is still being written when the page turns.
- First 2 s of a page: the previous drawing is on the paper (or, on the first page, the pen is already drawing).
- 8–14 s a page, 1–3 drawings a page, a visible change every 3–4 s (a drawing finishes, a morph turns, the spot swells, a caption lands).
- The film ends on its last drawing, complete, the pen lifting away, and one caption: best when the last picture is the first one again (the line came full circle). Never on a text card.

## Not this

- **Not whiteboard** (`whiteboard`): no marker, no many separate strokes, no labels, arrows, boxes or diagrams; one fine line that never lifts.
- **Not ink wash** (`ink-wash`): no brush, no swelling and tapering, no wash or bloom, no five tones of ink; the line has one even width and one black.
- **Not crayon** (`crayon`): no coloured lines, no scribbled fills, no characters with dot eyes; colour is one flat spot behind, never inside the line.
- **Not watercolor** (`watercolor`): no washes over the drawing, no pencil underdrawing; the spot has one colour and one soft edge.

## Never

- Slide habits: bullet lists, cards, boxes, tables, charts, `P.icon`, `P.box`, `P.arrow`, `P.chip`, `P.code`, emoji, logos, a headline in the middle of the page.
- More than two lines on the paper; a drawing that just appears complete (except the one carried over from the previous page); two subjects drawn at once; a new drawing that is not linked to the one before it.
- Eyes, mouths drawn inside a face, front-facing faces, hair, shading, hatching, fills inside the line, coloured or grey lines, a second line width, glow, shadows.
- More than one spot of colour per page, a spot with nothing in front of it, a colour that means two things in one film.
- Wobble or a jittery line: no hand-made noise on the control points, no `rough` shapes; the line is smooth and sure.
- Text over the line, text under 32 px, captions longer than two short lines, any content in the subtitle band (y > 880).
