# Antique Map · grammar card

Reference: the portolan charts of the 14th–16th centuries (rhumb lines, compass roses, red and black place names), the atlases of Ortelius, Mercator and Blaeu (cartouches, sea monsters, ships on the open ocean), and 18th–19th-century historical atlases (territories coloured by hand, dotted frontiers, campaigns drawn as arrows). Good for the history of exploration and trade, wars and campaigns, empires growing and shrinking, migrations, geopolitics, and why a border, a strait or a city is where it is.

## In one sentence

Every page is one chart on old parchment where the story happens as movement over real geography: a route inks itself across the sea while a little ship sails at its head, a realm's colour spreads over the land year by year while the year turns in the cartouche, and places are named in italic as the narration reaches them.

## Picture

- **Every page is a map, and `P.region(where)` is its first line.** It inks the plate: neatline, degree border, graticule, real coastlines (hachured, water-lined), sea names. `where` is a preset (`'mediterranean'`, `'europe'`, `'eastasia'`, `'indianocean'`, `'atlantic'`, `'world'`, `'silkroad'`, … see the component) or the list of places the page needs (`['Lisbon', 'Calicut', 'Cape of Good Hope']`): the plate frames them. Never invent a coastline with `P.path`; never draw a map without `P.region`.
- **Choose the frame for the idea.** One region per page; zoom between pages (world → Indian Ocean → Strait of Malacca), not within one. A strait or a city's site needs a close frame (12–30° of longitude; the survey is not fine enough for closer, so the kit never frames less than 12°); an ocean voyage or an empire a wide one.
- **Places by name.** Every component takes places as gazetteer names in English or Chinese (`'Rome'`, `'罗马'`, `'Strait of Malacca'`, `'Cape Horn'`) or `[lon, lat]`. If a name may be missing, pass `[lon, lat]` (longitude first, east positive). `P.xy(place)` gives the stage point for the camera.
- **What draws what:**
  - a voyage, a trade route, a migration, a flight: `P.route([places], { icon: 'ship' | 'junk' | 'caravan' | 'horse' | 'army' | 'none' })` — ships find their own way round the land, so give only the ports and capes that matter;
  - a realm, colony, alliance, sphere of influence: `P.territory(area, { color })`; an empire that grows or shrinks: `P.spread([{ at, area, year }, …])` (one call for the whole growth: each stage replaces the last inside its bloom). An `area` is modern country names when they fit (`['Spain', 'Portugal']`), otherwise `{ poly: [...] }` with **8–16 points that follow the real frontier** (rivers, mountain crests, coasts — the wash stops at the sea by itself, so run the polygon out over the water instead of tracing the coast), or `{ along: [places], km }` for a coastal or river realm;
  - an army's campaign, an invasion, a retreat: `P.march([places], { color, retreat })`;
  - a frontier, wall or treaty line: `P.border([places], { style: 'dotted' | 'dashed' | 'wall' })`;
  - a town, port, capital or battle: `P.place(place, { kind })`; a land, sea or empire's name across the map: `P.name(text, place)`;
  - mountains and rivers that explain a route or a border: `P.mountains([crest places])`, `P.river('nile' | '黄河' | …)`;
  - how far: `P.measure(a, b)`; the key: `P.legend([...])` once there are 2+ colours; the title-piece with the year: `P.cartouche(title, { year })`; a compass rose with rhumb lines: `P.compass()`; the scale: `P.scale()`; a ship or a sea serpent at anchor: `P.token(kind, place)`.
- **A finished page has**: the region, **2–5 named places**, **at least one route, march, territory or border** (the thing that moves or spreads), and a cartouche, compass or scale. A wide page also gets one `P.compass()` or `P.token('monster')` on open sea.
- **Colour is a faded wash on a sepia print.** Ink is sepia; colour is hand-laid: `red` (vermilion) for the subject's own route or realm, then `green`, `yellow`, `purple`, `orange` for rivals, `blue` for rivers. **At most 3 colours per page**; one colour means one party for the whole film (Portugal stays red on every page).
- **Words are engraved lettering, few and small.** Place names come from `P.place` (30–36 px, italic); realms and seas from `P.name` (36–60 px, spaced capitals); the page's one number or year lives in the cartouche (`year`, `years`) or `P.measure`; a running count (days at sea, men left) may be one `P.follow` / `P.text` in red, 36–48 px, beside the thing it counts. **At most 6 place names and 2 `P.name`s per page.** No sentences, bullet lists, boxes of text, charts or tables. The title (`P.title`) is centred above the neatline: ≤ 12 Chinese characters or ≤ 6 English words.
- The kit keeps everything inside the neatline (x 96–1824, y 150–890) and finds open sea for the cartouche, compass, scale and legend by itself: don't place them by hand unless asked.

## Motion and camera

- **The plate is inked first** (`P.region` at 0, 3 s: coastlines drawn by the pen, then the washes spread out). Start the first place at 0.6–1.5 s, while it is still inking.
- **The signature: the route inks itself while the ship sails.** Time `P.route` so the ship travels while the narration tells the journey: `at` on the cue that starts it, `dur` = the seconds of that telling (3–8 s). The next place lands as the ship reaches it (`P.place(…, { at })` near `at + dur × fraction`).
- **The second signature: colour spreads year by year.** `P.spread` stages land on the words that name each year or conquest (`at: P.cw(i, '1453')`); the cartouche's year rolls to match. Territories bloom out from their capital (`from`).
- **Names arrive on the word** (`at: P.cw(i, 'Calicut', -0.3)`). Things that are on the map keep living: ships rock, the monster swims; nothing slides, bounces or pops.
- **Camera: a reader leaning over the chart.** At most one push per page, toward where the action is (`P.cam([P.push(t, ...P.xy('Malacca'), 1.3), P.back(t2)])`, ≤ 1.4×); never a shake or a slam.

## Pacing

- Within the first 2 s the coastlines are being inked; by 3 s the first place or route has started.
- 9–14 s per page; something new every 2–3 s (a place named, a route leg sailed, a stage of colour, a border ruled).
- Hold each finished map ≥ 1.5 s before the page ends. End the film on a full chart — every route drawn, every realm coloured, the cartouche showing the last year — never on a text card.

## Not this

- **Not Watercolor**: no landscapes, skies, painted scenes or pencil underdrawing; colour only sits inside territories on a map.
- **Not Copperplate Engraving**: no specimens, no hatched 3D objects, no labelled figures; the subject is geography.
- **Not Collage**: no torn paper, photos, pins, string or detective desk.
- **Not Ukiyo-e / Ink-wash**: no woodblock waves, no brush landscapes, no seals; this is a European chart even for Chinese history (Chinese lettering in Song type).
- **Not Isometric / Blueprint**: no 3D blocks, grids of tiles, white-on-blue, dimension lines.

## Never

- A coastline, continent or island drawn by hand (`P.path`, `P.curve`): it always reads wrong. Use `P.region`; show a smaller area instead.
- A page without a map, a text card, a diagram of boxes and arrows, a timeline bar, charts, icons (`P.icon`), emoji, logos, photos.
- Modern map looks: flat bright fills, glow, gradients, pins/markers, satellite colours, sans-serif labels, north arrows of the web.
- Colour washes on the sea, more than 3 colours on a page, a party changing colour between pages.
- Routes that cross land when they are sea voyages (let `P.route` route them; add the cape or strait they pass), routes drawn with `P.arrow`.
- More than 6 place names, labels stacked on each other, text under 26 px, anything outside the neatline or in the subtitle band (y > 900).
- Wrong geography: a city in the sea, the wrong river, an anachronistic border. When unsure of a place, give its `[lon, lat]`.
