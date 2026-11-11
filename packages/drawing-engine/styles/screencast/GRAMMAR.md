# Screencast · grammar card

Reference: polished product-demo screen recordings (the auto-zooming, smooth-cursor recordings software teams publish for launches and help centres, interactive click-through product tours) and the best software tutorial channels. The whole film is one invented desktop app's window on a calm desk, operated by a cursor. It suits software how-tos and tool tutorials, product feature walkthroughs, AI-tool workflows, and office skills: spreadsheets, settings, shortcuts, documents, mail.

## In one sentence

A real cursor glides across one large app window and clicks; the camera eases in on the click, the interface answers (a menu drops, a switch flips, a column fills, a toast says "Saved"), and the camera pulls back so the viewer sees the result in context, one numbered step after another.

## Picture

- **One app for the whole film, declared once.** Pages are drawn separately and in parallel, so the film's app is fixed in the storyboard and copied, never re-invented. **Director:** end the storyboard `summary` with one line `App: P.app({ … })` holding the whole spec: `name` (an invented name: '纪要本', 'Ledger'), `icon` and `color` (its glyph), `tint` (the desk), `sidebar` (its 3–5 items, same order on every page), `toolbar`, `title` (the document or view), and the film's fixed facts: `doc` (the document's name), `date` (one date), `people` (2–4 names), anything else a page might print. **Page agents:** the first line of every page is `const A = P.app({ … })`, copied character for character from that line; then `P.desk()`, `P.title(...)`, `P.window({ active, … })` passing only what this page's view changes (the active sidebar item, a tab). Every date, name and document title on screen comes from `A` (`A.date`, `A.people[0]`, `A.doc`); never write another.
- **Every page is that one window on the desk**, at its default place and size (x 80, y 92, 1760 × 804: it fills the stage, under the title). Change only the view inside it (sidebar item, tab, document). Two windows on one page only for `P.compare` (same options, stacked).
- **Which component draws what.** Everything sits in the window body, in body-local coordinates (the body is 1440 × 712 with a sidebar, 1760 × 740 without):
  - views and navigation: the window's `sidebar`, `toolbar` (tabs, search, buttons) and `win.select(label, at)` to switch view;
  - forms and settings: `P.field` (typing, dropdowns, prompts), `P.toggle` (settings rows, every 96 px), `P.button`;
  - data: `P.table` (a list of records with status chips) or `P.table({ sheet: true })` (the spreadsheet: selection, `reveal` for fill-down, `edit` for formulas, `mark` for highlighting, `freeze`);
  - content: `P.panel` (`card` for dashboard tiles and kanban cards, `ai` for an assistant's answer, `doc` for a document page), `P.label` for headings and copy;
  - responses: `P.menu`, `P.dialog`, `P.toast`.
  - the demo layer on top: `P.cursor` (last on the page), `P.keys`, `P.step`, `P.spotlight`, `P.zoom`, `P.compare`.
- **Fewer items, bigger.** The wide shot must read on a phone: a view has 2–5 large controls, a table ≤ 6 rows × ≤ 5 columns, a list ≤ 5 items, a document ≤ 6 short lines, a sidebar ≤ 5 items. Use the components' default sizes (body text 30–34 px, headings 40–52) and never shrink them; when more content exists, show less of it, not smaller. Lay it out on a grid with 32–56 px margins and let the content span most of the body; never one lonely control in an empty body, never a table that fills only the top third. Leave the bottom 120 px of the body free when a toast will appear.
- **Text is UI copy, at UI sizes.** Labels are what software says ('保存', 'Freeze panes', 'Dark mode'), ≤ 12 汉字 / 6 words, at the component sizes (26–34 px; headings 44). The narration explains; the screen never shows sentences that explain. The only explaining text is the step callout (≤ 12 汉字 / 6 words) and the `keys` `say`.
- **Colour.** The UI is white and neutral grey. `blue` is the ONE accent: the cursor's ripple, the focus ring, the selection, the active control, the primary button. `green` = done/saved, `red` = error/delete/the wrong way, `orange` = warning/pending, `purple` = anything AI writes. Chips in tables use the same meanings. No coloured backgrounds or decorative accents.
- **Title.** `P.title` on every page, 6–14 汉字 / 2–6 words, naming the task ("冻结首行", "Turn on dark mode"). Nothing else above the window.
- **Plain primitives** (`P.text`, `P.box`, `P.arrow`, `P.icon`, charts) are not used: everything is a window, a control, the cursor or the demo layer.

## Motion and camera

- **The cursor drives the page.** Every action is a cursor step: it sets off on its own and ARRIVES at `at`, the cue word that names the action (`P.cw(i, 'Freeze')`). The UI answers 0.1–0.2 s after the click: give the response the same time (`press`, `flip`, menu `at`, `pickAt`, `select` at, `typeAt` ≈ click + 0.3). A step every 1.5–3 s; never two clicks closer than 0.6 s except a double click.
- **The signature: click → zoom in → the UI answers → pull back.** Put `zoom: 1.4–1.7` on the 1–3 clicks per page that matter (the kit frames the control together with its label, row or menu, so don't aim zooms by hand at empty space); the camera eases in as the cursor arrives, holds while the UI responds (a step without zoom whose target is inside the zoomed view keeps it, e.g. the menu item after the menu), and pulls back to the whole window when the cursor heads somewhere else. Use `look: 'menu'` (or a dialog, a column) when the click opens something the camera should frame. End every page pulled back on the result. This is the only camera: no `P.cam`, `P.push` or shakes.
- | Move | What it says | When |
  |---|---|---|
  | zoom in (cursor step `zoom`, or `P.zoom` without a click) | "look here, this is the control" | the click the narration names, a value to read |
  | hold while zoomed | "watch it change" | the menu opens, the switch flips, the cell fills |
  | pull back | "here's what that did" | after each answer, and at the end of every page |
- **Show the step.** `P.step(n, 'Click **Freeze**', { to, at })` pins the numbered badge beside the control as the narration begins the step; the numbers run 1, 2, 3 across the whole film. `P.spotlight` dims the rest when the narration names a control before the cursor goes there (0.8–1.5 s, then out); not on every step.
- **Typing and shortcuts.** Text arrives in fields by typing (`type`, `typeAt`), never all at once. A shortcut is `P.keys` landing its last key on the spoken shortcut, usually instead of a cursor click; the UI answers as the keys release.
- **Departure from the house rules:** the cursor's click ripple and the press dip are this medium's one repeated hit; the caret blinks in a focused field. Nothing else loops or bobs.

## Pacing

- First 2 s: `P.app`, then the window is there at page start (`rise: true` only on the film's first page), the title, and the cursor already moving toward the first control by 1.5 s.
- 10–16 s per page, 2–4 steps per page, one task per page.
- Structure: the problem in the app (the messy sheet, the setting that's wrong) → the steps, numbered, one page each or two → the result held: a toast, a filled column, a `P.compare` before/after. End the film on the finished screen pulled back, held ≥ 2 s.

## Not this

- **Not Chat Screen** (`chat`): no phone, no message bubbles, no chat story; a desktop app window operated by a cursor.
- **Not Tech dark** (`tech-dark`): no architecture diagrams, no code cards, no graphite ground; a light consumer UI where people click things.
- **Not Swiss** (`swiss`): no giant type, no grid poster; the type is UI-sized and lives on controls.
- **Not a slide deck about software**: no bullet points next to a screenshot, no feature callout cards, no arrows drawn on the screen.

## Never

- Real brand names, logos, product layouts, or real people's data; anything outside the window except the title and the demo layer.
- A page without a cursor; a click with nothing answering it; the UI changing before the cursor gets there; a cursor that teleports (always use steps).
- More than 3 zooms on a page, a zoom above 2×, two windows except `P.compare`, `P.cam` of your own.
- Text below 26 px, paragraphs in the UI, content in the subtitle band (the window ends at y 890), the accent blue on anything that is not active or selected.
- The medium's pitfalls: an empty body with one control floating in it; everything visible and finished at page start with nothing left to do (start from the state before the task); a menu or dialog that never closes; a toast covering the control just clicked; step numbers that restart on every page; a spreadsheet wider than 5 columns or longer than 7 rows; a page whose app name, sidebar, date or people differ from `P.app`; text sizes shrunk below the defaults to fit more; a cursor step pointing at an id defined after `P.cursor` (call it last).
