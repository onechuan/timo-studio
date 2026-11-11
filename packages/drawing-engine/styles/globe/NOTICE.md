3D Globe draws with three.js (MIT, the engine's vendored copy). All drawing code in kit.js is original.

world.js holds country shapes and coastlines derived from Natural Earth 1:110m Cultural Vectors, Admin 0 – Countries
(public domain, https://www.naturalearthdata.com), as packaged in world-atlas 2.0.2 `countries-110m.json`
(ISC licence, Copyright 2013-2019 Michael Bostock, https://github.com/topojson/world-atlas). The data was decoded with
topojson-client 3.1.0 (ISC, Michael Bostock) at build time only; it is not shipped. Changes: longitudes unwrapped across
the antimeridian, rings around a pole closed through it, Taiwan drawn as part of China, Kosovo, N. Cyprus and Somaliland
merged into Serbia, Cyprus and Somalia, internal borders dropped, coordinates quantised to 0.05°.

City and region coordinates in kit.js are public geographic facts.

Fonts: Inter Tight (SIL OFL 1.1, Rasmus Andersson), Noto Sans SC (SIL OFL 1.1, Google), IBM Plex Mono (SIL OFL 1.1, IBM),
installed from their @fontsource packages.
