# Product Tutorial · grammar card

Reference: the best software screencasts. One action per scene, the pointer moving with purpose, a spotlight on the
control, the camera pushing in on the result. Everything the viewer sees is a real screenshot of the Frametell studio from
the recording in `materials/steps.md`, on the studio's own dark ground.

## In one sentence

Each page is one recorded step: the before-shot in a browser window, the pointer gliding to the control as the narration
names it and clicking, the after-shot cross-fading in, and the camera pushing in on what changed.

## Picture

- **One page per step, in the order of `materials/steps.md`.** An opening page (`P.card`) and a closing page (`P.card`)
  are optional. Never merge two steps on one page, and never split one step across pages.
- **Every step page:** `P.step(n, label, { total })` first (the page title), then `P.shot('materials/<NN>-before.jpg')`.
  Use the step's shots exactly as listed in `steps.md`.
- **Boxes come from `steps.md`.** Every `box [x, y, w, h]` line is the control's rectangle in the shot. Pass it to
  `P.cursor`, `P.spot` and `P.typing` unchanged: never invent, round or nudge it. `P.zoom` is the one exception: it takes that
  box grown to include some surrounding context (see Motion and camera).
- **Click step:** spot → cursor (landing on the word that names the control) → swap to the after-shot right after the click
  → zoom on the area that changed if the change is small.
- **Type step:** cursor to the box → `P.typing` with the step's `typed` text → swap to the after-shot when typing ends
  (`typing(...).end + 0.3`). `P.typing` pushes the camera in on the input by itself (studio text is too small to read
  at 1080p otherwise): no `P.zoom` on a type step.
- **A swap is a cut, and it ends what was drawn on the old screenshot.** At `P.swap(win, …)`'s `at` the after-shot shows
  and the old shot is gone in the same frame (no cross-fade, no `dur`). Every spot, click ripple and typing on that window
  that started before it goes with the old shot, whatever its `out`: nothing outlines or dims the after-shot by accident. To point at something on the after-shot, start a new `P.spot` after the swap. The pointer stays.
- **Wait step:** `P.shot` of the first wait shot, `P.swap` to the next shots spaced across the page, and a `P.note` saying
  how long it takes. No cursor.
- **Look step** (`action: look`): cursor with `click: false` and a spot. No swap.
- **Name a control exactly as its label reads** in the shot, which is the `action … on 「…」` line of the step in `steps.md`: the
  step badge and the narration use that word, never a paraphrase.
- **Quote control names in the film's language:** in a Chinese film with 「」 (「导出 mp4」); in an English film with
  English double quotes ("Export mp4"), never 「」. `steps.md` already quotes its `action … on` line that way.
- **At most one `P.note` on screen**, ≤ 20 汉字 / 12 words, for a tip the narration doesn't say (shortcut, cost, what to do
  if it is wrong).
- **Colour.** Amber is "here, click this". Green is "done". Red is only for a cost or a warning.
- **Never** use `P.text`, `P.box`, `P.arrow` or `P.icon` on a step page. The screenshot and the pointer carry the page.

## Motion and camera

- The pointer lands on the cue word that names the control: `at: P.cw(i, '开拍')`.
- Push in (`P.zoom`) when the control or the result is smaller than a fifth of the window. Ease back out before the next
  action, and let the zoom end ≥ 0.4 s before the page ends.
- Zoom on a box that takes in some context around a small control (the control's box grown on every side), not the control alone, and let the kit keep the view inside the window: a push-in
  never shows the window's edge or the dark ground beyond it, even for a control at the window's edge.
- Swaps land 0.15–0.3 s after the click.

## Pacing

- One step is 6–12 s of narration. The narration says what to do, then what happens, then (if any) how long it takes.
- Wait steps are short in the film (≤ 8 s): "about two minutes later…".

## Kit

```js
ENGINE.visual('p03', (P) => {
  P.step(2, '点「开拍」', { total: 8 });
  const win = P.shot('materials/02-before.jpg');
  P.spot(win, [1040, 470, 148, 44], { at: P.c(0, 0.4), out: P.c(1) });
  P.cursor(win, [1040, 470, 148, 44], { at: P.cw(0, '开拍') });
  P.swap(win, 'materials/02-after.jpg', { at: P.cw(0, '开拍') + 0.2 });
  P.zoom(win, [380, 120, 520, 300], { at: P.c(1, 0.3), until: P.c(1, 3) });
  P.note('分镜写好前，你可以随时补充要求', { at: P.c(1, 0.8), kicker: '提示' });
});
```

## Never

- No made-up UI. No drawn buttons, no fake screens, no screenshot that isn't in `materials/`.
- No box that isn't in `steps.md` (for `P.zoom`, only that box grown by context).
- No more than one spotlight or one note at a time.
