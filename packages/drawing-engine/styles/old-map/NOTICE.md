# Notice

`style.js`, `style.css`, `GRAMMAR.md` and `kit.js` are written for Frametell Cloud.

`kit.js` embeds geography baked (simplified, quantised to 1/20°, delta-encoded) from:

- **Natural Earth** (https://www.naturalearthdata.com): 1:50m land, 1:110m lakes, 1:50m rivers and lake centrelines,
  1:110m admin-0 countries. Natural Earth is in the public domain ("free to use in any type of project").
- **world-atlas** 2.0.2 by Mike Bostock (https://github.com/topojson/world-atlas), the TopoJSON conversion of the land and
  country layers, ISC License:

> Copyright 2013-2019 Michael Bostock
>
> Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby
> granted, provided that the above copyright notice and this permission notice appear in all copies.

The rivers and lakes come straight from Natural Earth's GeoJSON (nvkelso/natural-earth-vector, public domain). The
gazetteer of places, the drawing code and the figures are original work. The chart conventions (neatline with a
graduated border, rhumb lines, compass rose, cartouche, water-lining, hachured coasts, hand-coloured borders) follow
16th–18th-century charts and atlases, which are in the public domain; no map, plate or ornament is reproduced.

Fonts (installed from npm by `packages/styles/install.mjs`, SIL Open Font License 1.1): Noto Serif SC, Fraunces.
