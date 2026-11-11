# Whiteboard sketch · grammar card

Reference: RSA Animate and whiteboard explainer animation (one marker, drawing while talking). These rules come from experience, not frame-by-frame measurement; calibrate them against real sample films.

## In one sentence

Someone stands at a whiteboard and draws their thinking with a marker as they talk. Viewers watch the idea being drawn, not a finished diagram.

## Picture

- **The whiteboard is white.** A near-white ground with only a slight diagonal sheen and very faint erase marks; no paper texture, dot grid or ruled lines.
- **The black marker is the lead.** Structure, outlines and text are all black (`ink`); the four colour markers, red (`red`), blue (`blue`), green (`green`) and orange (`orange`), are only for circling, labelling, ticking and emphasis. At most two colour markers on one screen.
- **Marker lines.** Thick (3.4 by default), a little shaky, traced twice back and forth; line ends need not meet exactly. Boxes may have gaps and arrows may lean a little.
- **Very little fill.** Most boxes are unfilled, leaving the board's own white; when grouping is needed, use a very light `*F` tint with diagonal hatching, like a quick pass with a marker. Yellow (`yellow`) is only a highlighter (`P.mark` / `markSpan`), never a line colour.
- **Stick icons plus handwriting.** Simple icons such as a person, a clock, a gear or a file, with a word or two; text is in the LXGW WenKai handwritten face, each on-screen element at most 8 characters in Chinese (about 4 words in English), body text at least 36px.
- **The picture grows left to right, top to bottom.** The same order as a real person writing on a whiteboard; when a page is full, wipe it (whole-page fade) or move the camera to the next blank section of board.
- **Draw relationships as lines.** Cause and effect with arrows, contrast with a vertical line splitting the board in two, summary with a big circle around several things.

## Motion and camera

- **Everything is drawn.** Shapes are traced (`dur` 0.5–1.0 s) and text is written character by character (`cps` 10–14); no fade-ins, bounces or fly-ins.
- **The pen follows the voice.** Draw each thing the moment its word is said (word cues with `P.cw`); draw slightly faster than the speech, leaving half a beat for viewers to look.
- **Emphasis comes from the pen, not from effects.** At the key moment add one stroke: circle it (`ring`), underline it (`underline`), cross it out (`cross`), tick it (`check`), sweep the highlighter (`mark`).
- **The camera barely moves.** A fixed wide shot by default; push in once on a detail (`P.push`, 1.15–1.25×) and pull back when it is drawn. When the topic changes, pan to another section of board (`P.pan`), like a camera following the hand.

## Pacing

- Within the first 3 seconds the first stroke lands, drawing the most concrete thing in the question this film answers.
- 10–20 seconds per page, something new drawn every 2–4 seconds; whiteboard explainers run faster than illustration.
- End by gathering the whole page's drawing into a circle or one arrow pointing at the last word; never on a centred quote card.

## Never

- Large colour blocks, gradients, shadows, glows, neon, blue-purple tones.
- Photographic texture, 3D, realistic illustration (those are other styles).
- Fading in a whole paragraph at once; the slide layout of "title + three cards".
- More than four colours on one screen, or drawing lines in yellow.
- Paper texture, chalkboard texture, warm kraft-paper grounds (those are study and chalkboard).
