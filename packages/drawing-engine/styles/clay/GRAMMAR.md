# Clay Studio · grammar card

Reference: stop-motion claymation — Aardman (Morph, Wallace & Gromit, Shaun the Sheep), Pingu, the plasticine shorts of children's television — shot on a tabletop set of seamless coloured paper in warm studio light. It suits light explainers, kids' science, everyday psychology and habits: ideas acted out by small clay puppets and the objects they handle.

**This style overrides the general rules about people.** "Never draw faces" and "show only hands, a back or a silhouette" do not apply: clay characters with big glossy eyes are the point. In the storyboard set `cast` to `"characters"`, name each character in the beats as an object that acts (e.g. object "橙色黏土小人（你）", action "抱着手机缩成一团"), and give every page at least one character or one prop with a face.

## In one sentence

A tiny clay troupe acts the idea out on a pastel tabletop set: one or two plasticine buddies handle soft, thumb-pressed props, every point arrives as a squashy pop or a chunky clay word, and the whole thing moves on twos like a hand-animated puppet show.

## Picture

- **A set on every page.** Start each page with `P.set(tint)`: `peach` (default), `mint`, `sky`, `lilac`, `butter`, `rose`, or `cocoa` (a dark set for night, space, the inside of the body, a dramatic reveal). One tint per scene; change the tint when the story moves somewhere new. Never leave the stage bare, never paint a background with boxes. `table: true` adds a wooden tabletop edge for desk-top scenes.
- **The floor line.** Objects stand on the floor at y 820–880 (the buddy's feet at y ≈ 870). Things in the air use `float: true` (they bob and cast a fainter shadow lower down). Everything solid has a contact shadow — the kit draws it; never draw floating flat shapes without one.
- **Characters: `P.buddy`.** 380–480 px tall. Decide the cast once for the whole film and keep each look identical on every page (same `body` colour, `hat`, `accent`, `glasses`): e.g. you = orange with a blue beanie, the sensible one = blue with glasses and a yellow cap. Two buddies face each other (`face: 'l'` for the one on the right) and are at least 700 px apart.
- **Props: `P.prop`.** The objects of the story, 160–300 px, from the kit's list (sun, planet, moon, heart, brain, cloud, drop, coin, clock, bulb, apple, cup, phone, book, rocket, star, gear, battery, tree, house, cell, flame, block, bed, bag, arrow, pill, ball). Give a prop a face (`face: true`, `mood`) when it is a character in the story — a sleepy moon, a worried heart, a cheering coin. A buddy can carry a prop (`holds`). **Anything the list lacks is `P.lump`** (a circle, ellipse, rounded rect, soft blob or soft-cornered polygon of clay, with an optional face or pressed label); build a compound object from 2–4 lumps. Never draw an object with `P.path`, `P.box` or `P.circle`: those are flat and outlined, not clay.
- **Words are clay too.** A key word or a short title: `P.letters` (120–260 px, 2–8 characters; `{word}` for the accent colour; `colors` for a playful word). A number: `P.count`, landing on its spoken word. A label, a name or a line of dialogue: `P.plate` (a pressed slab, one short line ≤ 12 汉字 / ~5 words; `tail` makes it a speech balloon). At most two blocks of words on screen at once. Never a paragraph, bullet list or a slide of text. The page title is a clay slab top left (`P.title`, drawn for you), ≤ 14 汉字.
- **Connections and data.** A link, a path or a flow is a rolled clay snake, `P.coil` (with `end: 'arrow'` or `'ball'`). A comparison is `P.stack` (columns of clay blocks piling up, labels pressed into plates, values in clay type), 2–5 columns. No thin lines, no box-and-arrow diagrams, no charts drawn with the general tools.
- **Palette.** Plasticine pastels: `orange` (apricot), `red` (tomato), `yellow` (butter), `green` (pea), `blue` (sky), `purple` (lilac), `pink` (bubblegum), `paper` (white clay), `ink` (cocoa brown) for dark parts. Each character owns one colour all film. Light comes from the upper left; the kit shades everything — never add flat fills, outlines, gradients or glows of your own.
- **Fill the set.** The composition spans x 180–1740 and y 220–880: a character on one side, the prop or the word on the other, and **something big in the upper half** (y 220–520): a floating prop ≥ 200 px, `P.letters` ≥ 150 px, a `P.count`, or a plate ≥ 360 × 100. A page whose upper half is empty paper, or with one small object in the middle, is unfinished. Every settled moment has one hero ≥ 300 px.
- **Contrast with the set.** Clay words and props never share the set's hue: on `sky` no blue letters, on `mint` no green, on `peach`/`rose` no pink or orange-on-orange. White clay (`paper`) and `ink` read on every pastel set; `yellow`, `orange` and `red` glow on `cocoa`.
- **Plates are readable.** `P.plate` at least 90 px tall with text ≥ 38 px; a coil is ≥ 22 px thick.
- **Plain primitives** (`P.text`, `P.box`, `P.arrow`…) only for a tiny caption the kit cannot make; prefer `P.plate`. Group hand-drawn layers into the motion with `P.squish(layer, ax, ay)`.

## Motion and camera

- **On twos.** Everything moves at 12 drawings a second and boils very slightly between drawings; don't add smooth slow tweens on top.
- **Arrivals squash.** Characters, props, plates and letters pop in with overshoot and settle (the kit does it from `at`). Time every arrival to its cue or word: `at: P.cw(i, '词')`. Letters pop one by one (`stagger`).
- **Act with poses.** Change a buddy's `pose` on the cue it belongs to with a keyframe list: `pose: [[0, 'idle'], [P.c(1), 'point'], [P.cw(2, '突然'), 'surprised']]`. A page needs at least three changes of pose, mood or prop state (`ring`, `on`, `level`, `time`, `color`, `mood`). Vocabulary: `idle bounce wave point cheer think surprised sad shrug walk run jump hold sleepy sit`. Walk a buddy across with `x: lt => lerp(…)`.
- **The signature move: the squash reveal.** Once per page, the key idea lands as a physical clay event on its word: a prop pops in with `P.fx('crumbs')`, a stack piles up block by block, a word squashes onto the floor, a buddy jumps and lands with `P.fx('puff')`. Other `P.fx`: `sparkle`, `sweat`, `hearts`, `question`, `exclaim`, `zzz`, `stars`.
- **Camera like a tabletop rig.** Wide by default. `P.push` slowly onto the face or prop that matters (≤ 1.25×), `P.back` after; at most two moves a page. No spinning, no whip pans.

## Pacing

- Within the first 2 s: the set, the title slab and a buddy or prop on screen doing something.
- 8–14 s a page; something visibly changes every 2–3 s (a pose, a pop, a coil unrolling, a number counting).
- Each page is a tiny scene: the buddy wants or meets something → the prop or the other buddy complicates it → the idea lands as the squash reveal.
- End the film on a character pose (a cheer, a wave, a sleepy yawn) with the key word in clay letters, never on a text card.

## Never

- Objects drawn with `P.path` / `P.box` / `P.circle` / `P.polygon` (flat, outlined): use `P.prop` or `P.lump`.
- Flat vector, outlines, cel shading, neon, glow, photographs, emoji, or drawing a "3D" look by hand: the kit's shading is the look.
- A slide: a title, bullets and a diagram with no character or prop with a face on screen.
- Tiny objects (< 140 px) carrying the page, or a character that stands still a whole page, or a different look for the same character.
- More than two blocks of words, a plate longer than one line, letters longer than 8 characters.
- Content in the subtitle band (y > 900) except the bottom of a buddy's feet shadow, or under the title slab (x < 820, y < 160).
