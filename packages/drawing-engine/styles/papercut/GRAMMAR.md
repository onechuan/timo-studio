# Red paper-cut · grammar card

Reference: Chinese folk paper-cutting (剪纸 / 窗花) — the window flowers of northern China (Shaanxi, Yuxian, Foshan), cut from one sheet of China-red paper with scissors: sawtooth (锯齿纹), crescent (月牙纹), swirl and plum-blossom cuts, fold-symmetric rosettes (团花), 福 diamonds, zodiac animals and plump children pasted on lattice windows for the New Year. Good for Spring Festival and the other festivals, folk customs and crafts, the zodiac and auspicious symbols, intangible cultural heritage, regional traditions — anything festive and Chinese told as an explanation.

## In one sentence

Every idea is a piece of red paper cut by scissors and pasted flat on a dark indigo (or gold) sheet: the picture is what the scissors took away, and the moment that matters is a folded wedge snapping open into a full window flower with light pouring through its holes.

## Picture

- **Ground first.** Start every page with `P.ground(kind, o)`: `'night'` (indigo, the default — red reads best on it), `'gold'` (warm gold paper for a bright festive page), `'rice'` (pale paper, a calm daytime page, a page about the craft itself), `'jade'` (dark green, a page that is not festive). Add `hills: true` on most night pages (layered sawtooth hills along the bottom), `snow: true` for winter and New Year's Eve, `moon: [x, y, r]` for the Mid-Autumn or a night sky, `border: true` for a title or an ending page. Use at most two ground kinds in a film.
- **Everything is cut paper from the kit.** Choose the component for the subject:
  - `P.flower` — the window flower: the signature (see Motion). r 260–420 as a page's hero, 120–200 as a supporting piece. `centre: '福'` (or 春, 喜, a year) cuts a character through its heart.
  - `P.animal` — zodiac animals (rat ox tiger rabbit dragon snake horse goat monkey rooster dog pig) and auspicious ones (fish 年年有余, crane, magpie 喜鹊, bat 福, butterfly). 420–900 px wide as a hero.
  - `P.figure` — folk people (child, girl, boy, woman, man, elder), front-facing like a paper doll; `pose` and `holds` act the custom (a child with a lantern, an elder bowing 拱手). h 380–600.
  - `P.motif` — the objects of customs: lantern, fu (`flip: true` = 倒福), coin, peach, plum, cloud, knot, gourd, firecracker, lotus, sun, moon, dumpling, mooncake, ingot, house, tree, boat (dragon boat), drum, candle, flowerpot. 160–480 px.
  - `P.cutout(pts)` — anything else (a kite, a pagoda, a map of a province, a tool): give its outline and the kit cuts folk patterns into it.
  - `P.strip` — a folded paper chain of n identical figures or motifs, opening panel by panel: **every count** (5 generations, 12 months, 8 dishes) is shown this way.
  - `P.wheel` — a turning paper wheel of n items: **every cycle** (the twelve zodiac animals, four seasons, the festivals of a year); `turn` brings the item being spoken of to the top.
  - `P.lanterns`, `P.glow`, `P.fireworks`, `P.scraps` — atmosphere and celebration. `P.scissors(pts)` cuts a lit slit across the frame (open a film, divide before | after).
- **Composition.** One hero piece per page, large: a flower r ≥ 300, an animal ≥ 620 wide, a figure ≥ 480 tall, a word ≥ 220 px — it covers 30–45 % of the frame, off-centre. 2–3 supporting pieces of at least 200 px fill the rest, so no quarter of the frame above the hills is empty ground. At least 60 px of ground between separate red pieces — red touching red merges into one blob. Every piece lies whole inside x 140–1780, y 170–880 (a figure's raised arms included: its box is h × 1.0 wide). Nothing is laid over a lit flower.
- **Colour.** China red is the material (`color` default). Depth and role change the paper, never a gradient: `'deep'` for something heavier or further back, `'pale'` for a faded memory or the past, `'gold'` (gold foil) for ONE accent per screen — the answer, the moon, the coin, the thing named in the conclusion. `'cream'` only for a piece on the night ground that must not be red (snow, rice, a ghost of an idea). No other colours.
- **Words are paper too.** `P.banner` (a red strip with gold characters) for every label, name, date or number: ≤ 12 汉字 or ~5 English words, size ≥ 40 (labels ≥ 34). `vertical: true` for a couplet column (春联) — two of them flank a door or a flower beautifully. `P.word` for the one word a page is about (1–4 big characters 140–300 px; `card: 'diamond'` for a 福-style 斗方). At most 2 banners and 1 word on screen at once. Plain `P.text` only for a number counted live (`P.follow`) in `color: 'yellow'`, size ≥ 64. The page title is a banner top-left (`P.title`, drawn for you, ≤ 12 汉字): keep x < 820, y < 160 free.
- **Explaining with paper.** Show relationships by placement and paper: before → after as two pieces either side of a `P.scissors` slit; the cause glowing (`glow`) and its effect lit by it; the old custom in `pale`, today's in red; one thing becoming many by unfolding (`flower`, `strip`). No diagrams.
- Plain primitives (`P.box`, `P.circle`, `P.arrow`, `P.line`, `P.path`, `P.icon`) are pencil marks and do not exist in this medium. Don't use them.

## Motion and camera

- **Paper moves on twos** (12 steps a second; the kit does it). Pieces arrive the way paper does: pasted on (`enter: 'paste'`, default, a two-step pat), dropped onto the ground (`'drop'`), cut out by scissors running round the outline (`'cut'`, ~1.4 s, scraps fall), or opened out of a fold (`'unfold'`, the default for figures). Time every arrival to its word: `at: P.cw(i, '鱼')`.
- **The signature move: fold – cut – unfold – light.** `P.flower` with the default `enter: 'unfold'` shows a folded red wedge, scissors cutting into it, then three snaps opening it into the full flower (~2.6 s). Later, on the sentence that lands the point, `glow: t` backlights it: the paper turns deep red, every hole pours warm light, rays spread, and `project` casts the pattern on the ground. Use the unfold at least once in every film (the opening or the key idea) and the glow on the film's conclusion. Never use it as wallpaper on every page.
- **Alive after arriving.** A still page is dead paper: give animals `hop` (6–14 px), hanging things `sway` (3–6°), lanterns their swing, night pages `snow`; walk an animal or figure across with `move: lt => [dx, 0]`. Something visibly changes every 2–3 s: a new piece pasted, a strip opening one more panel, the wheel turning, a glow switching on.
- **Camera.** Mostly locked and frontal, like looking at a window. `P.push` toward the piece being explained (≤ 1.2×), `P.back` afterwards; at most two moves a page. No shake, no rotation, no slow drift.

## Pacing

- Within the first 1.5 s of a page: the ground, the title banner and at least one piece already pasted or being cut.
- 8–14 s per page; a page builds to one complete paper picture (a window you could photograph) by its last cue: the hero plus at least two more pieces, spread across the frame. A page that is still one or two small pieces on bare ground after its first 4 s is unfinished — make the pieces bigger or add the next piece of the custom.
- Open the film on paper being made (scissors cutting, a wedge unfolding); end it on the lit window flower or a full festive picture (lanterns, a strip of figures, fireworks), with a short banner — never on a text card.

## Not this

- **Not collage:** no newsprint, photographs, tape, marker circles, highlighter, red thread, kraft or torn edges. Every edge here is a clean scissor cut.
- **Not ink wash:** no brush strokes, ink blooms, washes, mist or empty xuan paper with a seal. Nothing is painted.
- **Not ukiyoe:** no woodblock colour layers, outlines, gradient skies (bokashi), waves in blue and white, Japanese subjects.
- **Not shadow puppetry:** no translucent coloured hide figures with jointed limbs on rods, no lit white screen behind them, no opera stage. Our pieces are opaque, flat, mostly one red, symmetric, and light shines *through the cut holes*, not through a screen.

## Never

- Slide habits: bullet lists, paragraphs, tables, boxes with text, arrows, flow charts, icons, emoji, charts.
- Colour abuse: more than one gold accent per screen, a red ground, any colour outside red / deep / pale / gold / cream on the ground's own family, gradients, glow on anything but light through holes (`glow`, `P.glow`, lantern light).
- Red on red: two red pieces overlapping or touching (they read as one blob) — space them ≥ 60 px or change one to `deep`, `pale` or `gold`.
- Painted or outlined shapes, pencil primitives, shading, 3-D perspective, photos.
- Jointed limbs swinging on rivets, translucent coloured figures, a lit screen (shadow puppetry).
- More than ~8 pieces on a page; pieces under 120 px carrying the meaning; text under 34 px; anything in the subtitle band (y > 900) or under the title banner (x < 820, y < 160).
