# Shadow Puppetry · grammar card

Reference: Chinese shadow-puppet theatre (皮影戏) of Shaanxi, Huaxian and Tangshan — dyed, pierced donkey-hide figures jointed with thread rivets, worked on rods against a cotton screen lit from behind by an oil lamp, inside a lacquered stage frame; and Lotte Reiniger's profile acting. It suits myths and legends, historical figures and episodes, opera stories and classic tales: the idea is explained as a play performed by puppets, each page one scene of it.

**This style overrides the general rules about people.** "Never draw faces" and "show only hands, a back or a silhouette" do not apply: carved puppets with profile faces are the whole point. In the storyboard set `cast` to `"characters"`, name each puppet in the beats as an object that acts (e.g. object "红袍将军皮影（周瑜）", action "举剑指向江面"), and give every page at least one puppet, creature or carved prop that acts.

## In one sentence

The lamp comes up behind the screen and a small troupe of glowing, jointed leather puppets performs the idea as a play — a scene per step of the explanation, names and numbers on carved plaques — and at the turn one figure lifts away from the cloth and its shadow grows huge and soft.

## Picture

- **The theatre is always there.** The kit draws the lacquered frame, the lit cloth (x 56–1864, y 112–908) and the lamp on every frame. The cloth is the whole picture: keep everything inside x 80–1840, y 130–890. Don't draw backgrounds, boxes or panels on it: most of the cloth stays empty, glowing.
- **Every page is a scene of the play.** Build it back to front: `P.lamp`, then 1–3 set pieces (`P.scenery`, `P.water`), then `P.ground()` (the carved strip every figure stands on; soles on y 850), then the puppets and creatures, then plaques. A place is one or two carved pieces: a hall = `palace` or `table`; a city = `gate` or `wall`; the wild = `mountain` + `tree`; heaven = `cloud` + `sun`/`moon`; a river or the sea = `P.water` across the whole cloth (+ `boat`; figures on the water stand in a boat, figures on land stand on `P.ground` beside a water strip that ends where the land begins — never knee-deep in water); an army camp = `tent` + `drum`; war = `P.fire`. Sun and moon high (y 180–320), never behind a plaque. Set pieces stand at the sides or behind the actors (one piece ≤ 760 px wide), never as a wall between them; change the set with the scene: no set piece on more than 2 pages of the film.
- **Puppets carry every page.** `P.puppet` at 480–580 px (default 520) for the actors of the scene, standing in the middle of the cloth (x 400–1520), at most 3 on screen, at least 300 px apart, facing each other across the cloth when they talk (`face: 'l'` for the one on the right). Decide the cast once and keep each character's role, dyes, mask and prop identical on every page. Opera colour tells the viewer who is who at a glance: open hollow-carved face (`mask: 'open'`) for heroes, ladies and the people; `mask: 'red'` the loyal and brave; `mask: 'black'` the stern and upright; `mask: 'white'` the schemer. Give the main figure the prop that is the point of the scene (`holds`: the jade disc, the edict scroll, the sword, the feather fan of a strategist).
- **Numbers, crowds and scale are staged, not charted.** Many people, soldiers or years: `P.troupe` (3–7 small figures, size 260–340). A great power or a natural force: `P.dragon`, `P.tiger`, a huge `P.fire`, rising `P.water`. A quantity: a counting plaque (`text` as a function of lt) next to the thing being counted. A comparison: two figures or two troupes of different size on either side of the cloth. A journey: a figure walking (or `P.horse` galloping) from one set piece to another. A hidden cause: `P.hand`, the puppeteer's shadow behind the figures.
- **Words are cut into leather.** The only text is `P.plaque`: a name, a place, a date, the key term, a number — 2–8 汉字 or 1–4 English words, size 56–96, an optional `sub` line ≤ 12 characters. At most 2 plaques on screen; place them in the upper cloth (y 220–420) clear of heads and props, and lift them off (`out`) before the next. A name beside a figure or a line of verse: `vertical: true`. The page title is carved into the lintel above the screen by `P.title` (≤ 14 汉字 / ~6 English words).
- **Dyes.** Vermilion `red`, malachite `green`, ochre `yellow`, indigo `blue`, aubergine `purple`, flame `orange`, raw hide and ink. One main dye (`color`) and one trim per character; at most 4 dyes per scene besides hide and ink. Never colour the cloth itself; dim it with the lamp.
- **Plain primitives are not used.** No `P.text`, `P.box`, `P.arrow`, `P.icon`, `P.chip`, `P.card`, `P.code`, charts or hand-drawn lines on the cloth: everything is a carved piece from the kit.

## Motion and camera

- **Pieces arrive pressed onto the cloth.** Every component comes in at `at` large and blurred and snaps sharp in 0.5 s, the way a puppeteer presses a figure to the screen; set pieces first (at 0–0.8 s), then puppets on their cues (`at: P.c(i)` or `P.cw(i, '词')`). Pieces leave by lifting off (`out`): they grow, blur and fade. Nothing slides in from an edge except a walking figure, and nothing pops.
- **Puppets act on the words.** Change `pose` on the cue or word it belongs to with keyframes: `pose: [[0, 'stand'], [P.cw(1, '拒绝'), 'halt'], [P.c(2), 'bow']]`. A page needs at least 3 changes of pose, prop, position or lamp. Vocabulary: `walk` `run` `point` `raise` `bow` `kneel` `fight` `think` `cry` `present` `halt` `angry` `proud` `sad` `fall`. Walk a figure across with `x: lt => PV.lerp(x0, x1, PV.clamp((lt - t0) / dur))` at 120–250 px/s and `pose: 'walk'`; a horse with `gait: 'walk' | 'gallop'`. Puppets tremble in the hand and their plumes, ribbons, beards and sleeves swing on their own: never add wobble yourself.
- **The lamp is the mood and the clock.** `P.lamp({ keys: [[t, level], …] })`: dim to 0.35–0.5 for night, a secret, defeat or the passing of years; bring it back to 1 for the dawn or the answer. A page starts lit (`from: 1`) unless it opens a new act.
- **The signature move.** The film opens on a dark screen: the first page calls `P.lamp()` (the lamp comes up over 1.4 s) and the first puppet is pressed on at 1.2–2 s. At the turn of the story — the moment the idea changes everything (a fall from power, a soul leaving, a legend outgrowing the person) — one figure standing near the centre of the cloth (x 760–1160; walk it there first if it was elsewhere) lifts toward the lamp on that word: `lift: lt => PV.clamp((lt - P.cw(i, '词')) / 1.5) * 0.9`; its shadow swells soft, dark and two to three times its size over the scene; hold it 1.5–3 s, then lift it off (`out`). Nothing else enters while it grows, and no plaque sits where it grows (the shadow grows away from the lamp point, x 960, y 430). Once per film, twice at most.
- **Camera: the audience seat.** The frame never moves; the shot is locked wide. One `P.push` (≤ 1.15×) onto the face of a decisive moment per page at most, then `P.back`. No shakes, no pans, no whip moves.

## Pacing

- First 2 seconds: the lamp coming up (first page) or the set already lit, and a set piece on the cloth; a puppet by 2 s.
- 8–14 seconds a page, one scene a page; a visible change every 2–3 seconds (a figure pressed on, a pose, a plaque, the lamp, a step of a walk).
- Each page is one step of the explanation acted out: who wants what (the figures arrive) → what happens (the action, on the word) → what it means (the plaque with the name, number or term).
- The film ends like a show: the figures turn to the audience in `bow`, and the lamp goes down (`keys: [[0, 1], [P.endT - 1.2, 0]]`). Never end on a plaque alone.

## Not this

- **Paper-cut (剪纸):** flat red paper cut in symmetric window flowers, no light behind it. Here every piece is translucent dyed leather in several colours, jointed, on rods, glowing on a lit screen.
- **Ink wash (水墨):** brush strokes, ink blooms and empty white paper. Here there is no brush and no wash: only carved hide with crisp pierced holes on an amber cloth.
- **Ukiyo-e:** woodblock outlines, flat printed colour and gradated skies. Here colour is light coming through dye, and there is no sky gradient — only the lamp.
- **Collage:** photographs, torn paper, mixed textures. Here every object is one material: pierced, dyed leather.

## Never

- A front view or a three-quarter face: every figure is in strict profile, facing left or right.
- Smooth morphing, squash and stretch, or bouncing: leather pieces only turn on their rivets, slide on their rods, lift off, or are swapped.
- Particles, glows, sparkles, gradients, drop shadows, emoji, icons, photographs, flat vector shapes, or any hand-drawn primitive on the cloth.
- Lifting a figure that stands near an edge (its growing shadow is pushed off the cloth) or keeping a lifted figure on screen longer than 3 seconds.
- More than 3 puppets plus one troupe, or more than 2 plaques, on screen at once; figures floating above the ground strip (except on a cloud, a horse or flying creatures).
- A plaque longer than 8 汉字 / 4 English words, a paragraph, a bullet list, a table, a timeline drawn as a line.
- A character changing its dyes, mask or role between pages; a lamp below 0.3 while a plaque must be read.
- Anything outside the cloth (x < 80, x > 1840, y < 130, y > 890): the frame covers it.
