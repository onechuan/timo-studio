# Broadsheet · grammar card

Reference: the data desk of a great financial newspaper — the salmon front page, a "chart of the day", a pull-quote, a stock ticker running under the fold. The film reads like the paper come alive: every number is set in type, every chart builds the way an editor would explain it, and one claret accent tells you where to look.

## In one sentence

A financial editor walks you through the evidence: a headline states the conclusion, the axes go down first, the data grows into them, and exactly one thing gets annotated — then the camera pushes in on it.

## Picture

- **Salmon newsprint.** A warm pink paper with fine grain; nothing glows, nothing is glossy. Lighter "paper" cards (clippings) sit on it with a soft shadow. Use `paper` for those cards, never white.
- **Type is the design.** Headlines and big figures are bold serif (`P.headline`, `P.bigNumber`, `P.splash`, and every `P.title` is already a newspaper headline with a claret bar and small-caps kicker). Labels, axes, units and sources are clean sans. For your own serif text pass `cls: 'serif'` to `P.text`; numbers set in type use `font: 'latin'` (a lining serif). Body copy is never written out: use `P.body` (typeset grey column lines) for front-page density, in its own column block — objects (a banknote, a clipping) sit beside the columns, never on top of them.
- **One accent: claret (`red`).** It is the story — the line that matters, the bar we are talking about, the loss. Oxford (`blue`) is the comparison or the neutral series, teal (`green`) a good outcome, mandarin (`orange`) a warning. Everything that is not the story fades to `faint`/`muted` grey (`P.barChart` does this with `focus`). Never more than claret plus one other colour per chart.
- **Charts are the subject and they fill the page.** A chart spans most of the content area (x 140–1780, y 220–840), never a small box in the middle. Horizontal gridlines only, tick values on the right, a solid ink baseline at zero; bars always start at zero; a line chart whose axis does not start at zero says so in its unit line. Every chart page ends with `P.source('来源：…', { badge: '示意数据' })` — the badge only when the numbers are illustrative.
- **Newspaper furniture gives it place.** Open the film on a front page: `P.masthead` (the paper's name, dateline with the year the story starts) + `P.headline` + `P.body` columns + one object (`P.banknote`, a `P.clipping`). Use `P.clipping` for "the papers said…", a historical event, a price from the past; `P.ticker` to run live markets along the bottom (y ≈ 790); `P.quote` for a famous line; `P.rule` for column and section rules.
- **Money is drawn as money.** `P.banknote` is an engraved note (guilloche rosette, fine-line ground); its `worth` option shows purchasing power being eaten (a dashed claret cut with the lost part fading to a ghost) — the signature image for inflation, interest, savings.

## Components (already loaded; call them directly)

| Need | Use |
|---|---|
| A trend over time | `P.lineChart(x, y, w, h, series, { labels, unit, dataAt, dur, note, bands })` — the line draws through time with a solid value tag riding its head; `note` pops the moment the head passes that point; `bands` shade a period (a crisis) |
| Comparing amounts | `P.barChart(x, y, w, h, items, { focus, focusAt, unit, fmt })` — each bar grows as its year/name is spoken (`items[i].at = P.cw(...)`), then the story bar turns claret and the rest go grey |
| Who is ahead / rank changes | `P.rank(x, y, w, rows, { max })` — a bar-chart race; pass `value: (lt) => …` to make rows overtake each other |
| The same pattern in several places | `P.smallMultiples(x, y, w, h, panels, { focus })` |
| One number that matters | `P.bigNumber(x, y, { value, suffix, land: P.cw(i, 'word') })` beside an object, or `P.splash({ value, kicker, line, land, spark })` for THE number of the film: a claret band wipes across and the figure lands in huge paper-coloured serif |
| Pointing at one thing | `P.callout(px, py, tx, ty, text, { sub })` — dot → leader → serif label |
| Front page | `P.masthead`, `P.headline`, `P.body`, `P.rule` |
| Evidence and colour | `P.clipping({ head, kicker, date, deck, photo })` (photo: `true` city, `'crowd'`, `'market'`), `P.quote`, `P.ticker`, `P.banknote` |

## Motion and camera

- **Build in editorial order:** structure → data → emphasis → annotation. Gridlines draw left to right, then the data grows into them, then the focus colour changes, then one callout. Each stage 0.4–1.2 s, ease-out, no bounce; numbers count up and **land on the spoken word** (`land: P.cw(i, '五十五')`), then hold at least 0.5 s.
- **Lines draw through time**, not by length: a steep stretch draws fast and reads as a surge. Set `dataAt`/`dur` so the head reaches the end exactly when the narration names the final value.
- **The camera is an editor's eye.** Wide on the full page while it builds; when the narration points at a value, a pulse push (`P.push(t, x, y, 1.15–1.3)`) onto that point and hold; pan to the next item on the same page (`P.pan`). No slow drifts, no shakes, no slams except a market crash.
- **Count in the direction of the story.** A loss counts down (`from: 100, value: 55`), a gain counts up; never count a shrinking amount up from zero.
- **Paper things move like paper.** Clippings slide in and settle at an angle; the splash band wipes like a page being turned; the ticker scrolls at a constant speed.

## Pacing

- First 3 seconds: a front page or a striking figure — never an empty chart frame.
- One chart (or one front page) per page, 8–15 s; a visible change every 2–4 s (a bar grows, a line passes a year, a tag lands).
- Don't use the same layout three pages running: after two charts, cut to a splash, a clipping, a quote or a banknote.
- Use `P.splash` once (twice at most) for the film's key number; end the film on the conclusion landing — a final figure or the story line reaching its end — not on a recap slide.

## Never

- Neon, glows, gradients skies, glass cards, dark mode, 3D bars, pie charts that spin, bouncing bars.
- White cards or pure white backgrounds (everything is newsprint or `paper`).
- Hand-drawn wobble, chalk, marker, pencil hatching (other styles).
- Truncated bar axes; annotating more than one thing per chart; more than two coloured series fighting for attention.
- Big paragraphs of text on screen; text smaller than 24 px; anything in the subtitle band (y > 900).
- Inventing precise "real" statistics: if the numbers are illustrative, the source line says so and the badge is on.
