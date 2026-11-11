# 3D Globe · grammar card

Reference: the interactive globes of newsroom graphics desks (Reuters Graphics, Bloomberg, the Financial Times, the New York Times), flight-path and shipping-lane visualisations, NASA's Earth views. For global flows and world news: trade routes, flights, migration, undersea cables, energy and resources, where things are made, a disease or an idea spreading, comparisons between countries.

## In one sentence

A real three-dimensional Earth turns in deep navy space; the camera flies to the region the voice names, glowing arcs launch one by one from a source to its destinations on the spoken words, and each number lands on the place it measures.

## Picture

- **The globe is the picture.** Every page calls `P.globe({...})` FIRST and exactly once; everything else hangs on it. Two compositions only:
  - **Full globe**: `P.globe({ view })` (cx 960, r 360). Labels and numbers live on the globe. Use it for flights, fans, routes, spreads.
  - **Globe + column**: `P.globe({ view, cx: 1240, r: 320 })` with a left column at x 140–620: one `P.gstat` (the headline number) or one `P.granks` (≤ 7 rows), plus `P.glegend` / `P.gsource` at the bottom left. Use it for comparisons between countries. Keep zoom ≤ 1.3 on these pages so the globe stays clear of the column.
- **The kit draws everything** (already registered, call directly):
  - `P.gfocus(place, { at, zoom })` — the camera. zoom 1 = whole Earth, 1.6 = a continent, 2–2.5 = a country (the camera then tilts and looks across the surface). Never above 3.
  - `P.gfan(from, targets, o)` — the signature: the camera frames the source and its destinations, then arcs launch one by one and numbers land on arrival. 3–6 destinations, all in the same hemisphere as the source.
  - `P.garc(from, to, o)` — one great-circle arc with a glowing head; `w` 0.6–3 encodes volume.
  - `P.groute(waypoints, o)` — a route hugging the surface: shipping lanes (give the sea waypoints so it stays in water), pipelines, cables, a migration.
  - `P.gdot(place, { label: true })` — a pulsing city dot with its own name.
  - `P.gnum(place, value, o)` — a number counting up ON a place. `P.glabel(place, text)` — a short label pinned to a place.
  - `P.gbars(data, o)` — columns standing on countries or cities (production, population, emissions). Focus at zoom 1.8–2.4 so they stand up.
  - `P.gheat(data, o)` — colours countries by value (cream → orange → red). `P.ghighlight(country)` — one country lights up (≤ 3 a page).
  - `P.gspread(place, { km })` — a disc spreading over the surface (an outbreak, a reach, a radius).
  - Flat layer: `P.gstat`, `P.granks`, `P.glegend`, `P.gsource`, `P.title(str, { kicker, accent })`.
- **Places are names.** Cities, countries, seas, straits and regions in English or Chinese: `'Shanghai'`, `'上海'`, `'Germany'`, `'Strait of Malacca'`, `'Suez Canal'`, `'Middle East'`, `'North Atlantic'`. Anything else as `[lat, lon]` (real coordinates, 2 decimals). Labels print names in the film's language by themselves.
- **Colour has jobs.** `orange` (amber) is the main flow and the number that matters; `blue` (cyan) is the second flow, data and cables; `red` is the chokepoint, the risk, the biggest value; `green` is growth or clean energy. At most 2 flow colours on a page. Land stays light grey, ocean dark blue: never recolour them.
- **Numbers sit on the globe.** A value belongs next to what it measures (`P.gnum`, `gfan` values, `gbars` labels). A page has 1–5 numbers; each counts up and lands on the spoken word. Real, rounded figures with a unit; `P.gsource` names where they come from (an organisation and a year) on every page that shows a number.
- **Fill the frame.** A full-globe page holds zoom 1.15–1.6 most of the time (the Earth fills the frame's height and runs off an edge); zoom ≤ 1 only for the last page's pull-back. A page that stays wide puts a `P.gstat` or `P.granks` in the left column instead of leaving it empty.
- **Labels stay white.** Place names are plain white `glabel` / `label: true`; colour markup is for one key word of a figure, never for a label sitting on an arc of the same colour.
- **Text is short.** Labels 2–8 Chinese characters or 1–3 English words. `P.gstat` caption ≤ 14 Chinese characters or 6 English words. No sentences on screen besides the title; the voice carries the explanation.
- **Title**: `P.title(str, { kicker })` top left; kicker is a 1–2 word section tag in capitals (`TRADE`, `航运`, `CLIMATE`).

## Motion and camera

- **The camera is the globe's.** `P.gfocus` is the only camera: one move every 4–8 s, timed to the word that names the place (`at: P.cw(i, 'Suez') - 0.3`). Long moves pull back mid-way by themselves. Between moves the Earth keeps turning slowly (`spin`); never set spin to 0.
- **Signature move, once or twice a film**: `P.gfocus` to the source → `P.gfan` with each target's `at` on its spoken name → numbers land at the destinations → hold 1.5 s. The arcs keep carrying light packets after they land, so a held frame still moves.
- **Things arrive on words.** Dots, arcs, labels, numbers, highlights each take an `at` from `P.c(i)` / `P.cw(i, 'word')`; nothing appears before it is named. Arcs take 1.2–1.8 s to fly; routes 3–6 s.
- **Every page opens on the globe already in place**: the first page's globe fades in and drifts closer; later pages open on a new view (a different `view` from the last page's final focus), so each page turn is a cut to a new region.
- Never `P.cam`, `P.push`, `P.slam` or `P.shake`: they scale the flat page and blur the globe.

## Pacing

- First 2 s: the globe is on screen, turning, with the first dot or highlight on the first spoken place.
- 8–14 s per page; a camera move, an arc, a number or a highlight every 2–3 s.
- One region or one flow per page. A 60 s film is 5–6 pages: the question, two or three flows or comparisons, the turn (the chokepoint, the surprise number), and an ending.
- End wide: the last page pulls back to zoom 0.9–1 with every flow of the film lit at once and the final number landing. Never end on a text card.

## Not this

- Not **Vector Science** (flat cartoon planets, a bird for scale): the globe here is a real map with real coastlines and real numbers, no characters, no cartoon objects.
- Not **Neon Noir** (neon tubes, grid floors, glitch type): no synthwave horizon, no magenta, glow only on arcs, heads and dots.
- Not **Broadsheet / Swiss** (flat charts on paper): charts here are only the small left column; the picture is always the 3D globe.
- Not **Isometric** (little 3D cities and factories): no buildings, no machines; the world is seen from space.

## Never

- A page without `P.globe`, or two globes on one page; a flat 2D world map; continents drawn by hand with `P.path` / `P.canvas`.
- Hand-drawn primitives on top of the globe (`P.box`, `P.arrow`, `P.icon`, `P.circle`, `P.text` paragraphs), cards, bullet lists, emoji.
- Invented coordinates for named places that the kit knows; a fan whose destinations are on the far side of the globe (split it: fan, `P.gfocus`, second fan).
- Taiwan, Hong Kong or Macau shown as a country (they are places: `P.gdot('Taipei')`), national borders, and disputed territory drawn as anybody's shape. China, India and Pakistan are coloured as soft hotspots by the kit on purpose; never try to draw their outlines.
- More than 6 arcs in flight on one page, more than 5 numbers, more than 3 highlights; numbers with no source line.
- Labels or numbers under y 870 (the subtitles) or above y 150 (the title); `P.gstat` or `P.granks` on a page that zooms past 1.3.
- Camera zoom above 3 (the coastlines are drawn for continents, not streets); two `P.gfocus` within 3 s of each other.
