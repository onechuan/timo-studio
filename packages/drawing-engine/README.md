# @frametell/engine

Frametell's video engine. A video is a project directory; the engine plays it, takes snapshots of it and renders it to MP4.

## Project directory

```
<project>/
├── index.html        loads script.js and engine/boot.js
├── engine -> …       a link to this package (Studio creates it with the project)
├── script.js         the narration script, the single source of truth: META + PAGES (each page a list of subtitle cues)
├── voice.js          real narration timings (SCRIPT.VOICE), written by the voice module
├── audio/            narration, one take per page
├── pages/pNN.js      each page's picture: ENGINE.visual(id, P => …), a pure function of the time t
├── extras/           components this project uses (copied from lib/ and registered in META.extras)
└── out/              snapshots, the film, subtitles
```

## Runtime

- `runtime/timing.js`: lays the whole timeline out from the cues and the narration; `P.c(i, dt)` is when line i starts.
- `runtime/engine.js`: page turns, camera, subtitles; `ENGINE.renderAt(t)` renders any moment.
- `runtime/core.js`, `text.js`, `doodles.js`, `widgets.js`, `live.js`: the drawing API (see `packages/agent/prompts/API.md`).
- `lib/`: reusable components; `node engine/tools/use-extra.mjs <name>` copies one into the project and registers it.

## Tools (run from a project directory)

| Command | What it does |
|---|---|
| `node engine/tools/script.mjs` | checks the narration script and estimates its length |
| `node engine/tools/pages.mjs [--json]` | each page's real time range and when each cue starts |
| `node engine/tools/lint.mjs [--only pNN]` | layout check: off-canvas, against the edge, in the subtitle band, overlapping text |
| `node engine/tools/snap.mjs --only pNN --sheet name t1 t2 …` | snapshots at the given times, tiled into one sheet |
| `node engine/tools/check.mjs --only pNN --sheet name [--determinism] t1 t2 …` | a page's check in one browser: lint and the sheet, as JSON (the studio runs it after every draft and fix) |
| `node engine/tools/render.mjs [--fps 30] [--workers 4]` | renders the film (optionally with burnt-in subtitles) |
| `node engine/tools/publish.mjs` | writes publishing notes per platform (titles, description, tags, chapter timestamps) |

The browser is the Chrome or Edge installed on the machine (or `CHROME_PATH`); video is encoded with the bundled ffmpeg (or `FFMPEG_PATH`).
