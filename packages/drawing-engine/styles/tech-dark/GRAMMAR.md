# Tech dark · grammar card

Reference: an engineer explaining how a system works in front of a dark editor and architecture diagrams (a tech-conference talk, a source-code walkthrough). These rules come from experience, not frame-by-frame measurement; calibrate them against real sample films.

## In one sentence

A calm engineer takes a system apart with clean diagrams: where the data comes from, which steps it passes through, where it goes wrong. The picture is restrained and precise, like an architecture diagram that moves.

## Picture

- **A graphite ground.** A near-black warm grey, slightly lighter in the middle, with an almost invisible 48px grid; no starfields, halos or gradient skies.
- **The palette is inverted.** `ink` is a warm white and `paper` is a panel one step above the ground; every `*F` fill is a very dark tone, so a box is just "a slightly lighter panel". **Never a glowing light block.**
- **One accent: teal (`blue`).** It marks the main path, the selected thing, the answer. Amber (`orange`) means only warning and cost, coral red (`red`) only error, green (`green`) only success; without that meaning, do not use them. Only one accent colour per screen.
- **Clean lines.** Almost no wobble, single stroke, line width 2.4; right-angle elbows, aligned boxes, even spacing. Fills are flat, with no pencil hatching.
- **Monospace for the point.** Function names, commands, file names, values, ports and latencies are in JetBrains Mono (`` `code` `` markup or `font: 'mono'`); explanations in the body face. Code goes in `P.code`, at most 8 lines per card, with `.hl()` highlighting the line being discussed.
- **The diagram is the subject.** Box-and-arrow flows, sequences, queues, call stacks, memory cells, token blocks (`P.tokens`); numbers sit on the diagram (latency beside the arrow, size inside the cell), never on a separate number card. Each element at most 8 characters in Chinese (about 4 words in English); body text at least 36px (code at least 26px).

## Motion and camera

- **Quick and exact.** Boxes and lines trace in 0.3–0.6 s, code types line by line (`cps` 50–80), values roll into place with a counter (landing the moment they are spoken).
- **Data really flows.** A request is a small block moving along an arrow, a cache hit is a cell lighting up, an error is a path turning red; use `liveRough` / `follow` / `tokens.move` to move things along paths instead of explaining with arrows and text.
- **The camera reads the diagram.** Wide shot by default; when a module is discussed, push in quickly (`P.push`, 1.2–1.35×) and hold, then pan to the next module (`P.pan`) when done. No shakes or slams unless the subject is a crash.

## Pacing

- Within the first 3 seconds, show this film's protagonist: a request, a command, an error, or an odd number.
- 10–18 seconds per page, a visible state change every 3–5 seconds (a cell lights up, a step completes, a line is highlighted).
- End by letting the opening request complete its whole journey (or the opening error disappear), landing on a state change; never on a centred quote card.

## Never

- Blue-purple neon, glowing outlines, gradient halos, cyberpunk, matrix rain, particle effects.
- Large light blocks or white cards (on a dark ground they look like lightboxes).
- Hand-drawn wobble, pencil hatching, paper texture, chalk texture (those are other styles).
- More than one accent colour per screen; red used as decoration.
- Big screenshots of code, code cards over 8 lines, code text under 26px.
