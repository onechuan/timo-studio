# Copperplate Engraving · grammar card

Reference: 18th–19th-century natural-history and anatomical plates (the copperplates of the *Encyclopédie* and the early *Britannica*, Bell's and Gray's anatomies, Darwin-era zoology plates, Haeckel), engraved in copper, printed on laid paper and coloured by hand afterwards. Every tone is made of cut lines; colour comes last. Good for biology, anatomy, medicine, the history of science, natural history and museum explainers: how an organ works, what a creature is made of, what a discovery showed.

## In one sentence

Every page is one printed plate that explains by showing a specimen: the burin cuts the figure line by line until it has volume, its parts are named one at a time by italic labels on ruled leaders, a roundel magnifies what the eye cannot see, and at the payoff transparent watercolour floods into the engraved lines.

## Picture

- **The sheet is fixed.** Cream laid paper, the plate mark and the ruled border are the background; `P.title('角膜')` cuts the plate's heading centred at the top and adds the plate number (`Pl. III.`) at the top right itself: pass the heading only (≤ 12 Chinese characters or ≤ 5 English words). Keep all content inside **x 140–1780, y 170–880**.
- **One plate per page, and the figure fills it.** Either one principal figure (an organ, a cross-section, a plant, an instrument) **at least 540 px tall (half the plate) or 1100 px wide**, roughly centred, with its labels in the margins round it; or a plate of **2–4 numbered figures**, each **at least 380 px tall**, on one baseline or a 2×2 grid (to compare: stages, before/after), each with its `P.fig` caption. A finished plate has the figure, **at least 3 labels**, a `P.fig` caption, and usually a roundel, a scale bar or an inscribed number: no plate is a lone figure on bare paper. Keep about 160 px of margin round the figure for the labels.
- **Draw every specimen with `P.engrave`.** Build it from parts, **back to front** (later parts sit in front and stop the lines of those behind), each part an outline from `PV.EG`:
  `PV.EG.ellipse(cx, cy, rx, ry, rot)` · `circle(cx, cy, r)` · `ring(cx, cy, r0, r1)` (an annulus: iris, vessel cut across) · `smooth([[x, y], …])` (any rounded body or organ through points) · `poly([[x, y], …])` · `tube([[x, y], …], w0, w1)` (a limb, vessel, nerve, stem, antenna, beak) · `leaf(x, y, len, w, angDeg)` (a wing, petal, leaf, lens, scale) · `blob(cx, cy, r, seed, wob)` (a cell, seed, island) · `layers(x, y, w, [h1, h2, …], wave, seed)` (a block cut open to show its layers — skin, the wall of an eye or artery, a leaf, soil: an array of parts, top to bottom; give each layer a flat `tone` 0.2–0.7 or `style: 'stipple'`) · `arc(cx, cy, r, a0, a1)` (open, for `P.cut`). Raw SVG path strings work too.
  - Give each part its own hatch `angle`, **across its long axis**; neighbouring parts never share an angle (one grey mass otherwise).
  - `tone: 'sphere'` for round things (eyeball, egg, cell, fruit); `style: 'dark'` for a pupil, a hole, a cavity, a mouth; `style: 'stipple'` for soft tissue, skin, a cloud of cells; `style: 'line'` only for transparent things (a wing membrane, a cornea, glass, a cell wall) — and then it gets a pale tint later; `dark: 0.2–0.5` for a part in shadow or stained.
  - Fine detail on top with `P.cut`: veins, nerves, hairs, wing ribs, segment lines, growth rings, a coastline. `P.ground` under anything that rests on a surface. `P.stipple` for a soft field on its own.
- **Draw the specimen, not a toy of it.** A living outline (a bird's head and beak, a shell, a leaf, an organ, a bone) is one `PV.EG.smooth` through **12–24 points that trace its true silhouette** — never assembled from ellipses and tubes like a doll. Tubes are for things that really are tubes (a vessel, a nerve, an insect's leg, an antenna, a stem). People and large animals are not drawn whole: show the part that carries the idea as a specimen or a cross-section (skin as `layers` with a blister rising through them, not an arm; a cow's udder or a vial of lymph, not a cow; the eye, not a face). The history of science is told with its objects: the instrument, the specimen jar, the lancet, the date inscribed.
- **One light, upper left, for the whole film.** Don't pass `light`; the kit already lights every form from there.
- **Ink is the picture; colour is a wash.** The print is ink on paper. Colour is only `P.tint` or the `tint` option of `P.engrave` / `P.roundel`: transparent earth and mineral washes (`red` madder for blood and muscle, `orange` sienna for bodies and bone, `yellow` gamboge, `green`, `blue` for water and membranes, `purple`; the `*F` names are pale washes). **At most 2 wash colours per page**, on the parts that matter. A page may stay all ink; the first wash of the film is an event.
- **Words are engraved lettering, few and small.** `P.label` names a part: italic for Latin and English, Song type for Chinese, **30–40 px**, one to four Chinese characters or one to three English words, with `sub` for a Latin name or a gloss (`'晶状体', { sub: 'lens crystallina' }`) and `n` for a figure letter (`'a.'`). Its leader runs straight from a dot on the part (`to`) out to the margin; place labels left and right of the figure so **no two leaders cross and none crosses the figure**. At most **5 labels per page**. `P.fig` under each figure: `Fig. n.` and an italic or Song caption. The page's one key number, date or word is `P.inscribe` (130–200 px, at most one per page): 1796, ×1,000, 13 种. `P.scalebar` gives the real size (5 mm, 原大). No sentences, paragraphs, bullets, tables or chips.
- **Ideas as plates.**
  - *What it is made of*: the figure, then its parts labelled in the order the narration names them.
  - *What the eye cannot see*: `P.roundel` with `from` on the spot, magnified detail engraved inside, `mag: '×400'`.
  - *A process* (light through the eye, a virus entering a cell, a seed growing): 2–4 figures left to right as Fig. 1, Fig. 2, Fig. 3 with a `P.pointer` between each, or one figure with dotted `P.pointer`s and `P.cut({ dotted: true })` paths running through it.
  - *A comparison or variation*: figures side by side at the same scale, each captioned; the one difference tinted.
  - *Scale and number*: a tiny natural-size figure beside the enlarged one, a `P.scalebar`, a `P.inscribe` number.
  - *A person from the history of science*: never a face; show what they handled (the instrument, the specimen, the page of the notebook drawn as a ruled sheet, the date inscribed).
- Plain primitives (`P.line`, `P.arrow`, `P.path`) draw clean, even lines with no swell: use them only for a ruled guide; everything the viewer should look at is cut with the kit.

## Motion and camera

- **The burin cuts in order.** Each figure: contours first (from `at`), then the first hatching family sweeps across each form, then the crossing family in the half-tones, then the darks — the figure gains volume pass by pass. Main figure `dur` 3–4.5 s, small figures 1.5–2.5 s. Stagger figures 0.6–1.5 s apart, back ones first. Nothing slides, bounces, pops or fades in as a block.
- **Labels arrive one by one on the word.** Each `P.label` at `P.cw(i, 'name', -0.3)`: the dot lands, the leader is ruled out, the name is cut. A roundel is scribed on the word that names the hidden thing (`at: P.cw(i, 'word', -0.6)`); its detail is cut at once inside it, so give it 4–8 parts that fill the circle.
- **The signature: colour floods in at the payoff.** Pass `tintAt: P.cw(i, 'word')` (or time `P.tint`) to the word that lands the answer; the wash blooms from where the brush touches (`from`: on the part that matters) and dries with a tide-line. Before that, the plate is ink only.
- **Mechanisms may move after they are cut**, sparingly: `move: lt => ({ rot, dx, dy, s })` on a part's own `P.engrave` (a wing beats, a lens thickens, a pupil narrows), slow and small.
- **Camera: a loupe over the sheet.** Mostly still. At most one push per page, `P.cam([P.push(t, x, y, 1.15), P.back(t2)])` (≤ 1.2×), toward the part being named; never a shake or a slam.

## Pacing

- Within the first 2 s of a page the burin is already cutting the main figure's contour (`at` 0–0.3). **Nothing on screen stands still and unfinished for more than 1.5 s**: no empty ring, no blank half of the plate waiting for a later cue — cut the next thing, or start it earlier.
- 8–14 s per page; something new is cut, labelled, magnified or tinted every 2–3 s.
- Colour is held back: the first two pages of a film usually stay ink only; the payoff page floods with colour.
- End the film on the finished plate: every figure engraved, labelled, captioned and coloured, held for at least 2 s — never on a text card.

## Not this

- **Not Blueprint**: no blue ground, no white lines, no dimension lines with arrowheads, no grid, no monospaced capitals, no exploded assemblies.
- **Not Watercolor**: no pencil underdrawing and no shape made of wash alone — the engraved line carries the form; the wash only colours it, after.
- **Not Woodblock (ukiyo-e)**: no flat opaque colour blocks, no even black keylines, no cartouches, no seals, no landscape views.
- **Not the plain Study style**: no rough marker lines, highlighter swipes, chips, cards or handwritten notes.
- **Not Vector**: no flat fills, no glow, no gradients — biology here is a printed plate, not a glowing diagram.

## Never

- Slide layouts: title + boxes, cards, chips, bullet lists, tables, flowcharts of boxes, icons (`P.icon`), emoji, logos, progress bars.
- Opaque colour fills (`P.box` / `P.circle` with `fill`), gradients, glow, drop shadows, photographs, 3D renders, neon, cartoon faces, anime.
- A specimen drawn with plain `P.path` / `P.line`: an even line reads as a vector diagram. Cut it with `P.engrave` / `P.cut`.
- Colour before the ink is finished, a wash on lettering or over the whole page, more than 2 wash colours on a page, a bright saturated colour.
- A part left as an outline beside hatched parts (it reads as unfinished), unless it is transparent (`style: 'line'`) and tinted.
- Parts listed front to back (the back part's lines run over the front one), or neighbouring parts hatched at the same angle.
- Hands, arms, faces, people or whole mammals built from tubes and ellipses (they read as sausages and toys); limbs as plain cylinders.
- A figure smaller than about 300 px (its hatching turns to grey): magnify it in a `P.roundel` instead.
- Leaders that cross each other or the figure; labels on the figure; text under 28 px; anything in the subtitle band (y > 900) or above y 170.
- A second light direction, or `light` changed between pages.
