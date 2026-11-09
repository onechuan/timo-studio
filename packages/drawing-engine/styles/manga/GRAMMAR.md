# Manga · grammar card

Reference: black-and-white Japanese weekly manga, the shōnen and slice-of-life pages of Shūkan Shōnen Jump and the school and workplace manga after it: G-pen ink lines that swell and taper, screentone instead of grey, panels cut by slanted white gutters, concentration lines, big eyes, sweat drops and vein marks, and hand-lettered sound effects (ドン, ゴゴゴ). It suits psychology and personal growth, school and workplace life, motivation and habits, an abstract enemy fought as a shōnen showdown ("the procrastination boss"), and science told through one character's epiphany.

**This style overrides the general rules about people.** "Never draw faces" and "show only hands, a back or a silhouette" do not apply: a manga protagonist with a face is the point. In the storyboard set `cast` to `"characters"`, name the characters in the beats as objects that act (e.g. object "黑发校服的主角", action "瞪大眼睛，冷汗直流"), and give every page at least one character beat or the boss.

## In one sentence

The film is a manga chapter that draws itself on the narration: panels cut in one by one with a character reacting in close-up, words arrive in balloons and narration boxes, dread builds with ゴゴゴ, and at the turn of the story one panel slams to full frame with concentration lines and a giant ドン as the character finally understands.

## Picture

- **Black ink and screentone on white. Nothing else.** Grey exists only as dot tone (`P.tone`, a panel's `tone`) or dot gradients. The spot colour `red` is allowed on exactly one page, the climax, and only for one thing there: the `P.realize` sound effect (`spot: true`), a `P.sfx` with `style: 'spot'`, or a prop label (`spot: true`). Never use `blue`, `green`, `orange`, `purple` or `yellow` for meaning; they print as greys.
- **Every page is a manga page of panels.** Start with `const R = P.grid('…')` (layouts `full 2 3 1+2 2+1 top+2 2x2 slash strip`), then `const A = P.panel(R[i], { at, tone })` for each rectangle and draw that panel's contents on `A` (`A.scene`, `A.chara`, `A.prop`, `A.focus`, `A.balloon`). `R` comes back in manga reading order (right panel first). Until a panel cuts in, the kit shows it as a faint pencilled frame; the first two panels are inked within the page's first 2 s and every rectangle by 40 % of the page (a pencilled half-page is not a picture). **A panel cuts in with its subject**: the character, boss or main prop of a panel takes the panel's own `at`; later cues change its mood, add balloons, lines, effects or a second prop, never the subject itself (no boss rising into a panel that sat empty for seconds). Change the layout from page to page; use `slash` for a confrontation or a before/after, `strip` for an eye close-up over a big panel, `full` only for a splash.
- **The protagonist carries the film.** `A.chara(cx, cy, size, { mood, hair, hairTone, outfit, glasses, talk, emote })`: (cx, cy) is the middle of the face; a close-up is 520–760 px, the face in the upper half of its panel, the body running out of the bottom border. Decide the cast once and keep each character's `hair`, `hairTone`, `outfit` and `glasses` identical on every page (for example the protagonist `hair: 'spiky', hairTone: 'black', outfit: 'school'`; a colleague `hair: 'bob', outfit: 'suit'`; the mentor `hair: 'neat', glasses: true`). Moods: `calm happy shock determined despair smug crying angry`, switched on the spoken word with a keyframe list (`mood: [[0, 'calm'], [P.cw(1, '截止'), 'shock']]`). At most two characters on a page. Set `talk` while the narration is the character speaking.
- **One panel per page is an extreme close-up or a reaction.** `A.eyes(cx, cy, w, { mood })` in a thin wide panel (the top of `strip`) for resolve or dread, or a face filling its panel.
- **Abstract enemies are a boss.** Procrastination, the deadline, anxiety, the exam: `A.boss(cx, cy, size, { label: '拖延大魔王', mood })` on a `tone: 'black'` panel with `A.aura` behind it, and `P.menace` (ゴゴゴ) beside it. When the hero wins, `defeat: t` shatters it.
- **Things are inked props.** `A.prop(kind, cx, cy, size, { label })`: `phone clock alarm book laptop paper coffee bulb trophy calendar bed game`, 180–360 px, one or two per panel. A number in the story goes on a prop label (a score on `paper`, a time on `phone`, a date on `calendar`) or into a `P.sfx`.
- **Every panel has a place.** Call `A.scene(kind)` first on a panel that shows a place: `classroom office street room sky night`; `sparkle` for joy, `dark` for dread or the inner world. A reaction panel may be a plain `tone` or `focus` ground instead.
- **Words live in balloons, captions and sound effects.** Speech: `A.balloon(cx, cy, '…', { tail: chara.mouth })` (Chinese up to 18 characters is lettered vertically on its own; `kind: 'shout' | 'think' | 'whisper'`). Narration: `P.caption(x, y, '…')` in a panel corner (`dark: true` for an inner voice). The one word that lands: `P.sfx(cx, cy, 'ドン')` (also `ガーン` for a shock, `ザワ…` for unease, `咚` / `轰` / `BOOM`). Each balloon ≤ 14 Chinese characters or ≤ 8 English words; at most 2 balloons, 1 caption and 2 sound effects on a page. Japanese is used only inside sound effects.
- **The title** is `P.title('…')`, a black chapter tab at the top left; nothing else goes in the band above y 150.
- **Plain primitives** (`P.text`, `P.box`, `P.arrow`) only for a tiny label the kit cannot make; never for the main picture.

## Motion and camera

- **Cut, don't drift.** Panels cut in on their cue (`at`) in reading order; characters change expression in one frame on the word; balloons pop; sound effects slam and shudder, then hold. Between hits the page holds still: a manga reads in stillness broken by impacts.
- **Energy is lines, not movement.** `A.focus` (concentration lines) behind a shock or a reveal, `A.speedlines({ angle })` for a dash, a fall or time rushing past, `P.menace` + `A.aura` while dread builds. They flicker on their own; don't add motion of your own.
- **The signature: the realisation.** Before the turn, ゴゴゴ (`P.menace`) and a `despair` or `shock` face; on the cue where the idea clicks, `P.realize({ at: P.cw(i, '原来'), chara: { …the protagonist's look }, sfx: 'ドン', line: '…' })` slams a full-frame splash over the page. Every film has it: exactly once (twice at most), planned in the storyboard on the cue where the idea clicks, held at least 2.5 s (the kit keeps it that long), and the climax gets its `spot: true`.
- **Camera like a reader's eye.** Wide on the page by default; `P.cam([P.push(t, panel.cx, panel.cy, 1.2)])` onto the panel being read when its punchline lands, `P.back` after; `P.slam` once per page at most, on its biggest sound effect. `P.shake` at most twice in the film.

## Pacing

- Within the first second: the first panel cuts in with the protagonist's face (or the boss) and the title tab.
- 8–14 s a page; a new panel, balloon, expression or sound effect every 2–3 s. Each page has one loudest moment.
- Structure like a chapter: the everyday problem → it gets worse (despair, the boss, ゴゴゴ) → the realisation splash → the hero acts (`determined`) → the result.
- End on a final panel of the protagonist (`happy` or `determined`, `sparkle` scene) with a last narration caption; never on a text card.

## Kit (registered automatically)

`P.grid`, `P.panel`, `P.scene`, `P.tone`, `P.chara`, `P.eyes`, `P.boss`, `P.aura`, `P.prop`, `P.emote`, `P.balloon`, `P.caption`, `P.sfx`, `P.menace`, `P.focus`, `P.speedlines`, `P.realize`, `P.title`; their exact options are listed with the components. Order on a panel: `scene` (or a tone), then `focus` / `speedlines` / `aura`, then props and characters back to front, then balloons, captions and sound effects. Anything marked "fn" may be a value, a function of lt, or a keyframe list.

## Not this

- **Not the 1960s pop comic** (`pop`): no Ben-Day colour dots, no yellow captions, no POW! star bursts, no Lichtenstein faces, no colour panels with hard drop shadows. Manga tone is black dots on white and the panels have no shadow.
- **Not the rubber-hose cartoon** (`rubberhose`): characters don't bounce on a beat, have no pie eyes or white gloves, and the paper is white, not cream.
- **Not the mid-century classroom film** (`midcentury`): no flat colour sets, no presenter with dot eyes, no numbered step cards.
- **Not ink-wash or woodblock** (`ink-wash`, `ukiyoe`): no brush washes, no rice-paper texture, no landscape painting; this is pen and tone.

## Never

- A slide: a title, bullet text and a diagram with no character, boss or prop on screen; boxes and arrows as the main picture.
- Colour: any hue but the one red spot on the climax page; tinted fills, gradients that are not dot tone, glows, blur, drop shadows.
- The medium's pitfalls: a panel on screen for more than 1 s with only its ground, or holding a lone small object; a character smaller than 420 px in a close-up; the same expression all page; a different look for the same character on another page; more than two sound effects on a page (they stop meaning anything); sound effects in plain type instead of `P.sfx`; balloons with no speaker or covering a face; text over the concentration lines' centre; panels huddled in one half of the frame.
- More than one `P.realize` without a reason, or the realisation splash before anything has gone wrong.
- Copying real manga characters, series logos or a real artist's drawings.
- Content in the subtitle band (y > 900) other than a body running out of its panel.
