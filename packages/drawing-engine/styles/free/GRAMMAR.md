# Free · grammar card

This style has no look of its own. It is for the few people who come with a picture in mind that none of the styles is: the director designs the film's look from what they asked, writes it down as this film's style card, and every page is drawn to that card.

## If you are writing the storyboard: design the look

- **The user's description is the brief.** They chose this style because they have a picture in mind, and described it: it is in the notes on this film's look, after this card (and anything more in the topic or the notes). A medium (risograph, linocut, a newspaper, a blackboard, a children's book), an era, a reference, colours, type, a mood, what they don't want: honour every part of it as asked, even where you would choose otherwise. Where it says nothing, choose what fits the rest of it, the subject and the audience.
- **One world, nameable in a few words.** "A 1930s newspaper in two inks", "a museum label on linen", "a lab notebook on squared paper", "a risograph zine in pink and teal". Not a mix of worlds, and not "modern and clean": that is no look at all.
- **It must be drawable here.** Pages are drawn with strokes (rough or ruled), flat fills, type, the component library and a canvas. Grain, halftone dots, ruled lines and paper tints can be drawn. What code draws poorly (people, creatures, real things, an illustrated place, a paper texture) can be generated pictures, drawn by an image model from this card (see the pictures note): so the card's **Picture** part must also say how an illustration in this look is made (medium, line, fills, shading, texture) and how people and creatures look in it, concretely enough for an illustrator to match. No photographs or 3D unless the user asked for exactly that.
- Add `look` to storyboard.json:

```json
"look": {
  "card": "this film's style card, in Markdown (below)",
  "palette": { "paper": "#F2EAD8", "ink": "#1A1A1A", "soft": "#4A4540", "muted": "#8C857B", "faint": "#CFC7B8", "red": "#B3261E", "blue": "#1F4E79" },
  "font": "serif",
  "line": "pen"
}
```

- **palette**: colours by the engine's names. `paper` is the ground, `ink` the main line and text; `soft`, `muted` and `faint` are the ink's lighter greys; `red`, `blue`, `green`, `orange`, `yellow` and `purple` are the accents, and the names are only slots: your strongest accent goes in `red` whatever its hue, and the card says what each colour is for. Give `paper` and `ink` and the accents the look uses; leave the rest out. Ink on paper at least 7:1 contrast, every accent readable on the paper. The light fills (`redF`…) are mixed toward the paper for you.
- **font**, one of:
  - `wenkai`: a warm handwritten kaiti, with Caveat for latin (the engine's own hand)
  - `serif`: Noto Serif SC with Fraunces; bookish, editorial, a newspaper, a museum
  - `sans`: Noto Sans SC with Inter; plain, modern, neutral
  - `grotesk`: Noto Sans SC with Space Grotesk; technical, product, engineering
  - `poster`: heavy Inter Tight and Archivo Black over Noto Sans SC; posters, big type, a strict grid
  - `typewriter`: IBM Plex Mono (Chinese in Noto Sans SC); a typewriter, a terminal, a lab notebook
  - `brush`: Ma Shan Zheng, a Chinese brush hand, with Fraunces for latin
  - `rounded`: ZCOOL KuaiLe; rounded and playful, for children and light subjects
- **line**: `sketch` (a marker or pencil: rough, traced twice), `pen` (a light hand, traced once) or `clean` (ruled geometry, no wobble).
- **card**: 150–400 words, in the language you report in (the user reads its first sentence when approving the storyboard). Write it the way a style's own grammar card is written, as rules a page can be checked against:
  1. **In one sentence**: the look named, so the user recognises it at once. This is the card's first line.
  2. **Picture**: the ground (plain paper, a grid, a texture drawn how), how things are drawn (outline or filled, how detailed), how much of the frame is left empty, where the subject sits.
  3. **Colour**: what each colour is for, and how many may share a screen.
  4. **Type**: the sizes (body text at least 36 px), what is set in the hand face and what in the latin face, where text sits on the page.
  5. **Motion and camera**: how things arrive (drawn, stamped, typed, slid), how much the camera moves.
  6. **Never**: three to five things this look must not do, so a page can't drift into another film's look.
- Write the beats so they can be drawn in that look.

## If you are drawing or reviewing a page

- **The film's style card below is this film's style.** Hold every page to it as you would a style's own card: the same ground, the same line, the same type sizes, emphasis done the same way. A page that would fit another film is wrong, however good it looks alone.
- The palette and the typeface are already set for the film: use colours by name (`ink`, `red`, `redF`…), `font: 'hand'` for the hand face and `font: 'latin'` for the latin face. Don't restate them as hex, and don't bring in fonts or colours the card doesn't name.
- This style has no components of its own. The film may have **its own** (listed in the storyboard's `look.kit`, written before the pages): use them for the things they draw, on every page. Draw everything else with the drawing API and the component library, in the card's manner.

## Always, whatever the look

- Text is readable: body text at least 36 px, never on a busy ground.
- No blue-purple "AI product" gradients, neon glows or glassmorphism unless the user asked for exactly that.
- No faces drawn in code: a person with a face is a generated `character` picture in the card's look (the storyboard's cast rule holds).
