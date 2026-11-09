# Chat Screen · grammar card

Reference: screen-life storytelling (films told entirely on phone and computer screens), anti-fraud public-service videos that replay a real scam chat message by message, and the explainer videos that screen-record a conversation and annotate it. Everything the viewer sees is a generic messaging app on a phone lying on a soft colour ground. It suits anti-fraud explainers, workplace communication, relationships and social psychology, digital etiquette, social phenomena, and how a scam, a rumour or a viral post unfolds.

## In one sentence

The story plays out on phone screens: messages pop in one by one exactly as the narration speaks them, the "typing…" dots hang before every reply, the camera pushes into the bubble that matters, and at the turn a message is recalled or a red warning banner drops over the chat, while white explainer notes on the ground beside the phone name what is going on.

## Picture

- **Every page is screens on a ground.** Call `P.ground({ tint })` first. Then 1 or 2 phones: one phone at x 520–600 with the notes, number or tag on the right half (x 1000–1700); two phones at x ≈ 520 and ≈ 1400 (the two sides of a conversation, before/after, chat and lock screen). Never three phones. A page with no phone is allowed only for a `P.say` cold open or a `P.chat(…, { phone: false })` close-up.
- **Tints carry the mood.** `mint` (default, calm), `sky` (work), `peach` / `butter` (social, viral), `lilac` / `rose` (relationships), `grey` (neutral), `night` (late-night chat, the scam's dark hour), `alarm` (pale red: the page where it turns out to be fraud). Change the tint when the story moves on; never the same tint more than 3 pages in a row.
- **Which component draws what.**
  - A conversation: `P.chat(x, y, { title, messages })`. It lays out, wraps and scrolls by itself; give it 4–9 messages per page. Use the message kinds: `voice`, `image` (scene `chart` is the profit screenshot), `redpacket`, `transfer`, `link`, `file`, `time`, `system`, and the flags `typing`, `typed`, `recall`, `hl`, `zoom`, `read`, `fail`. A group chat is detected from the senders.
  - A bank SMS or a verification code thread: `P.chat(…, { app: 'sms', title: '95588' })`.
  - Notifications arriving: `P.lock` (lock screen) or one big `P.toast` on the ground.
  - The scam phone call: `P.call` with `tag: '疑似诈骗'`. The transfer: `P.pay` (amount typing in, `confirm`, `warn`). A rumour going viral: `P.feed` (counts growing, `flag`) and `P.search` (`hot` with `rise`, `query`, `suggest`). Too many groups / the friend who went quiet: `P.inbox`.
  - The cold open or the line everyone has received: `P.say` (one giant bubble on the ground, ≤ 30 汉字 / 18 words); with `fly: chat.spot(i)` it is the lift of a message out of the phone.
  - On the ground: `P.note` (the explainer's card, ≤ 24 汉字 / 14 words, with `to: chat.spot(i)` to point into a bubble), `P.big` (the one number that matters, counting in), `P.tag` (a verdict pill: '诈骗', 'Rumour', '已读不回'), `P.tap` (a fingertip on the link or button that should not be pressed).
- **The words are the messages.** The real content of the film is what people type. Write messages the way people really text: short, colloquial, with the scammer's tells (urgency, secrecy, a link, money). One idea per bubble, ≤ 30 汉字 / 18 words. The narration explains; the bubbles show.
- **The free side is never empty.** With one phone, the other half of the frame (x 1000–1700) always holds something big from 2 s on: the lifted key line (`P.say` with `fly`), a `P.big` number, a second phone, or a `P.toast`; notes are added on top of that, not instead of it. The lift is this style's way to make a message readable: on every chat page, the one message the narration is about rises out of the phone as a giant bubble, `P.say(1330, 460, sameText, { from, fly: chat.spot(i), at: thatMessage.at + 0.6 })`, and stays until the page ends or the next lift.
- **At most 2 ground elements at once** besides the phones (e.g. a note and a number, or a note and a tag). Notes and numbers sit on the free side of the frame, never over a phone. Keep the zone x 1000–1700 for them when the phone is on the left.
- **Title.** `P.title(str, { accent })` top left, 6–14 汉字 / 2–6 words, on every page. Nothing else above y 150.
- **Colour.** Green = me / sent / safe. Red = fraud, warning, recall, loss. Orange = money, transfers, virality. Blue = the system, a neutral fact. Purple = feelings. A frame uses at most two of red / orange / blue / purple besides green.
- **Plain primitives** (`P.text`, `P.box`, `P.arrow`, `P.icon`) are not used. Everything is a screen, a bubble, a card, a note, a number or a tag.

## Motion and camera

- **Messages land on the words.** Every message's `at` is a cue time: `P.c(i, dt)` or `P.cw(i, '词')`. The bubble pops in as the narration says it or right after. Other people's messages get "typing…" dots automatically when there is ≥ 1.1 s before them; set `typing: 2` to make the wait felt. My messages can be `typed: true` (typed into the input bar first).
- **The signature: the turn.** Every film has one turn page, and the turn uses at least one of: a message `recall` (it shrinks and becomes "对方撤回了一条消息" / "They unsent a message"); `warn: { at, text, sub }` on the phone (a red banner drops, the phone jolts, the screen edge pulses red); `{ from, typing: true, at, until }` dots that hang and never resolve. Time it on the cue word that names the turn. On that page or the next, switch the ground to `alarm` or `night`.
- **The camera pushes into a bubble.** Mark the key message `zoom: true` (1.45×) or `zoom: 1.6`: the camera pushes onto it as it lands and backs out at the next message. 1–2 zooms per page, never on two consecutive messages, and never while a `P.big` or a lifted `P.say` stands beside the phone (the push would cut it): zoom first, lift after. Do not add `P.cam` of your own on a page that uses `zoom`.
- **Highlight before you explain.** When a note explains a bubble: `hl: true` (yellow ring) or `hl: 'red'` on the message, then `P.note(…, { to: chat.spot(i), at })` 0.3–0.8 s later.
- **Numbers count in.** `P.big(x, y, null, { count: [0, 380000], unit: '元', at: P.cw(i, '38万') - 1.2 })`: the count lands on the spoken number.
- **Two phones talk to each other.** The same message appears on both phones at the same `at` (sent on one, received on the other), or the second phone arrives later with `at` and shows the other side.
- **The lift.** 0.5–1 s after the key message lands in the phone, the same text flies out of it with `P.say(…, { fly: chat.spot(i) })` and settles big beside the phone. One lift per page; use the exact same text as the message.
- **Keep it moving.** Something lands every 1.5–3 s: a message, a notification, a count, a note. The phones bob gently; the ground drifts. Nothing else moves.

## Pacing

- First 2 s: the ground, the title and a phone (or a `P.say` bubble) are on screen, and the first message or notification lands by 1.5 s.
- 8–14 s per page, 4–9 messages per chat page.
- Structure: the hook (a message everyone has received) → the conversation step by step, one tactic per page with a note naming it → the turn (recall / warning / hanging dots) → what to do: a short chat where 'me' does the right thing (green, `read`, a `system` line), plus one `P.tag` verdict.
- End on a screen: the last message, a `P.tag` verdict or a warning banner held for at least 2 s. Never end on a text card.

## Kit (registered automatically)

`P.ground`, `P.chat`, `P.say`, `P.lock`, `P.toast`, `P.call`, `P.pay`, `P.feed`, `P.search`, `P.inbox`, `P.note`, `P.big`, `P.tag`, `P.tap`, `P.title`; their exact options are listed with the components. Order on a page: `P.ground` first, `P.title`, then the phones, then notes, numbers, tags and taps. Use the return value's `spot(i)` (a function of time) for `to`; never guess bubble coordinates.

## Not this

- **Not neon noir** (`neon`): no dark tech HUD, no glow, no grid floor. The phone sits on a soft daylight ground (`night` is the one dark tint, and it has no neon).
- **Not flat vector science** (`vector`): no illustrated worlds, planets or birds; the only pictures are inside image bubbles and posts.
- **Not a slide deck or a keynote mock-up**: no bullet lists beside a phone, no headings over boxes, no device mock-up with marketing copy.
- **Not a real app**: no app's real name, logo, icon shape or colour scheme; no brand names in the title bar. Contacts are invented people.

## Never

- A single-phone page whose other half is empty or holds only a small note; a frame where the phone is the only thing on screen for more than 2 s.
- Text blocks on the ground longer than 24 汉字 / 14 words, or more than 2 ground elements at once; paragraphs inside bubbles (> 30 汉字 / 18 words).
- Messages that appear all at once, or not timed to cues; a chat page with fewer than 4 messages; the same `at` for two messages in one chat.
- A note, number or tag over a phone; content below y 890 (subtitles) or above y 150 except the title.
- More than 2 phones, a phone with `tilt` beyond ±6°, two zooms in a row, a `P.cam` on a page that uses `zoom`.
- The medium's pitfalls: a recall with nothing recalled before it is seen (give the bubble ≥ 1.5 s on screen before `recall`), a warning banner on every page (only on the turn), a leader line to a message that has scrolled away (point `to` at one of the last 4 messages), "typing…" dots under my own messages, red used for anything that is not danger or loss, real brand names, real phone numbers or real people.
