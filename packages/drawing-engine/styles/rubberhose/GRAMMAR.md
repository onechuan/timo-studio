# Rubber-hose cartoon · grammar card

Reference: the Fleischer and early Disney shorts of 1928–1934 (and their modern heirs, such as Cuphead): characters with noodle limbs, pie-cut eyes and white gloves who never stop bouncing, props that grin back at them, iris transitions and ornate title cards, all on warm two-strip colour film. The idea is acted out by characters, not diagrammed.

**This style overrides the general rules about people.** "Never draw faces" and "show only hands, a back or a silhouette" do not apply here: cartoon characters with faces are the whole point. In the storyboard, set `cast` to `"silhouette"`, name the characters in the beats as the objects that act (e.g. object "红色小人（现在的我）", action "抢过拉杆，乐得蹦起来"), and give every page at least one character beat. On the page, draw them with `P.toon` (full body, face and all), never as loose gloves or hands. A glove alone is only for a close-up insert.

## In one sentence

A tiny cartoon troupe acts the idea out: one or two characters with a clear personality bounce on the beat through a stage set, the props have faces and opinions, and every point lands as a gag (a take, a burst, a pratfall), so the viewer laughs first and remembers the idea because of it.

## Picture

- **Characters carry every page.** Each page has at least one `P.toon` at a readable size (360–480 px tall, feet on the ground line y ≈ 860). Decide the cast once for the whole film and keep each character's look identical on every page (same `body`, `pants`, `hat`, `glasses`, `accent`): for example, the impulsive one is red with a propeller cap, the sensible one is teal with a bowler and glasses. Two characters always bounce in counterpoint (`ph: 0` and `ph: 0.5`) and face each other (`face: 'l'` for the one on the right).
- **Every page is a set.** Start each page with a backdrop, `P.scene('room' | 'hills' | 'stage' | 'night' | 'mind' | 'sunburst')`, and build on it. Never leave the bare paper as the scene, never draw scenery with boxes. `mind` (inside the head, with a control desk and levers) is for thoughts, impulses and decisions; `stage` for a showdown or a reveal; `sunburst` for a triumph or a big number.
- **Props have faces.** Use `P.prop` for the objects of the story: an alarm clock that rings and panics (`ring`), a buzzing phone, a lit bomb for a deadline, an hourglass draining, a calendar with the day on it, a money bag, a trophy, a bulb for an idea. A prop is the second actor of a page; make it big (160–260 px) and let it react. A character can carry one (`holds`).
- **Text is sparse and physical.** Words appear as things in the world: a name on a `P.sign`, a line of dialogue in a `P.balloon`, an inner voice in a thought balloon (`think: true`), a punchline or a number in a `P.burst`, a date on a calendar. At most two blocks of words on screen at once, each 6–10 Chinese characters (about 3–5 English words); never a paragraph, never bullet lists, never a box-and-arrow diagram. The page title is a vintage title plate (it is drawn for you by `P.title`).
- **Palette.** Two-strip colour on cream stock: `red` (tomato) and `orange` (marigold) against `blue` (a two-strip teal) and `green`, with `yellow` for highlights and `ink` for every outline. Give each character one main colour and keep it. Fills are flat cel colour with a heavy ink line; no gradients, no shading beyond what the kit draws.
- **One film gate for the whole film.** Grain, a soft flicker, a rare scratch and rounded gate corners are already on every frame. Don't add more noise; the motion has to come from the characters.

## Motion and camera

- **Everything is on the beat.** Characters, props, signs and backdrop pieces bounce once a beat with squash and stretch, at 12 drawings a second. That is the look: don't fight it with smooth slow tweens. Hand-drawn groups join the dance with `P.boing(layer, ax, ay)`.
- **Act the idea with poses.** Change a character's `pose` (and `mood` when needed) on the cue it belongs to with a keyframe list: `pose: [[0, 'idle'], [P.c(1), 'point'], [P.cw(2, '五十分钟'), 'surprised']]`. A page needs at least three changes of pose or prop state. Vocabulary: `walk` / `run` across the set (x as a function of lt), `point` at the thing, `shrug`, `think` (with thought dots), `surprised` (the classic take: stretched, hat flying, take lines), `jump`, `cheer`, `wave`, `sad`, `sleepy`, `push`, `hold`, `sit`, `bounce`.
- **Gags land on words.** A burst, a take, a `P.fx` ('exclaim', 'question', 'stars', 'sweat', 'hearts', 'zzz', 'dust', 'sparkle', 'notes') or a prop going off lands exactly when its word is spoken (`P.cw`). One big gag per page.
- **Camera like a cartoon.** Wide shot by default; `P.slam` onto the face of a take or a burst, `P.push` onto a prop when it matters, `P.back` after. At most one move per beat of the story.
- **Transitions.** The film opens with `P.iris({ mode: 'in' })` on the first page, usually on a `P.titleCard('…', { sub })` that hides (`out`) as the first scene appears; the last page ends with `P.iris({ mode: 'out', at: P.endT - 0.6, x, y })` closing on the hero. A new chapter may open on another `P.titleCard`.

## Pacing

- Within the first 3 seconds: the title card, then a character on its set doing something.
- 8–14 seconds a page, a visible change of pose, prop or gag every 2–4 seconds.
- Structure each page like a short gag: setup (character wants something) → complication (the prop or the other character) → punchline (take, burst or reversal). The idea of the narration is the punchline.
- End on a character's pose and an iris out on them, never on a card of text.

## Kit (registered automatically)

`P.scene`, `P.toon`, `P.prop`, `P.sign`, `P.balloon`, `P.burst`, `P.fx`, `P.titleCard`, `P.iris`, `P.boing`; their exact options are listed with the components. Create the backdrop first, then props and characters back to front; balloons, bursts and fx last. Anything given as an option "fn" may be a value, a function of lt, or a keyframe list.

## Never

- A slide: a title, bullet text and a diagram with no character on screen.
- Small characters lost in the frame, characters that stand still for a whole page, or a different look for the same character on another page.
- Modern flat-vector style, gradients, neon, glows, drop shadows other than the kit's, photo material, emoji.
- Boxes and arrows as the main picture (a single arrow or a number on a sign is fine).
- More film noise, sepia overlays or blur on top of the gate; text in the subtitle band (y > 900).
