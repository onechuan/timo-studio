# Woodblock · grammar card

Reference: Edo-period colour woodblock prints (浮世绘 / ukiyo-e) — Hokusai's views of the great mountain and his great wave, Hiroshige's stations of the Tōkaidō road, his bridges in sudden rain — set moving: each block of colour is pressed onto the paper in turn, then the sea rolls, mist drifts, rain falls and petals blow across. Good for history, culture, nature, folk stories, journeys, philosophy and any idea that can be told as a view of a world.

## In one sentence

Every page is one print: a deep view with a coloured sky fading into the paper, a far mountain, mist bands, a near scene with one framing object, the words set in a keylined cartouche, and a vermilion seal on the thing that matters.

## Picture

- **One view per page, built in depth.** Compose like a print, back to front: `P.sky` (always first, at lt 0) → far things (`P.peak`, `P.sun`) → `P.kasumi` mist bands across the middle distance (they hide the foot of the mountain and give distance — almost every outdoor page wants them) → the ground (`P.waves` for sea, `P.hills` for land) → the near scene → one big **framing object** at a side edge, cut off by the frame (`P.pine` leaning in, `P.greatWave` towering, a `P.bridge` crossing). Strong diagonals, a low horizon (y 600–720), asymmetry: never centre the main subject.
- **Keylines and flat colour, nothing else.** Every object is a black keyline with flat colour blocks pressed in, a hair off-register, the paper speckling through. Colours are the print's pigments: Prussian `blue` and indigo `purple` carry the picture (sky, sea, distance), `orange` (persimmon) and wood browns for things people made, `green` for pines and fields, `yellow` (ochre) for cartouches and lanterns, pale tones (`blueF`, `redF`, `greenF`) for distance and light. Gradients only as bokashi: a colour fading into the paper or into its light tone at the top of a sky, the crest of a hill, the foot of a mountain (`boka` on `P.block`).
- **Red is rare.** Vermilion (`red`) is the sun, the seal and at most one other mark — the answer, the turning point. Never the Rising Sun's radiating red rays or any war flag, banner or emblem: a sun is a plain disc (`P.sun`).
- **Not every page is the same view.** The great mountain (`P.peak`) is one possible far object, not the style's signature: use it only when the story has a mountain. Otherwise the far distance is a coastline, islands, a town's roofs, a horizon with the sun or moon, open sky. Change the view from page to page — sea, coast, road, bridge, town, field, rain, night — the way a print series moves from station to station.
- **Draw with the kit.** Scenery: `P.sky`, `P.sun` (a plain disc: vermilion sun, or `color: 'paper'` / `'yellow'` for a moon), `P.peak` (the great mountain; `kind: 'red'` for dawn), `P.hills`, `P.kasumi`, `P.waves`, `P.greatWave` (the loudest image: at most once per film, for force, danger or the turning point), `P.rain` (a storm, a sudden reversal, hurry), `P.blossoms` (spring, beauty, things passing; `branch: 'tl'` brings a blossoming bough in from a corner). People and things: `P.traveller` (a small figure in a straw hat — the human scale; faces are never shown), `P.boat` (a long boat with rowers riding the sea; give it a bobbing `pose`), `P.bridge`, `P.pine`. Anything else — a house, a gate, a coin, a scroll, a lantern, a fan, a field, a road — is drawn as one or a few `P.block`s (keyline + colour, `smooth: true` for round things) and `P.keyline`s.
- **Ideas as places on the view.** Show a comparison as two things in the same view (a tiny boat under a towering wave, a near peak and a far one, two travellers on two roads); a process or a list as **stations along a road** (a winding `P.keyline` road through the hills, a small cartouche at each station, a traveller walking from one to the next); growth as a peak rising or a tide coming in; a sudden change as rain sweeping in or the wave curling over. No charts, no boxes-and-arrows: the view carries the idea.
- **Words go in cartouches.** `P.cartouche` is a keylined ochre (or `fill: 'redF'` peach, `'blueF'`, `'paper'`) panel with heavy type: vertical for Chinese, horizontal for English. Use it for a name, a place, a date, a number with its unit (九万里, 66 million years), or the one phrase the page lands on. Numbers of two or more digits and Latin words are set horizontally (the cartouche does it for you); a vertical cartouche holds Chinese words only. At most 3 per page besides the title, ≥ 44 px. `P.vtext` for an inscription column beside the picture (a quoted line). No paragraphs, bullets, tables or chips.
- **The page title is a cartouche.** `P.title` sets a Chinese title as a vertical cartouche at the top right (keep page content inside **x 140–1640**, nothing in the right column) and an English title as a horizontal cartouche at the top left (keep content below **y 170**). Both carry a small seal.
- **The seal closes the page.** `P.seal` (1–4 characters, size 70–110) lands last, on the concluding word, beside the cartouche of the answer. One per page.

## Motion and camera

- **Printed, block by block.** A page begins by printing: the sky fades in from the top, then each object's keyline is cut on and its colours pressed in one after another (each component does this; stagger their `at` by 0.3–0.8 s so the print builds up back to front). Nothing slides in from outside the frame, nothing pops or bounces.
- **Then the world moves, gently.** Once printed the view keeps living: the sea rolls (`waves`), mist bands drift, a boat bobs and crosses, a traveller walks (`x` as a function of lt), petals blow, rain falls. Give every page at least one thing that moves the whole time.
- **Big moments are natural forces.** Time them to the word that names them (`P.cw`): the great wave rises and curls (2 s), rain sweeps in, the sun rises (`rise`), blossoms burst from a bough.
- **Camera like looking at a print.** Mostly still and wide. A slow `P.pan` along a long view (a road, a coast), or a gentle `P.push` (≤ 1.12×) toward the subject; hold. No shakes.

## Pacing

- Within the first 2 seconds the sky and the far scenery are printing; never a blank sheet.
- 10–18 seconds per page, one view per page; something new is printed or changes every 3–5 seconds (the boat appears, a cartouche is set, the wave curls, the seal lands).
- End the film on a wide, calm view — the mountain in mist, the sea rolling, a traveller far away — with the final seal, never on a text card.

## Never

- Slide layouts: title + cards, boxes with text inside, bullet lists, tables, flowcharts, chips, progress bars, icons (`P.icon`), emoji, logos.
- The Rising Sun flag's red rays, war banners, samurai armour, swords as decoration, any militarist or nationalist emblem.
- Faces (people are small, hatted, seen from the side or behind), cartoon characters, anime, photographs, 3D, neon, pixel art, glossy gradients, drop shadows, glow.
- Monochrome ink-wash brushwork (another style): here lines are even keylines and colour is flat and bright.
- Text over busy scenery without a cartouche; text under 44 px; anything in the right title column (x > 1660, Chinese titles) or the subtitle band (y > 900).
