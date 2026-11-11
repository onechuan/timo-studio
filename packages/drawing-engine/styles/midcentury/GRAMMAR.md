# Mid-century Cartoon · grammar card

Reference: the 1950s UPA shorts and the classroom films of the same decade (Coronet, Encyclopaedia Britannica), the appliance manuals and safety cards of the atomic age, and the flat modernist illustration of Charley Harper and Mary Blair: geometric people with dot eyes, colour printed a little off its line, rooms that are one colour plane, sunbursts, boomerangs and numbered step cards. It suits how-to and set-up guides, product onboarding, everyday know-how and safety, "three steps to…" explainers and habits taught as procedures. The viewer should come away able to do the thing.

**This style overrides the general rules about people.** "Never draw faces" and "show only hands, a back or a silhouette" do not apply: a cheerful presenter with a face is the point. In the storyboard set `cast` to `"characters"`, name the presenter in the beats as an object that acts (e.g. object "橙色毛衣的讲解员", action "指向第 2 步的卡片"), and give every page a presenter beat or a close-up of hands doing the step.

## In one sentence

A calm 1950s classroom film: a geometric presenter in a flat colour room teaches a procedure one numbered step at a time, each step slams in as a card on a spinning sunburst, and the step's one action and one number land on the picture, in a round call-out or a detail tag, never as a slide.

## Picture

- **One set per page, one colour plane.** Start every page with `P.set(tint, { motif })`: `yellow` (mustard, default), `blue` (teal), `red` (tomato), `orange`, `green` (avocado), `purple` (plum, for night or danger), `paper` (cream). Motifs: `room`, `kitchen`, `outdoor`, `blocks`, `night`, `plain`. Rotate the tint from page to page (no two pages in a row on the same tint); the storyboard names each page's tint in its first beat (e.g. "mustard set, room") so the pages follow it. Never paint a background with boxes and never leave the bare paper as the scene.
- **The presenter carries the film.** `P.presenter` stands on the floor line (feet at y 830–860), 460–540 px tall, usually on the left third (x 320–520) facing the action (`face: 'r'`). Decide the presenter once and keep the look identical on every page: same `hair`, `top`, `pants`, `accent`, `tie`, `glasses` (for example `hair: 'flat', top: 'orange', accent: 'yellow', tie: 'red'`). A second character (a learner, a neighbour) gets a different `top` and `hair` and faces the presenter (`face: 'l'`). Never put the presenter on a set of the same colour as the sweater.
- **The thing and its detail.** The object of the step is a `P.thing` (phone, laptop, router, lock, key, shield, door, flame, smoke, germ, soap, faucet, towel, clock, timer, bulb, plug, battery, box, envelope, calendar, cup, pill, plant, house, alarm, extinguisher, toothbrush, apple, book, card, coin, bell, trash, check, cross, star, heart, warning) at 200–320 px. The close-up is `P.callout` (a round magnifier of radius 180–240 on the right half, with `to` pointing at the thing or the presenter's hand); draw the close-up into the layer it returns, with the call-out's own `at`, so the circle never opens empty. Hands doing the step are `P.glove` (inside a call-out or at 240–320 px). Anything the list lacks is built from 2–5 `P.shape` pieces; never from `P.box` / `P.circle` / `P.path`.
- **Numbers and words land on the picture.** The step's one fact is a `P.tag` beside the thing ("20 秒", "50 cm clear", one line ≤ 14 汉字 / about 6 words) or a `P.bignum` (a count landing as its number is spoken). A key word or a rule is a `P.headline` (display 90–140 px; `font: 'script'` for a friendly kicker like "Meet the 20-second rule."). At most two blocks of words on screen at once besides the header. Never a paragraph, never a bullet list, never a box-and-arrow diagram.
- **Connections** are `P.swoosh` (the curved manual arrow with a tomato head): "this goes there", "turn this way". Smoke, water, fire and other big masses are one or two large things (a `smoke` 360 px wide), never a row of ten small copies. Ornaments (`P.ornament`: sparkle, starburst, atom, boomerang, kidney, dots) fill an empty corner or celebrate a result; at most two per page.
- **The header.** A step page uses `P.stepcard(n, title, { of })` and no `P.title`: the card slams into the centre, then docks top left as the page's header. Every other page (the opening, a warning, the recap) uses `P.title(str, { kick })`. The header area (x < 1000, y < 180) holds nothing else.
- **Palette.** Mustard (`yellow`), teal (`blue`), tomato (`red`), coral (`orange`), avocado (`green`), plum (`purple`) on cream (`paper`), every outline the warm brown-black `ink`. Fills are flat; the kit prints them a few px off the line and adds the paper tooth. No gradients, glows or shadows of your own. Give the product one colour for the whole film.
- **Fill the frame.** A settled frame spans x 180–1740 and y 200–860: the presenter on one side, the thing or the call-out (≥ 360 px across) on the other, and a tag, number or arrow between them.
- **Plain primitives** (`P.text`, `P.box`, `P.arrow`…) only for a tiny caption the kit cannot make.

## Motion and camera

- **Limited animation.** The body is a held drawing. Only the arms, the eyes and the mouth change, on twos, with one in-between drawing at each pose change. Change the presenter's `pose` on the cue it belongs to with a keyframe list: `pose: [[0, 'idle'], [P.c(0, 0.2), 'point'], [P.c(1), 'present'], [P.cw(2, '按住'), 'press']]`, and set `talk` true while the narration is the presenter speaking (`talk: [[0, true], [P.ce(2), false]]`). A page needs at least three pose changes or thing state changes (`on`, `open`, `level`, `time`, `screen`).
- **The signature: each step arrives the same way.** On a step page, in the first second: `P.stepcard(n, '…', { of, at: 0.2 })` is called right after `P.set` (its sunburst spins up under the presenter), the presenter goes to `'point'` at the same moment, the card slams into the centre, and 1.6 s later it docks top left. Only then does the step's thing arrive. Nothing else arrives while the card is centred.
- **One action per step, on its word.** The step's action is one physical event timed with `P.cw`: a hand presses (`press: t` on `P.presenter` or `P.glove`), a door opens (`open`), water runs (`on`), a timer fills (`level`), a medallion thumps (`P.medallion`), a verdict stamps (`P.verdict`). Then its fact lands as a tag or a number.
- **Arrivals.** Things, tags and call-outs pop in with an overshoot from `at`; stamps (`P.medallion`, `P.verdict`) thump down in two drawings. Exits are quick (`out`).
- **The camera is the animation stand.** Wide by default. A slow push of a few percent (`P.push(t, x, y, 1.08)`) onto the thing while its fact lands, `P.back` after. At most one move a page; never a shake, a spin or a whip pan.
- **Transitions are circles and colour blocks.** A page may open with `P.wipe({ tint })`; do and don't is `P.split` with `P.verdict` stamps; the film ends with `P.iris({ at: P.endT - 0.8, x, y })` closing on the presenter's face or the finished thing.

## Pacing

- Within the first 2 s: the set, the presenter and either the title or the step card on screen.
- 8–14 s a page; a visible change (a pose, a stamp, a tag, an arrow, a number) every 2–3 s.
- Structure: the problem or the promise in one picture ("Meet the 20-second rule.") → one page per step, each opened by its step card → a tip or a do/don't page → the recap.
- End on `P.recap` (2–5 numbered medallions with their things and labels, ticks landing one by one; the presenter stands left of it at x ≈ 260, facing right), held still for at least 3 s, then the iris closing on the presenter waving or giving a thumbs up. Never end on a text card.

## Kit (registered automatically)

`P.set`, `P.sunburst`, `P.presenter`, `P.thing`, `P.stepcard`, `P.title`, `P.medallion`, `P.callout`, `P.swoosh`, `P.tag`, `P.headline`, `P.bignum`, `P.ornament`, `P.shape`, `P.glove`, `P.verdict`, `P.split`, `P.recap`, `P.wipe`, `P.iris`; their exact options are listed with the components. Order on a page: `P.set` first, then `P.stepcard` or `P.sunburst`, then things and characters back to front, then call-outs, arrows, tags and numbers. Any option marked "fn" may be a value, a function of lt, or a keyframe list.

## Not this

- **Not the 1930s rubber-hose cartoon** (`rubberhose`): no bouncing on the beat, no noodle arms, no pie-cut eyes, no white gloves, no black-and-white film gate. Mid-century people hold still; their limbs are straight with an elbow; their eyes are dots.
- **Not pop-art comics** (`pop`): no halftone dots, no speech-balloon panels, no "POW!" bursts, no heavy black comic outlines.
- **Not flat vector science** (`vector`): no dark night skies, no glow, no shapes without outlines, no zooms through orders of magnitude.
- **Not the warm storybook** (`warm-story`): no soft watercolour washes, no handwriting, no gentle narrative scenes; this is a manual that teaches, with numbered steps.

## Never

- A slide: a title, bullet text and a diagram with no presenter, hand or thing on screen.
- A step without its step card, two step cards on one page, or the header area used for anything else.
- Gradients, glows, neon, drop shadows, photos, emoji, 3D, halftone dots.
- A presenter smaller than 420 px, a different look for the same presenter, or a presenter on a set of the sweater's colour.
- The medium's pitfalls: a call-out with nothing inside it, a tag without the thing it details next to it, text that leaves less than chars ÷ 12 + 1 s to read, an arrow that points at nothing, a thing drawn on its own colour (a teal phone on the teal set), more than three accent colours in one frame, more than two ornaments on a page.
- Content in the subtitle band (y > 900) or under the header (x < 1000, y < 180).
