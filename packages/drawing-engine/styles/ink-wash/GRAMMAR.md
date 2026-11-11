# Ink wash · grammar card

Reference: Chinese ink painting (水墨写意) — the landscapes of Huang Gongwang and Mi Fu, Bada Shanren's fish and birds, Qi Baishi's few confident strokes — set moving: the brush writes, the ink blooms on wet paper, mist drifts, water stirs. Good for Chinese history, philosophy, poetry, classics, traditional culture, and any idea that wants calm and depth.

## In one sentence

A painter lays a few strokes on wide bare paper and the paper becomes sky, water and distance: one image per page, painted large, breathing slowly, with a single cinnabar seal on the thing that matters.

## Picture

- **Paper is the protagonist.** Leave at least 40 % of every frame as bare xuan paper (留白). Bare paper reads as sky, water, mist or the moon; never fill it with boxes, cards or labels. One big subject per page, placed off-centre (a third of the way in), never a grid of things.
- **Five tones of ink, one colour.** Everything is ink at different densities: scorched (tone 0.95) for the eye, the spine, the key word; heavy (0.6–0.8) for near things; light (0.3–0.4) for the middle distance; clear (0.15–0.2) for far mountains and ghosts of ideas. Far is pale, near is dark — always. Colour is a thin mineral wash (`wash` with `blue` indigo, `orange` ochre, `green` stone green) at tone ≤ 0.35, on at most one thing. **Red is only the seal** (`seal`) or a red sun (`moon` kind `'sun'`): at most one red mark per screen, on the answer, the conclusion, the name.
- **Draw with the kit, not with boxes.** The kit's components are already registered: use them as the picture's subject.
  - Landscape: `P.mountains` (layered ranges, put the foot low, y 760–880, leave the sky empty), `P.mist` (drifting cloud bands in front of the mountains — almost every landscape page wants one), `P.waves` (calm water), `P.ripple` (rings where something touches water), `P.moon` (the moon left as bare paper with cloud washed around it, or a cinnabar sun).
  - Creatures and life: `P.inkFish` (a Bada Shanren fish; at 1200–1700 px long it becomes a leviathan crossing the frame), `P.inkBird` (a great bird / crane in flight; at span 1200–1600 with `flap` 0.3–0.4 it fills the sky), `P.bamboo` (a swaying branch entering from a corner — gives a still page life), `P.sage` (a tiny robed figure: the human scale; keep it small, h 80–150, against something vast).
  - Marks: `P.inkStroke` / `P.inkStrokes` (brush strokes that write themselves: draw any object — a boat, a rock, a pavilion roof, a willow, a road, a river line, an arrow of thought — as 1–8 strokes), `P.inkBloom` (an ink drop spreading on wet paper: emphasis, a reveal, a transition; r 900–1400 floods the frame), `P.wash` (a soft wash over an area), `P.seal`.
  - Words: `P.vtext` (vertical calligraphy columns — the inscription beside the picture, a quoted line of the classic, a name), `P.bigChar` (one huge character swept in by the brush — the one word the page is about: 道, 鹏, 空, 变), `P.text` with `font: 'brush'` for a short brush-written phrase, the default face (a fine serif) for small labels.
- **Text is an inscription, not a slide.** At most 2 short text elements per page besides the title: a vertical column of ≤ 10 characters, a big character, or a small label (≥ 34 px) beside an object. Prefer quoting the original (北冥有鱼) to explaining. No bullet lists, no tables, no chips, no number cards. Numbers, if any, are written in brush beside the thing (`font: 'brush'`, size ≥ 56).
- **The page title is a vertical inscription down the right edge** (`P.title` does it, closed by a small seal). So keep page content inside **x 140–1640**; nothing in the right column.
- Plain primitives (`P.box`, `P.arrow`, `P.line`, `P.circle`) draw as fine ink lines (白描): use them only for small things — an outline around a word, an arrow made light (`color: 'soft'`). Never box-and-arrow diagrams: show a relationship by placing things in the landscape (big vs tiny, near vs far, above vs below, one fish vs a school).

## Motion and camera

- **Painted, then alive.** Each object arrives the way ink arrives: strokes write (`inkStroke`, 0.4–0.8 s each), washes and mountains bloom up out of the paper (1.2–2.2 s), a character is swept in (`bigChar`, ~1.1 s). Nothing slides or pops in.
- **Then everything breathes.** Once painted, the page never freezes: mist drifts (`mist` speed 20–50), water ripples, bamboo sways, the fish swims (pose changes every frame: x moving, a slow `Math.sin(lt * 0.8)` sway in y and angle), the bird beats its wings and climbs. Give every creature a path that moves through the whole page (`pose` as a function of lt using `PV.lerp` / `PV.clamp` across the page's length `P.endT`).
- **Grand, slow transformations are the signature.** A fish dissolving into a bloom of ink and a bird rising out of it (`inkFish` with `op: lt => 1 - …`, `inkBloom`, `inkBird` with `at` later); a tiny sage against a mountain that keeps rising; a red sun blooming behind the bird. Time the transformation to the word that names it (`P.cw`).
- **Camera like unrolling a scroll.** Wide by default. Pan slowly sideways along a landscape (`P.pan`) or push gently toward the subject (`P.push` at most 1.15×); hold. No shakes, no slams.

## Pacing

- Within the first 2 seconds of a page something is already painted (mountains blooming, a creature in frame); never a blank sheet waiting.
- 10–18 seconds per page, one image per page; a visible change every 3–5 seconds (a stroke written, a seal stamped, the bird crosses the moon, mist uncovers a peak).
- The seal lands last, on the concluding word, as the full stop of the page. End the film on a wide, quiet image with lots of paper and the final seal — never on a text card.

## Never

- Slide-deck layouts: title + cards + arrows, boxes with text inside, bullet points, tables, flowcharts, chips, progress bars, icons (`P.icon`), emoji, logos.
- More than one red mark per screen; red used for decoration; saturated colour anywhere; gradients of colour; glow, neon, drop shadows.
- Filling the frame: no wall-to-wall pictures, no dense textures across the whole page. If the page feels full, remove something.
- Western cartoon faces, clip-art objects, photographic images, 3D, pixel or vector-flat illustration looks (other styles).
- Horizontal text laid over the mountains or the creature; text under 34 px; anything in the right title column (x > 1660) or the subtitle band (y > 900).
