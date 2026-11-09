# Isotype · grammar card

Reference: the Vienna Method of pictorial statistics, made by Otto Neurath, Marie Neurath and Gerd Arntz in the 1920s and 30s (the charts of "Gesellschaft und Wirtschaft", "Modern Man in the Making"): flat silhouette pictograms on cream paper, each standing for a fixed quantity, counted in rows; four flat colours and black; small capitals in a geometric sans; a key that says what one figure is worth. Good for "how many / how much" questions: population and society, economic comparisons between countries or groups, public health, survey results and shares, change over time, migration, who owns what.

## In one sentence

Every page is a counted chart: identical pictograms stamp in one by one in counting order until the row says the number, and then figures change colour or walk from one group to another to show the shift.

## Picture

- **One figure = one fixed amount, for the whole film.** The director fixes the unit once in the storyboard ("one man = 8000万人") and it never changes for that glyph. **Quantities are counts of identical figures, never one figure drawn bigger.** A fraction is the last figure cut straight down (`n: 7.4`), never a shrunk figure. Round the data so a row holds 3–40 figures; a block (`P.array`, `P.columns`) up to 100.
- **The figures are the chart.** `P.array` draws a counted block (rows of `cols` figures; `groups` split it into coloured shares: "33 of every 100" is `groups: [{ n: 33, color: 'red' }, { n: 67, color: 'muted' }]` with `cols: 10` or `20`). `P.rows` is the classic comparison: one labelled row per year, country or group, all starting on one vertical line. `P.columns` stands blocks of figures side by side on a black baseline (town and country, then and now). `P.regions` is the map: provinces or countries as flat tinted tiles on a coarse grid, each holding its own figures; geography is only arrangement (north up, neighbours touching).
- **Pictograms**: pick the glyph that IS the subject, from `PV.glyphs`: people `man woman child worker elder doctor`; places `house flats factory hospital school`; transport `car bus truck tractor ship plane bike`; money and goods `coin note sack barrel book phone computer`; food and land `wheat bowl bread fish cow sheep tree pine`; and `bed cross bolt drop cloud clock globe`. Mixed glyphs in one block only when they are different kinds of thing (men and women). Anything missing is the nearest glyph plus a caption, never a drawing made of `P.box` / `P.circle` / `P.path`.
- **Colour is a category, not decoration.** Black (`ink`) is the main count; `red` the group the film is about or the change; `blue`, `orange` (ochre) and `green` are other groups; `muted` (grey) is "the rest", the past, or "did not". At most 4 colours on a page, and once a colour is a group it is that group on every page. The pale tints (`faintF`, `blueF`, `orangeF`, `greenF`, `redF`) are only for `P.regions` tiles. No outlines, gradients, shadows or textures.
- **One key per figure, said once, in one place.** Pass `key: '<amount>'` to the array, rows, columns or regions: it draws `[figure] = <amount>` under the block's bottom left. The text is the amount only (`'8000万人'`, `'10 million people'`), worded identically on every page; never "1人 = …", never a fraction ("十分之一的中国人"), never two keys for one glyph on a page.
- **Counts agree across pages.** The director states every quantity once in the storyboard ("died before 5: 36 of 100") and every page uses exactly that number for figures, tallies and captions; a group never has 36 figures on one page and 35 on the next.
- **Type**: every word is small capitals in the geometric sans. `P.caption` for labels, units, a group's name, a second fact (≥ 30 px, default 32); the source line, if any, directly under the chart and aligned with its left edge (≤ 8 words). Numbers sit at the end of their row (`value` in `P.rows`, `tally` on an array or column), never as a headline. At most 3 captions on a page besides labels.
- **Strict grid, filling the frame.** Rows start on one vertical line, blocks share one baseline, figures in one chart are one height. Charts fill the content area (x 140–1780, y 190–880), and the kit sizes them: **leave `h` out** and pass `null` for x / y to centre the block (or `area: { x, y, w, h }` for the half beside a close-up). It gives about 200 px figures for 10, 100–110 px for 100 in 20 × 5. Never a block in the top half with the bottom empty. Text sizes: captions, labels and keys ≥ 30 px, row values and counts ≥ 40 px, the year 128–170 px. Two blocks compared or trading figures use one size (`like: A`). Choose the unit so the longest row holds ≤ 20 figures.
- **One symbol at size, as a close-up.** `P.glyph(name, cx, cy, h)` up to 620 px tall is the subject of the page (the one worker this film follows, the one house) beside the chart, at most one per page and never standing for a quantity; `cut` on it is a fraction you can see ("six tenths of a worker's week").
- **The title** is `P.title('Short title', { kick: 'unit or place · years' })`: small capitals top left with a black rule across the frame. Content starts below y 190.

### Layouts that work (never the same twice in a row)
1. **Rows over time.** `P.rows` with 3–6 years or countries, the key (`key`) and the source underneath.
2. **Two columns and the walk.** `P.columns` with 2 blocks, `P.year` beside them; figures `move` from one to the other while the years run.
3. **Share of a hundred.** One `P.array` of 100 (10 × 10 or 20 × 5) with 2–3 groups, a `P.glyph` close-up of one figure on the other side.
4. **The map.** `P.regions` with 4–9 tiles, the subject region in a tint, `P.flow` arrows for what moves between tiles.
5. **Before and after.** Two `P.array` blocks of the same unit, left and right, a `P.flow` between them; figures `recolor` in the right one.

## Motion and camera

- **The count is the animation.** Figures stamp onto the paper one by one in reading order (left to right, row by row; columns bottom up) at a pace the eye can count along: about 0.16 s each for up to 12, faster for crowds. Put the **last** figure on the spoken number: `land: P.cw(i, '7.8')` (or `at` on the word that names the group). One row or block counts at a time; the next starts after it.
- **The signature: the shift.** After a chart has counted in, the change is shown by the same figures: `A.recolor(t, from, to, color)` turns a share one by one ("now 4 in 10 own a car"); `A.move(t, k, target)` walks k figures across into another group's next free slots, one after another, changing to its colour on the way, while a `P.year` ticker runs through the years (`keys: [[t1, 1980], [t2, 2020]]` spanning the same moments). Give the target `cap` for the slots. Every film has at least one recolour or walk.
- **Focus by dimming.** `A.dim(t, { except: [from, to] })` greys everything but the figures being spoken about; `A.undim` brings them back.
- `P.flow` arrows grow from their tail on the word for the movement; `P.year` counts through every year between keys.
- **Camera nearly still**, like a printed plate. At most one `P.push(t, x, y, 1.15)` per page onto the row or tile being explained, then `P.back`. No pans across a chart, no shakes, no slams.

## Pacing

- Within the first 1.5 s: the title and either the first row counting or the close-up glyph.
- 10–15 s per page; a figure lands, a row starts, a colour turns or a walker crosses **every 1–3 s**.
- One film = 4–6 chart pages, one unit per glyph throughout; the walk or the recolour is the turn of the film.
- End on the finished chart (every row counted, the last group recoloured, the year at its last value), held 2 s. Never on a text card.

## Not this

- **Not Mid-century Cartoon** (`midcentury`): no presenter or character with a face, no story scene, no misregistered print, no sunbursts or step cards. Isotype figures are anonymous units standing in rows.
- **Not Swiss** (`swiss`): no giant headline words, no slammed type, no single red slab; the type here is small capitals and the figures carry the page.
- **Not Broadsheet** (`broadsheet`): no salmon newsprint, no line or bar charts, no big serif numbers or clippings; a quantity is a row of figures, never a rectangle's length.
- **Not Vector** (`vector`) or **Isometric** (`isometric`): no night sky, glow, 3D or perspective; everything is flat and frontal.

## Never

- A figure scaled up to mean "more", figures of different heights in one chart, a fraction drawn as a smaller figure, or a unit that changes between pages for the same glyph.
- Bar charts made of rectangles, pie charts, line charts, axes with gridlines, dashboards, cards, bullet lists, icons from `P.icon`, emoji.
- More than 4 colours on a page; a colour that means one group on one page and another on the next; tints used for anything but map tiles.
- Outlines, gradients, shadows, glows, textures, hand-drawn wobble, rounded cards.
- Words as the subject: sentences on screen, captions over 8 words, text under 30 px, a key missing on the page that introduces a unit, a key worded differently from page to page, figures under 60 px when there is room.
- The medium's pitfalls: rows of 2 giant figures that leave the frame empty; 300 tiny figures nobody can count; a whole chart appearing at once; two rows counting at the same time; walkers that leave a group without arriving in another; a map with coastlines.
- Content in the subtitle band (y > 900) or under the title (y < 190).
