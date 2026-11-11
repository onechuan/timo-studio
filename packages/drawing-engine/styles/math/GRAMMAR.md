# Math animation · grammar card

Reference: programmatic mathematical animation — explainer scenes written as code, where every formula is typeset in TeX and every figure is exact, the way a mathematician would animate a lecture. Suits algebra, calculus, probability, geometry, linear algebra, physics derivations and the intuition behind algorithms (Fourier series, gradient descent, growth and decay).

## In one sentence

The mathematics is the picture: on a near-black ground, exact lines and TeX formulas arrive in the order the argument needs them, every variable keeps one colour from the first frame to the last, and each step of the argument is a transformation — a formula's terms travel into the next line, a shape turns into another of the same area, a point slides along a curve while its numbers tick.

## Picture

- **Near-black ground, nothing on it.** No paper, no texture, no cards or panels, no background grid (a plane's own grid only when the plane is the subject: `P.plane({ grid: true })`).
- **Exact lines, four weights.** Curves 5px (`P.graph`), vectors 6px (`P.vec`), axes and outlines 3px, construction lines dashed 2px (drop lines, guides). No wobble anywhere.
- **Colour = variable.** The storyboard fixes a colour table — each variable or quantity of the film gets one of `blue yellow green red orange purple` — and **every page calls `P.vars(table)` first, identical on every page** (`P.vars({ x: 'blue', y: 'yellow', '\\theta': 'orange' })`). From then on `P.tex`, `P.morph`, axis labels and readouts paint those letters by themselves, and a graph, area, vector or shape that *is* a quantity takes that quantity's colour (`color: 'x'` works: pass the variable as the colour). `ink` (white) is the mathematics itself: operators, constants, axes, outlines. `soft`/`muted` are construction and what came before. At most four variable colours on one page; a colour never appears on anything that is not its variable.
- **Type is TeX.** Every formula, symbol and number that is mathematics goes through `P.tex` / `P.morph` (KaTeX, Computer Modern; the kit loads it, never touch `META.libs`). In JS strings backslashes are doubled: `'\\frac{dy}{dx}'`. Formulas are set in display style (full-size fractions; `\\tfrac` for a small one). Words are rare: a short phrase in `\\text{…}` inside a formula or `P.text` (same serif), ≤ 5 words; the narration does the talking.
- **Sizes — big enough for a phone.** The main figure or plane spans ≥ 60% of the content area's width (≥ 1000px of x 140–1780) or its full height (y 180–880): a plane `box` at least 1000×560 (default `[200, 190, 1100, 660]`), a circle radius ≥ 200px, a dot grid ≥ 900px wide. The lead formula 80–110px (`P.morph` defaults to 88), secondary formulas and readouts ≥ 52px (`P.value` defaults to 56), labels ≥ 44px, axis numbers ≥ 26px (default 30). Nothing on screen is smaller than a third of the frame; the bottom 40% is never empty while the top is full.
- **Composition: one mathematical object leads.** A plane wide in the left 60% (`box: [180, 190, 1100, 660]`) with readouts and the formula in the right third (x 1400–1780); or the formula centred at y ≈ 300 with a number line or figure below; or one figure big in the centre. Planes for geometry, vectors and matrices use `equal: true`.
- **Title.** `P.title` writes a short serif title (60px) top left with a hairline under it: ≤ 6 words, or leave it out when the formula is the title.

### Which component draws what
- **Formulas:** `P.tex` (written on; `{{…}}` marks terms you will point at), `P.morph` (a derivation in one place — the signature), `P.surround` (a box on one term), `P.brace` (a brace with a label under a term or along a length), `P.value` (a live readout `x = 1.73`).
- **Functions:** `P.plane` → `A`, `P.graph`, `P.trace` (a dot riding the curve, drop lines and coordinates), `P.tangent` (slides with the dot, slope readout), `P.area` (accumulating, or Riemann rectangles that refine).
- **Numbers:** `P.numline` with a moving marker; `P.dots` for counting and probability (every dot one equally likely outcome).
- **Geometry:** `P.shape` with `PV.M.circle / rect / poly / regular / arc / sector`, morphing on cue with `to: […]`; `P.point` for labelled vertices; `P.unroll` for the circle that becomes a triangle; `P.unitcircle` for angles, sine and cosine.
- **Linear algebra:** `P.vec` (fixed or moving vectors), `P.matrix` (the whole grid bends; î green, ĵ red; `unit: true` shows the determinant as the yellow square's area).
- **Signals and series:** `P.epicycles` (rotating circles chained tip to tail; with `wave` the sum is traced as a wave).
- `P.arrow` is a clean straight arrow with a solid tip ("becomes", "plug in"). `P.text` writes a word in the same serif. Never `P.box` cards, `P.icon`, `P.chip`, `P.card`, `P.code`, `P.bubble`.

## Motion and camera

- **A page never opens on black.** It opens with its plane or figure already standing — when it is the same object as on the last page (the same plane, the same curve, the same formula), it is carried over exactly (same box, same range, same position) — and the new thing draws onto it. Leave `at` out for what is carried over: every kit component without `at` is already complete at lt 0. Give `at` only to what is new on this page, and the first new thing starts by 0.3 s. Never start a page with only fragments of strokes drawing out of nothing.

- **Create, write, transform.** Lines are created along their length with a symmetric smooth ease (soft start, soft landing: the medium's own rate, used instead of a plain deceleration); formulas are written left to right, outline first, then the fill. Things never pop in: they are created, written, grown from a point, or transformed out of something already on screen.
- **The signature: a derivation stays in place.** Never write the next line under the last one. Put the steps in one `P.morph`: at each `times[i]` the matching terms (`{{…}}` with the same TeX) travel to their new places on a shallow arc, everything else fades out and the new parts fade in. Wrap every symbol that should travel, operators and `=` included. When a term changes on its way (5 crossing the equals sign becomes −5), give both the same key: `{{c::5}}` → `{{c::-5}}`. Each step lands on the word that justifies it (`times: [P.cw(1, 'across'), …]`); 3–5 steps per morph, ≥ 1.4 s between steps (the kit pushes a step back until the previous one has landed). One line position, one morph: never put a second `P.tex` or a readout where a morph's line sits or within 120px below it, and never write a new formula on a spot another formula leaves — transform it there instead. Outgoing terms clear before incoming ones land.
- **The other signature: an equivalence you can watch.** Once per film, at the climax, a shape turns into another to prove they are equal: `P.unroll` (the disc's rings straighten into a triangle of base 2πr and height r), `P.shape(…, { to: [{ d, at }] })` (a parallelogram into a rectangle, a square into a circle of equal area). Then the formula that the shape just proved, written beside it.
- **Live values (where this medium departs from "no long motion").** A variable that changes is one function of time, `const x = (lt) => PV.keys([[P.c(1), 0.5], [P.ce(2), 4.5]], lt)`, and the dot, tangent, area and readouts all read the same function, so everything that depends on x moves together. It may move for several seconds while the narration talks about the change — watching it change is the point — but it starts and stops on the words and holds still otherwise. Never loop it; never move two variables at once.
- **Fourier chains.** `P.epicycles` draws circles only for the first 5 terms (`maxCircles`); the smaller terms ride on the arm. Biggest circle r 180–240px, the wave beside it ≥ 700px long.
- **Camera.** Mostly still, like a lecture slate. The close-up of this medium is a **re-plot**, not a camera move: the next page draws a new `P.plane` over a tiny range around the point (`x: [2.9, 3.1, 0.05]`), and the curve there is visibly a straight line. Limits: at most one camera move per page, no shakes, no slams, no drifts; readouts and the formula that must stay readable during a zoom take `fixed: true` (`P.value` is fixed by default), and labels the zoom pushes out of frame are hidden first (`handle.hide`).

| Move | What it says | When |
|---|---|---|
| still (default) | "watch this" | almost always |
| re-plot on a new plane | "zoom in" (extreme close-up) | the curve becoming its tangent, a limit, the first digits that differ |
| zoom: `P.cam([{ at, x, y, s: 1.6, dur: 0.9, ease: 'inOut' }, { at: t2, x: 960, y: 540, s: 1, dur: 0.9, ease: 'inOut' }])` | "look closer, then the whole again" | one region of a busy figure, with the labels outside it hidden |

## Pacing

- The page's object is being created by 0.3 s: the axes, the first formula being written, the first figure.
- Pages of 8–14 s; something is created, written, transformed or set moving every 1.5–2.5 s, each on the word that names it.
- Hold every transformation for ≥ 1 s after it lands.
- The film ends on the result: the final formula, `P.surround` in its variable's colour, held 1.5 s.

## Not this

- **Not Chalkboard** (`chalkboard`): chalk lettering on a green slate, steps written one under another down the board. Here the formulas are typeset TeX on near-black, the lines are exact, and a derivation stays in one place, each step transforming the last.
- **Not Blueprint** (`blueprint`): white drafting lines on cyanotype blue, dimensions and numbered parts of machines. Here the subject is abstract — planes, graphs, figures, formulas — and colours belong to variables, never to a red pencil or a highlighter.
- **Not Tech dark** (`tech-dark`): boxes, arrows and code panels for software systems. Here there are no boxes, cards or code: the picture is a curve, a figure or a formula.

## Never

- Slide habits: bullet lists, sentences on screen, cards, icons, emoji, a title over three boxes.
- One variable in two colours, two variables in one colour, colour as decoration, more than four variable colours on a page, a `P.vars` table that differs between pages.
- A formula written with `P.text`, LaTeX source visible on screen, a lead formula below 80px or any formula below 52px, a figure smaller than a third of the frame.
- A page that opens empty, or redraws from nothing an object the last page already showed.
- A derivation stacked line under line (that is the chalkboard), or more than five steps in one `P.morph`.
- Wobbly or rough shapes, gradients, glows, drop shadows, 3D, textured grounds.
- Decorative mathematics: formulas or symbols scattered as wallpaper, a plane with nothing plotted on it, a curve that is not the function the narration names, numbers that disagree with it (plot the real function; let the kit compute values).
- Characters, mascots or faces of any kind; names of channels, creators or tools.
- Anything below y 880 (subtitles) or outside x 140–1780; a plane whose x label (right of the axis end) or readouts run past x 1780.
