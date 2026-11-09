# Pop comic · grammar card

Reference: a 1960s comic book page as Roy Lichtenstein and Andy Warhol blew it up — Ben-Day dots, thick black ink, flat process colours, panels, balloons, shouted sound effects. The idea is explained as a comic strip that moves: every beat is a panel, a face reacting, or a word going POW.

## In one sentence

The film is a comic page that assembles itself in time with the narration: panels slam in, a dotted-skin face reacts in close-up, balloons pop out of mouths, and each key moment lands as a big sound-effect burst. Loud, graphic, funny — and every frame could be printed on a T-shirt.

## Picture

- **Cream newsprint, black ink, four inks.** Ground is the style's cream paper (already drawn). Colour comes in flat, saturated fills: `red` (the hit, danger, the shout), `yellow` (captions, bursts, highlight), `blue` (calm, the system, dotted backgrounds), plus `purple` (Warhol magenta), `orange`, `green` for meaning. `paper` is panel white. Black (`ink`) outlines everything, thick (6–8 px). No gradients, no soft shadows — only **hard black offset shadows**.
- **Ben-Day dots everywhere there would be a tone.** Skin, skies, backgrounds and shading are dot fields, not tints: `P.halftone(...)` (use `ramp` for the classic dots-shrinking shade), or `dots` on a panel. Dots are the signature of this style; a page with no dots is not this style.
- **Pages are built from panels that tile the whole frame.** Start every page with `const R = P.grid('1+2')` (layouts: `full 2 3 1+2 2+1 top+2 2x2 L`) and put one `P.panel(R[i].x, R[i].y, R[i].w, R[i].h, o)` on each rectangle. `P.panel` returns a layer: draw the panel's content on it (`const A = P.panel(...); A.face(...)`), everything is clipped and moves with the panel. **The first panel arrives within 0.3 s and is the big one; by the middle of the page every rectangle of the grid is filled** — a comic page never shows large empty paper. Draw each panel's content BIG: the subject fills 60–80% of its panel (a face 80–95% of the panel height, a prop 70%), so nothing floats small in a big box. Give each panel a different ground (paper, a dot field `dots: { color, ramp }`, a flat colour) so neighbours contrast. A slight tilt (±1–2°) on the dramatic one only. Change the layout from page to page.
- **Characters are Lichtenstein faces.** `P.face(cx, cy, size, { mood, hair, look })`: moods `calm smile shock cry think smirk` switch instantly on a cue (`mood: lt => lt < P.c(2) ? 'shock' : 'smile'`). Size 360–620 for a close-up inside a panel. Give the film **one recurring protagonist** (same hair colour every time) so the viewer follows a person.
- **Words live in balloons, captions and bursts — not in floating paragraphs.** A character's thought: `P.balloon(..., { tail: mouth })` (or `think: true`, or `shout: true`). Narration labels: `P.caption(x, y, 'MEANWHILE…')` yellow boxes, top-left of a panel. The one word that matters: `P.sfx(cx, cy, 'POW!')` — huge, outlined, on a star burst, slammed in on the spoken word (`at: P.cw(i, 'word')`). Numbers are sound effects too: `P.sfx(..., '$0.99', { burst: null })`. On-screen text ≤ 6 words per element (≤ 10 Chinese characters); upper-case lettering.
- **Repetition is a Warhol four-up.** "Everyone does it", "a billion times", "the same product": `P.warhol(x, y, w, h, { glyph: '📱' })` (or `draw` your own motif) — clashing colour sets swapping on the beat.
- **Energy marks.** `P.speed(cx, cy)` radial focus lines behind a shock or a reveal; `mode: 'horizontal'` for something racing across; `P.zap(...)` a lightning bolt for a sudden link/idea. Simple props (a phone, a coin, a heart, a brain) are drawn with `P.box/P.circle/P.path` in flat colour with thick black outlines, or as a big emoji inside a panel.
- **Fonts.** `font: 'latin'` gives the heavy display face with a hard black shadow — use it for big statements and numbers; body labels use the default face. Chinese renders in heavy Noto Sans SC automatically.

## Motion and camera

- **Snap, don't drift.** Panels slide in fast (0.38 s, `from: 'left'|'right'|'top'|'bottom'|'pop'`), faces and balloons pop with a slight overshoot, sound effects slam and jitter for half a second, then hold still. Between hits, things HOLD — a comic reads in stillness punctuated by impacts.
- **Read the page like a reader.** Panels arrive left→right, top→bottom, each on the cue it illustrates. The camera pushes into the panel being "read" (`P.push(at, panelCentreX, panelCentreY, 1.15–1.3)`), and `P.slam` on the biggest sound effect of the page (once per page at most). `P.shake` only for a real impact, ≤ 2 per film.
- **Mood cuts, not morphs.** A face changes expression in one frame on the spoken word; a Warhol grid swaps colours on the beat; a panel's background can flip from blue dots to red dots at the turn of the argument.

## Pacing

- Within the first second: the big panel slams in with the protagonist's face or the film's object, plus a sound effect.
- 8–14 seconds per page, a new panel / balloon / burst every 2–4 seconds. Each page has **one** loudest moment (the biggest `sfx` + speed lines + camera slam).
- End the film on a full-bleed panel: the protagonist's final face + a caption like "THE END?" or the takeaway as one shouted line; never a plain text card.

## Never

- Panels huddled in the top half or the left half of the frame, small panels with big gaps of cream between them, or a page whose panels never fill the grid.

- Soft gradients, glows, blur, glassmorphism, drop shadows that are not hard black offsets.
- Thin hairlines or pastel washes; grey text on grey; more than 4 colours in one panel.
- Hand-drawn wobble, pencil hatching, watercolour texture, chalk (those are other styles).
- Paragraphs of text, bullet lists, "title + three cards" slide layouts — every word is in a balloon, a caption or a burst.
- Sound effects on every line (they stop meaning anything): at most 2 per page.
- Copying real comic characters or logos; the faces are generic Lichtenstein archetypes.
