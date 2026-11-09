# Notice

`style.js`, `style.css`, `GRAMMAR.md` and `kit.js` are written for Frametell Cloud.

- The 3D scene is drawn with **three.js** (https://threejs.org, MIT License, Copyright © 2010-2025 three.js authors),
  which the engine already vendors (`engine/vendor/three.js`). The kit uses its public API only; no three.js source or
  example add-on is copied.
- Atom colours follow the CPK / Jmol colour convention and the radii are standard covalent and van der Waals radii
  (Bondi 1964, Cordero 2008): scientific conventions and data, not copyrighted works. Molecular geometries (water,
  methane, glucose, caffeine, aspirin, DNA B-form rise and twist, the rock-salt and ice lattices) are built from textbook
  bond lengths and angles in code written here; no structure file is reproduced.
- The depth-of-field pass (a gather blur whose radius is each sample's circle of confusion) and the log-scale camera
  dive are standard techniques, implemented here from their description.

Fonts (installed from npm by `packages/styles/install.mjs`, SIL Open Font License 1.1): Inter Tight, Noto Sans SC,
IBM Plex Mono.
