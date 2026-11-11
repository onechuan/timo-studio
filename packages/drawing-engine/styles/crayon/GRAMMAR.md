# Crayon Picture Book · grammar card

Reference: the children's picture book drawn in wax crayon and oil pastel — Eric Carle's bright crayon-textured shapes, the scribbled colouring of a nursery-school drawing, a bedtime board book read to a three-to-seven-year-old: thick wobbly outlines, colour that skips over the paper's grain and spills past the lines, round children with dot eyes and pink cheeks, a sun and a moon with faces, one picture per spread, and a page that turns. It suits early-childhood learning and bedtime science (why the moon changes shape, why we sleep, where a sound comes from, why we brush our teeth, what a heart does), kindness, feelings and good habits, told gently and slowly to a small child.

**This style overrides the general rules about people.** "Never draw faces" and "show only hands, a back or a silhouette" do not apply: round picture-book children and animal friends with faces are the point. In the storyboard set `cast` to `"characters"`, name each character in the beats as an object that acts (e.g. object "穿黄裙子的小女孩（朵朵）", action "指着月亮张大嘴"), and give every page at least one character or one thing with a face.

## In one sentence

A blank cream page fills itself as a crayon draws the outlines and scribbles the colour in, stroke by stroke, while a round little child acts the idea out with the sun, the moon, a tooth or a seed that have faces too; when the page is told, it turns like a book page to the next picture.

## Picture

- **One picture per page, a spread of a picture book.** Outdoors: `P.ground` (grass top at y 740–800) and, when the sky matters, `P.sky` (`mode: 'day' | 'dusk' | 'night'`, lower edge y 320–520). Indoors (a bedroom, a bathroom, a kitchen): `P.room` (a scribbled wooden floor, polka-dot wallpaper, a window with a day or night sky in it, `rug`) instead of sky and ground. Every page has one of the two settings except a deliberate close-up of a single big thing. Leave at least 30 % of the frame bare cream paper; the strip below y 890 stays bare for the printed words.
- **The cast: `P.kid`.** Pick 1–2 characters for the whole film and keep each look identical on every page (`kind`, `shirt`, `dress`, `hair`, `hairStyle`, `bow`): e.g. 朵朵 = a girl in a yellow dress with pigtails and a pink bow; Bear = `kind: 'bear'` in a green shirt. Size 380–460 px, feet on the grass line (y 840–870) or on the floor (y ≈ 860). Two characters face each other (`look`) and stand at least 500 px apart. A character is on most pages and on the first and last.
- **Things: `P.thing`, big.** The idea is drawn as an object a child knows: star heart cloud drop tree flower sprout seed house tooth toothbrush germ apple candy earth bed book umbrella balloon cup torch ball bird volcano clock rainbow carrot bulb gift; the sky has `P.sun` and `P.moon` (with `phase`). The thing that carries the idea is 260–420 px; supporting things 140–260 px; nothing that matters under 120 px. Anything the list lacks is `P.crayon` (polygons outlined and coloured in: a road, a pond, a mountain, a body, a slice of cake) or `P.disc` (anything round).
- **Fill the spread.** The picture spans x 200–1720 and y 180–880, and the upper half (y 180–520) always holds something big: the sky with a sun or moon, a thing ≥ 260 px, a window, or `P.words` ≥ 130 px. A page with an empty upper half, or with small things standing in a row along the grass, is unfinished. Every settled moment has one hero ≥ 300 px besides the character.
- **Vary the spreads.** Never use the same layout on two pages in a row: swap the character's side, change the setting (day → night, outdoors → room), and give the film at least one close-up page (the key thing 500–700 px, the character small or peeking in from a side) and one wide page with two characters.
- **Child logic.** A thing that is a character in the idea gets a face (`face: true`, `mood`): the sleepy moon, the worried tooth, the grumpy germ, the seed that wakes up. At most 2 faced things per page besides the cast. Perspective is a child's: big sun, small house, people as tall as doors.
- **Explaining is drawing.** A cause and its effect: two pictures left and right joined by a curvy crayon arrow (`P.lines(…, { arrow: true })`). A cycle: things in a ring with curved arrows. A path or a beam: `P.lines` with `dashed: true`. More vs less: draw 1, 2, 3 things in a row, or a small and a big one. Change over time: the same thing redrawn (`P.moon` phase, `dirty` on a tooth, `scale` on a sprout, `erupt` on a volcano). Never boxes, cards, charts, tables or bullet lists.
- **Words are hand-lettered, and few.** The page title is lettered top left for you (`P.title`, ≤ 14 汉字 / 6 words). Per page at most 2 more blocks of words: one `P.words` (the key word or number, 2–8 characters, 110–200 px, landing on its spoken word; `colors` for a rainbow word) and one `P.note` (≤ 12 汉字 / 6 words, 44–54 px, with `to` pointing at the thing) or one `P.say` (a balloon from a character, ≤ 10 汉字 / 5 words). Words go on bare paper, never on the coloured sky or grass.
- **The crayon box.** `red orange yellow green blue purple pink peach brown` plus `night` (deep indigo for night sky) and `paper` (white crayon), `ink` for outlines; `*F` (e.g. `blueF`) is a light crayon. One crayon per thing; at most 5 crayons on a page besides ink. Words in `red blue green purple orange` or `ink`; never `yellow`, `paper` or an `F` crayon for words on cream paper.
- Plain primitives (`P.text`, `P.arrow`, `P.line`) only for something the kit cannot draw; prefer `P.note` and `P.lines`.

### The kit (already registered — call directly)
- `P.crayon(parts, o)` — **the signature**: outlines drawn, then colour scribbled in on `fill` (the word).
- `P.kid(x, y, o)` — the cast; `pose` and `mood` change on the beat; `holds` a thing.
- `P.thing(kind, x, y, o)` — the objects; `face`, `mood`, and per-kind states (`dirty`, `erupt`, `time`, `rain`, `beam`).
- `P.sun`, `P.moon` (`phase` 0 new · 0.25 first quarter · 0.5 full · 0.75 last quarter), `P.disc`.
- `P.sky(o)`, `P.ground(o)`, `P.room(o)` — the page's setting, coloured in as a sweep.
- `P.lines(lines, o)` — rays, rain, paths, curvy arrows; `P.scribble(cx, cy, rx, o)` — a tangled mess (a cross mood, plaque, dust, crossing out).
- `P.words`, `P.note`, `P.say`, `P.twinkle` (the ta-da sparkle, ≤ 1 per page).

## Motion and camera

- **Everything arrives by being drawn.** Outline first while the narration introduces it, colour scribbled in on the word that names it (`fill: P.cw(i, '月亮')` for `P.crayon`; `at` a beat before the word for the others). Nothing fades in, slides in or pops; nothing is on the page before it is drawn except what the previous beat drew.
- **Colouring is the action.** Night falling = `P.sky({ mode: 'night' })` being scribbled across on the word. The moon waxing = its `phase` moving with the narration. Getting dirty or clean = `dirty` rising or falling; a mess = `P.scribble`; growing = a thing's `scale`. Time the change to the word.
- **The cast acts by swapping drawings** (substitution, no in-betweens): change `pose` and `mood` with keyframes on cues, at least 3 changes per page, e.g. `pose: [[0, 'stand'], [P.c(1), 'point'], [P.cw(3, '原来'), 'cheer']]`. Poses: stand wave point cheer think hug shrug sad hold brush reach sleep walk jump shy. Moods: happy laugh calm sad angry surprised sleepy worried shy. Walk a character across with `x: (lt) => …` and `pose: 'walk'`.
- After it is drawn, a thing may move gently (a drop falling, a balloon floating, the moon rising, `float: true`), always slowly.
- **The page turn is automatic** at every page boundary (the corner lifts and the page peels over). Don't draw your own transition; start the next page's first stroke within 0.3 s of the page start.
- **Camera: a book doesn't move.** Locked by default; at most one gentle `P.push` per page (≤ 1.15×) toward a face or the key thing, then `P.back`. Never `P.slam`, `P.shake` or a pan.

## Pacing

- First 2 s of every page: a stroke is already going down (the setting or the character being drawn).
- 10–14 s per page, a visible change every 2–3 s (a thing drawn, colour scribbled in, a pose or mood swap, a word lettered), never faster: the audience is small and the voice is a bedtime voice.
- Each page: the child meets something → the thing does or shows something (drawn, coloured, changed) → the child understands (a pose and mood change, the key word lettered, maybe `P.twinkle`).
- End the film on a calm full picture: the cast waving, hugging or asleep under the moon, the key word in crayon letters. Never on a text card.

## Not this

- **Not watercolor**: no washes, bleeds, soft wet edges, pencil underdrawing or white-paper-as-light; crayon is opaque wax in visible zigzag strokes with paper speckles.
- **Not clay**: no 3D shading, glossy highlights, contact shadows or a studio set; everything is flat crayon on paper.
- **Not chalkboard**: no dark board, no chalk-white lines, no equations; the paper is cream and the crayons bright.
- **Not warm-story**: not an adult's illustrated essay with hands and silhouettes; this is for children under eight, with dot-eyed characters and faces on things.
- **Not whiteboard**: no marker diagrams, flowcharts, boxes with arrows or a drawing hand; ideas are pictures of things.

## Never

- `P.box`, `P.card`, `P.chip`, `P.icon`, `P.code`, `P.bars`, emoji, logos, tables, bullet lists, a paragraph, or a slide of title + text.
- Flat vector fills, gradients, glow, drop shadows, neon, photographs, black (outlines are indigo `ink`).
- Words on the scribbled sky or grass, words in `yellow`, `paper` or an `F` crayon, text under 38 px, more than 2 blocks of words besides the title, `P.words` longer than 8 characters.
- The whole frame coloured in (sky + ground + everything leaving < 30 % paper), `P.sky` and `P.ground` on a page that happens indoors, a page with no setting that is not a close-up.
- The same composition (character on the left, thing on the right, grass) on consecutive pages; more than 2 characters on a page, a character that stands still a whole page, a different look for the same character, a character under 340 px, the thing that carries the idea under 240 px.
- Fast motion: anything that whips, slams, shakes, spins or moves across the page in under 1 s; more than one camera move a page.
- Content in the subtitle band (y > 890) or under the title (x < 900, y < 150).
