# Swiss grid · grammar card

Reference: International Typographic Style posters (Müller-Brockmann, Ruder, Vignelli), set in motion like a kinetic-type title sequence. The type is the picture: words and numbers are the actors, the grid is the stage, red is the punchline.

## In one sentence

A confident designer argues a point with huge black type on a strict grid: every key word rises out of the paper on the beat, every number lands as giant type the moment it is spoken, and one signal red marks the single thing that matters.

## Picture

- **Paper and a 12-column grid.** Warm off-white ground; the columns are printed faintly in the background. Place everything on them: `PV.gx(i)` is the left edge of column i (0–11, `PV.gx(12)` = 1780), `PV.gw(n)` the width of n columns. Left-aligned, ragged right, **asymmetric**: never centre a composition on the frame.
- **Black, red, and nothing else.** `ink` black carries the text; `red` is the one accent — the point, the number that matters, the answer. `muted` grey is for what is past or secondary. `blue` (cobalt) and `yellow` are poster primaries allowed only for a second contrasting fact, never decoration; `green`/`orange` only mean success/warning.
- **Scale contrast is the composition.** Display words 220–520px, headlines 96–160px, supporting lines 48–64px, mono labels 26px. Put a 26px label right beside a 400px word. One giant thing per screen: **every settled frame has at least one element ≥ 260px tall** (a word, a number, a block).
- **Fill the poster.** A composition spans the whole content area, top (y 180) to bottom (y 880) and left to right: anchor something heavy in the lower half too (a rule at y 840–870 with a label under it, a block standing on the baseline, the bottom of a giant number). A frame whose lower half or right half is empty paper is unfinished — add a `P.ghost` behind it, extend a block to the edge, or set the word bigger. Small objects floating in a corner are the most common failure of this style.
- **Type, not handwriting.** Headlines and key words use `P.kinetic` (never `P.text` in write mode). `P.text` only for a supporting line with `mode: 'fade'` or `'words'`, weight 700. Chinese is set in a heavy grotesk (weight 900 for display, 700 for lines) with tight tracking — it must look typeset, like a poster.
- **Flat geometry.** Solid rectangles, bars, rules, one circle; square corners, no outlines around blocks, no shadows, no gradients. Boxes drawn with `P.box` are square and flat already.
- **Data as typography.** A number is a `P.bignum` set huge, not a chart card; comparisons are `P.hbars` rows with heavy value labels; a share is a block whose width is the share.

### The kit (already registered — call directly)
- `P.kinetic(str, o)` — the signature: a headline whose characters/words rise out of a mask on the beat. Modes: `rise` (default), `slam` (1–2 words that must hit, lands from 1.6×), `slide`, `drop`. `{r:word}` turns a word red. `o.out` makes it exit upward, fast.
- `P.bignum(x, y, o)` — giant number in Archivo Black that counts and lands on the spoken word: `at: P.cw(i, '80%') - dur`. `unit` for a smaller unit after it.
- `P.block(x, y, w, h, o)` — flat colour field wiping in from a side (`dir`). Red vertical slabs, black bars behind paper-white words, full-bleed bands (wider than the frame).
- `P.rule(x, y, len, o)` — a hard bar that shoots out: under a heading, between columns, as an axis.
- `P.disc(cx, cy, d, o)` — one flat circle (Bauhaus counterweight to the type).
- `P.label(x, y, str, o)` — mono caps annotation, types on: units, sources, "FIG. 02", an English echo of the Chinese key word. `no: '01'` prints a red index.
- `P.hbars(x, y, w, items, o)` — ranked bars with heavy values; `hi` = the one red bar.
- `P.flood(color, o)` — the whole page turns red (or black) from below; the fixed title inverts by itself. Set text to `'paper'` on it. **The loudest move: once per film, for the thesis.**
- `P.ghost(str, x, y, o)` — huge pale background type (the page number "03", a year, an English key word) bleeding off the edge behind the composition; fills the paper without competing. At most one per page.
- `P.wipe(at, o)` — red/black bands sweep across to change scenes inside a page; swap content at the returned `mid`.

### Layouts that work (vary them; never two pages alike in a row)
1. **Number + argument**: `bignum` across columns 0–6, the explanation as a 110px kinetic line under it; bars or a block chart in columns 7–11.
2. **Slab + headline**: a red `block` filling columns 0–2 top to bottom with a mono label or small number inside in paper; a 280px two-line headline in columns 4–11.
3. **Three columns**: three giant index numbers `01 02 03` (`font: 'display'`) on columns 0/4/8, each with a rule and a word, entering on its own cue; the current one red, the past ones `muted`.
4. **Word ladder**: 4–5 stacked words, 130px, each rising on its cue; the new one red, the previous ones turn `muted` (use a second kinetic in muted with `out`, or keep them all ink and red only the last).
5. **Split field**: a black `block` covering the left half (x < 0 to 960) with paper-white type, paper on the right with black type — before/after, old/new, them/us.
6. **Flooded thesis**: one page floods red; a single 400–520px word slams in in paper-white; one black disc.
7. **Scale shock**: one tiny 26px label in the centre of empty paper, then the same idea as a 500px word that fills the grid.

## Motion and camera

- **On the beat.** Every key word enters at the moment it is spoken (`P.cw(i, 'word', -0.1)`); entrances are fast expo-outs (0.3–0.5 s), exits are faster (0.2 s). Things land and **hold still**: the stillness between hits is part of the style.
- **Staggered, never simultaneous.** Characters of a headline cascade (default stagger); items of a list land one per cue; one focus at a time.
- **Camera mostly locked off**, like a poster. Use `P.slam` once or twice per film on the thesis word, a quick `P.push` toward a number when it lands, a `P.pan` along a wide row of columns. No shakes. No slow drifts.
- **Exit to make room.** When a page changes subject mid-way, clear with `o.out` on the kinetic lines or a `P.wipe`, then build the next composition on the same grid — don't pile everything up.

## Pacing

- Within the first 3 seconds the film shows its biggest idea as type or a number — no slow intro.
- **Something is on screen the instant the page turns in**: start each page with a `rule`, a `block` or the first kinetic word at `at` 0–0.1 s.
- A typographic event every 1.5–3 seconds (a word lands, a number counts, a block wipes, a rule shoots).
- End the film on the thesis word or the final number, held for a full second — never on a summary list.

## Checks

- The engine's check may report **"text-dominated page"** on a kinetic-type page: in this style the type IS the picture, so if the page is a deliberate typographic composition, reply `FLAGGED: kinetic type is the subject in the Swiss style`. Fix every other issue (overlaps, subtitle band, small text, empty opening).
- Keep text off y > 900 (subtitles) and inside x 140–1780 unless it deliberately bleeds as a block.

## Never

- Centred, symmetric slide layouts; "title + three cards + arrows"; bullet lists of sentences.
- Hand-drawn wobble, sketchy circles, highlighter swipes, doodle icons as the subject, emoji, paper textures.
- Gradients, shadows, glows, rounded cards, outlined or italic type, 3D.
- More than one accent colour on a screen; red used as decoration instead of meaning.
- Paragraphs: no line longer than ~14 Chinese characters (≈7 English words) at headline size; long ideas are split into words that land one at a time.
