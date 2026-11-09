# Mascot Explainer · grammar card

Reference: the cute-mascot money and life explainers of Xiaohongshu, Douyin and Bilibili (an animal host who "算账" with you), Japanese kawaii flat illustration (Sanrio, LINE Friends stickers), and the sticker-and-stamp look of a cute planner. It suits everyday money and life know-how: personal finance, tax and social-insurance rules, a policy explained, consumer tips, subscriptions and fees, "is it worth it" decisions, life hacks. The viewer should come away knowing the number and what to do.

**This style overrides the general rules about people.** "Never draw faces" does not apply: a cute animal host with a face is the point, and people in the story may appear as round cartoon figures (`P.person`). In the storyboard set `cast` to `"characters"`.

## In one sentence

A cute animal host stands beside the picture and does the maths with you: things pop onto warm cream paper as fat, outlined, pastel stickers, the host points its paw at each big number as it lands, coins drop into a pouch while the total counts up, and a round stamp slams down the verdict.

## Picture

- **One host for the whole film.** Choose it in the storyboard and write it into the `summary` as "Host: the cat" (or bear, bunny, fox), and name it in the beats as an actor ("the cat host points at 3600", "猫咪主持指向 3600"); in beats never call it a mascot, a cartoon character or a face, nor 吉祥物 / 卡通形象 / 表情 (say "瞪大眼睛", "皱眉"). Every page calls `P.mascot(...)` once, first. The first page passes `who` ('cat' blue-grey, 'bear' honey brown, 'bunny' white, 'fox' orange); the film keeps that character on every page whatever later pages pass. Pick it by subject: 'fox' for shopping, prices and consumer traps; 'bear' for home, family, housing, cars and insurance; 'bunny' for health, daily life and time; 'cat' for tax, salary, banks and rules.
- **Their own character as host.** When the brief, the brand kit or the uploads have a character or mascot of their own, or the person names one ("our mascot Buzz"), it is the host: never a cat, bear, bunny or fox in its place. Write "Host: Buzz" (their name for it) in the `summary` and name it in the beats the same way. Plan its pictures in `look.pictures`, first in the list: one `{ "id": "host", "kind": "character", "shape": "square", "what": "Buzz, a round cartoon horsefly with big green eyes, standing, facing the viewer, full body", "from": "assets/brand/buzz.png", "pages": [every page] }` (`from` = their own picture of it, so it stays their character; no file: describe it in `what`), then 2–4 moods `{ "id": "host-shock", "like": "host", "what": "the same Buzz, eyes wide, mouth open", "pages": [the same list] }` from shock, happy, think, worry, cheer, point. Every page passes them to `P.mascot`, never to `P.img`: `P.mascot({ who: 'custom', src: '<host path>', moods: { shock: '<host-shock path>', happy: '…' }, place, acts, say })`, with the paths exactly as the page's picture list gives them. A mood with a picture swaps in when an act or its mood names it (`[t, 'shock']`, `[t, 'worry']`); without one the host keeps `src` and still hops, nods, leans and reaches out a small glove to point. If they gave only an SVG, it is the `src` as it is, with no moods. Everything else on this card holds for it: placement, acts, `say`, one host for the film.
- **Where the host stands.** Default `place: 'corner'` (240 px, bottom right): then keep the box x > 1580, y > 620 empty. On the opening page, a page where the host itself reacts (shock, think, cheer), and the last page, use `place: 'left'` or `'right'` (400 px): the host stands on the floor line and the picture fills the other two thirds (x 700–1780 for 'left', x 140–1220 for 'right'). At most one page in a row without the host (`hide: true`).
- **The host acts on cues.** `acts: [[t, 'pose'], …]` with at least 2 changes a page: idle happy point pointL pointR cheer think shock wave book calc nod shrug glasses sad; `[t, 'point', [x, y]]` aims the paw at a thing. `P.bignum`, `P.pouch`, `P.calc` and `P.stamp` make the host point, nod or gasp by themselves; don't add an act within 1 s of them. `say` gives it one speech bubble of ≤ 8 汉字 / 4 words per page at most.
- **Things, not boxes.** Every money thing is a kit object: `P.pouch` (a pot of money: a fund, an account, savings), `P.coin`, `P.thing` (wallet card piggy house car cart bag gift coffee bill safe jar clock bulb shield medicine medkit laptop plane bowl key lock heart star umbrella doc bank chart phone trash), `P.receipt` (a bill, a pay slip, a checklist), `P.pricetag`, `P.calendar` (a date, a deadline), `P.phone` (an app, a form), `P.person` (you, parents, a colleague). Things are 160–320 px; a page holds 1–4 of them. Never build an object from `P.box` / `P.circle` / `P.path`.
- **Numbers are the heroes.** The one number of a beat is a `P.bignum` (130–170 px) placed beside the thing it belongs to, or the total of a `P.pouch`; a sum is a `P.calc` (the rows, a rule, the result counting up). Comparisons of amounts are `P.barchart` (2–6 rounded bars); a quota or a threshold is `P.progress`. Use real numbers from the narration; the number on screen equals the number spoken.
- **Words are stickers.** Short labels are `P.pill` (≤ 10 汉字 / 4 words) next to their thing; a key line is one `P.headline` (≤ 14 汉字 / 7 words). At most 3 pills and 1 headline on screen besides the title. Colour one key word per line with markup (`{o:3600}`), never a whole sentence. Never a paragraph, never a bullet list on a card, never text under 32 px.
- **Verdicts are stamps and stickers.** A decision ends on `P.stamp` ('划算', '别买', '已退回', 'Worth it', 'Skip'; green yes, red no, blue official). Yes / no lists are `P.compare`; a single yes or no is `P.verdict`.
- **The title.** `P.title('…{o:key word}…')` centred at the top, one line, ≤ 16 汉字 / 8 words, on every page except a page that opens on a full-screen `P.bignum`. Nothing else above y 180.
- **Palette.** Coral `red` = cost, trap, don't; `orange` = money, the answer; `yellow` = coins, pills; mint `green` = saved, allowed, worth it; sky `blue` = rules, time, the official side; lavender `purple` = the long run, the special case. Fills are the light `xxxF` tones with the strong tone for the one thing that matters. At most 3 strong colours in one frame. Every outline is the soft brown `ink`; the kit draws them, don't add your own.
- **Fill the frame.** A settled frame spans x 140–1780 and y 190–880: host on one side, the thing and its number in the middle, a pill or a stamp beside them. The main thing is big (`P.thing` 280–360 px, `P.pouch` size 1.2–1.5, `P.receipt` 680+ wide, `P.calendar` 280+); a page whose settled frame leaves a third of the content area empty is unfinished. Line things up on a floor line (y 760–860) or a clear row; nothing floats in a corner by itself.
- **Plain primitives** (`P.text`, `P.box`, `P.line`) only for a hairline or a tiny note the kit cannot make.

## Motion and camera

- **Everything pops.** Things, pills, numbers and cards arrive with the kit's overshoot pop (or `in: 'drop'` / `'slideL'` / `'rise'`), staggered 0.2–0.4 s apart; never all at once and never a slow fade. Leave with `out: t` when the next beat needs the space.
- **Then they stay alive.** The host breathes, blinks and talks; price tags sway; use `wobble: true` on one `P.thing` a page. Nothing else wiggles.
- **The signature move, once or twice a film, on the page with the film's main number:** the host points as `P.bignum` or the `P.pouch` total pops in, the coins drop into the pouch while the total counts up (time `drop` so the count lands as the number is spoken: `drop: P.cw(i, '3600') - 1.8`), a `P.burst` at the pouch, then `P.stamp` slams down the verdict 0.5–1 s later and the host nods or cheers.
- **Changes are physical.** A refund is a `P.coin` with `from` flying back into a wallet; a fee is coins flying out of the pouch; a date changes by flipping the `P.calendar` label; a list grows row by row on a `P.receipt`.
- **Camera: none.** The host stands outside the camera, so a push slides the picture under it. Never call `P.cam`, `P.push`, `P.pan`, `P.slam` or `P.shake`; the pops, the counts and the host's moves are the motion.

## Pacing

- Within the first 2 s: the title, the host and the page's first thing (`at: 0` to 0.3) on screen. The first page opens on the most surprising number or rule in the topic, as a `P.bignum` or a `P.pouch`, with the host in `'shock'` or `'think'`.
- 7–12 s a page; a visible change (a pop, a pose, a count, a stamp) every 2 s.
- Structure: the hook number → the rule or the catch, one per page, each with its own thing and number → the sum (`P.calc` or the pouch) → the verdict.
- End on the recap: a `P.receipt` titled like a bill ("本期账单" / "Your checklist") with 2–4 rows, a `P.stamp` on it, the host in `'book'` or `'wave'` at `place: 'right'`. Hold it at least 2 s. Never end on a text card.
- Film-wide, no camera moves (see above).

## Kit (registered automatically)

`P.mascot`, `P.title`, `P.headline`, `P.bignum`, `P.calc`, `P.pill`, `P.pricetag`, `P.stamp`, `P.verdict`, `P.bubble`, `P.coin`, `P.pouch`, `P.receipt`, `P.calendar`, `P.phone`, `P.thing`, `P.person`, `P.barchart`, `P.progress`, `P.compare`, `P.arrow`, `P.burst`. Order on a page: `P.mascot` first, then `P.title`, then things back to front, then numbers, pills and stamps. Every component keeps itself inside the frame, below the title and above the subtitle band, and steps aside from the host's zone.

## Not this

- **Not the warm storybook** (`warm-story`): no host-less metaphor scene, no slow 1 s ease-outs, no beige quiet; here a cute character talks, and things pop and bounce.
- **Not the 1950s classroom film** (`midcentury`): no off-register print, no sunbursts, no numbered step cards, no human presenter in a sweater; the host is a round pastel animal.
- **Not clay** (`clay`): no 3D shading, no plasticine texture, no soft shadows; fills are flat with one dropped edge.
- **Not crayon** (`crayon`): no wax texture, no scribbled fills, no wobbly child lines; outlines are smooth, round and even.

## Never

- A slide: a title, text cards and arrows with no host, thing or number on screen.
- The host missing from two pages in a row, two different hosts in one film, or a host drawn by hand instead of `P.mascot`.
- A cat, bear, bunny or fox standing in for the person's own character, or their character placed with `P.img` instead of `P.mascot`.
- Anything in the host's corner (x > 1580, y > 620) while it stands there, or anything under the subtitle band (y > 900).
- Gradients, glows, neon, photos, emoji, 3D, halftone, hand-drawn sketchy lines, dark backgrounds.
- The medium's pitfalls: a number on screen that differs from the spoken one; a pill with no thing next to it; a coin or a stamp with nothing to land on; more than 3 pills, 4 things or 3 strong colours in one frame; a pouch total and a `P.bignum` for the same number on the same page; text under 32 px or over 14 汉字 / 7 words in one sticker.
