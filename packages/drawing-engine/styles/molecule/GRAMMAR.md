# 3D Micro World · grammar card

Reference: molecular-biology and chemistry animation as the big science studios and medical animators make it (the DNA-replication and protein-folding films shown in classrooms and museums, pharmaceutical mechanism-of-action films, journal cover renders): a dark liquid medium full of drifting particles, glossy CPK-coloured molecules, ribbon proteins in glassy surfaces, lipid bilayers, icosahedral virus shells, a shallow depth of field and a slow camera that drifts, pushes in and dives. Good for chemistry and molecular biology: how DNA copies itself, how a virus gets into a cell, how a drug fits its receptor, why water is special, crystals, soap, enzymes, why salt dissolves.

## In one sentence

Every page is one shot inside a living microscopic world rendered in 3D: one hero structure fills the frame in a teal or midnight-blue medium, the camera drifts and dives toward the part being named, and the payoff is two shapes locking together with a flash on the spoken word.

## Picture

- **One scene per page, called first.** `const M = P.micro({ mood, scale })` builds the page's whole 3D world (medium, particles, lights, depth of field). Call it once, before anything else, then `P.title(...)`. Never two `P.micro` on a page, never `P.three`, `P.canvas`, `P.box`, `P.circle`, `P.icon` or `P.text` paragraphs on top.
- **mood is the place, and changes with it.** `teal` = water, the cell's inside, the general medium; `blue` = chemistry, crystals, drugs, the cold; `violet` = the nucleus, DNA, the genome. Consecutive pages may change mood when the story moves somewhere new; at most 3 moods in a film.
- **scale tells how small.** Pass `scale` for the page's real size on the focus plane: `'2 µm'` a cell, `'100 nm'` a virus at a membrane, `'5 nm'` a protein, `'2 nm'` DNA, `'1 nm'` a small molecule or a crystal. The kit draws a scale bar bottom left that updates as the camera moves; never draw your own.
- **One hero, big, plus 1–4 neighbours at other depths.** The hero fills a third to half of the frame: `M.cell({ r: 380–450 })`, `M.protein({ r: 260–320 })`, `M.virus({ r: 130–200 })`, `M.helix({ length: 1200–1400 })`, `M.lattice(type, { r: 280–360 })`, `M.molecule(name, { r: 240–320 })`, `M.membrane()` across the lower half. Place it off-centre (x 700–1200, y 420–600). Neighbours go in front (`z: 150–300`, they blur) or behind (`z: -400 to -900`, they blur and fade into the medium): a water molecule, a CO2, an ion, a second virus. Depth is the point: something is always nearer and something farther than the hero.
- **Which component draws what.**
  - Small molecules: `M.molecule(name, o)` — built in with correct geometry and CPK colours: `H2O CO2 O2 N2 H2 CH4 NH3 NaCl ethanol benzene glucose caffeine adenine adenosine aspirin soap` and ions `'Na+' 'K+' 'Cl-' 'Ca2+' 'Mg2+' 'H+'`. `style: 'space'` shows space-filling spheres instead of ball-and-stick. Anything else: `{ atoms: [['C', x, y, z], …] }` in Å (bonds are found). Atom indices follow the formula order in the library (water: 0 = O, 1–2 = H).
  - Many small molecules: `M.swarm(name, { n: 12–30, r: 30–60, box: [x0, y0, x1, y1] })`; `.gather(target, at, { face: 'out' | 'in' })` makes them surround something (water round an ion, soap round an oil drop).
  - DNA: `M.helix({ x, y, length, seq })`, `.unzip(at, { dur, copy: true })` opens it from the left and new glowing nucleotides pair with each strand.
  - Proteins, enzymes, receptors, antibodies: `M.protein({ r, pocket: 'left' | 'right' | 'up', colors })` — a rainbow ribbon inside a glassy surface with a binding pocket.
  - Membranes: `M.membrane({ y: 650–760, receptors: [x, …] })` — a lipid bilayer across the frame; `mem.receptors[i]` are its proteins; `mem.dip(at, { x, depth })` folds it in round whatever sits there.
  - Viruses: `M.virus({ kind: 'capsid' })` an icosahedral shell with fibres (adenovirus, phage-like), `kind: 'crown'` an enveloped virus with spikes (flu, coronavirus); `.release(at)` breaks a capsid open and spills its genome.
  - Cells: `M.cell({ r })` a whole cell studded with surface proteins; `cell.spot(lon, lat)` gives a point on its surface to put a molecule there for a dive.
  - Crystals and ordered matter: `M.lattice('salt' | 'ice' | 'diamond' | 'metal', { build: true })`, `.dissolve(at)`, `.melt(at)`.
  - Drops, vesicles, oil: `M.blob({ r, color, opacity })`. A hydrogen bond or an attraction: `M.link(a, b)` (a dashed glowing line). A path, a flow, a signal: `M.trail([[x, y, z], …], { at, dur })`.
- **Colour discipline.** Atoms keep CPK colours (C grey, O red, N blue, H white, S yellow, P orange, Na/K violet, Cl green); never recolour them. The ribbon and helix colours are the kit's. The one accent is **orange light**: the interaction glow, the flash, the new strand, the number. Use `color` on a protein, cell or blob only to tell two of them apart (at most 2 extra colours per page).
- **Words are few and attached.** `M.label(target, '名字', { at, sub })` names a thing with a dot and a leader line; `sub` is a formula or the English or Latin name (`'H₂O'`, `'ACE2'`, `'C₈H₁₀N₄O₂'`). Target an object (`dna`), a part (`{ of: water, part: 0 }` an atom, `{ of: enzyme, part: 'pocket' }`, `{ of: dna, part: 'fork' }`, `{ of: dna, part: 12 }` the 12th base pair, `{ of: dna, part: 'new' }` the new strand, `{ of: virus, part: 'spike' }`) or a point. Prefer a part to a fixed point: the dot stays on the thing as it moves. **At most 4 labels per page**, 1–6 Chinese characters or 1–3 English words each; the kit keeps them inside x 150–1770, y 180–815 and off each other. The page's one key number is `M.number(x, y, value | lt => value, { at, unit })` (size 90–130), placed in empty medium beside the hero, at most one per page. `P.title` is a short caption (≤ 12 Chinese characters or ≤ 6 English words). No sentences, paragraphs, bullet lists, boxes, cards or chips.

## Motion and camera

- **The medium is alive.** Particles drift, molecules tumble slowly, the membrane breathes, the helix turns: the kit does this. Every object `float`s a little; nothing is ever frozen.
- **Things arrive, they don't pop.** An object fades and grows in at its `at` on the word that names it; to bring one in from off-frame, start it outside (x < 0 or > 1920, or z: -1500) and `.to(at, { x, y, z }, dur)` it in. Leave with `.hide(at)`.
- **The signature 1: the dive.** At least once a film, and usually in the first 15 s, the camera dives from a big structure into one small thing on it: `const m = M.molecule('caffeine', { pos: cell.spot(-25, 18), r: 14 }); M.diveTo(m, P.c(1, 0.3), 3.5);` — a log zoom with the focus following, the scale bar counting down from µm to Å. The small target must already be on screen (tiny, on the surface) before the dive starts. Label the target after it lands.
- **The signature 2: key into lock, with a flash on the word.** `M.dock(lock, key, P.cw(i, 'word'), { dur: 2–3 })` flies the key into the lock's site so the contact lands exactly at that time, with an orange flash and both glowing: a drug into its receptor (`M.protein` pocket), a substrate into an enzyme, a virus spike onto a membrane receptor (`M.dock(mem.receptors[1], virus, …)`), an antibody onto a virus. Time it to the word that says it (结合 / 锁住 / binds / fits). Frame it: before the key arrives, push the camera to the lock (`M.cam(at - 1.5, { to: lock, zoom: 1.6–2.2 })`) so lock and key fill at least a third of the frame when they touch; a dock seen from far away is lost. One dock per page at most; most films have 2–3.
- **Camera: slow drift by default, pushes on the named thing.** The kit already drifts. `M.cam(at, { to: obj, zoom: 1.3–2, dur: 2–3 })` pushes in and frames an object; `M.cam(at, { zoom: 1, to: [960, 540, 0] })` pulls back; `yaw` / `pitch` (degrees, ≤ 25) orbit a little. `M.focus(obj, at)` racks focus to a near or far object without moving. At most 2 camera moves per page besides the dive. Never a shake, a slam or a fast spin.
- **Processes play in place.** Use the object's own verb on the cue: `dna.unzip`, `mem.dip`, `virus.release`, `lattice.dissolve` / `.melt`, `swarm.gather`, `molecule.split(at, [atom indices])`, `obj.glow(at)` to highlight the part being named.

## Pacing

- The hero is on screen within the first 0.5 s of every page (`at: 0`), labels and motion follow the words.
- **Every page is a different shot.** No two consecutive pages with the same hero component, and at most 2 pages of a film built on `M.membrane`. Move through scales and places: cell → membrane → protein close-up → single molecules → crystal or DNA, changing `mood` or `scale` from page to page.
- 10–15 s per page; something visibly changes every 2–3 s (an arrival, a label, a camera move, a glow, a process step).
- The first page opens wide on the biggest structure (a cell, a membrane, a crystal, a drop) and dives in. The middle pages each show one mechanism. The last page pulls back (`M.cam(at, { zoom: 0.7 })`) from the finished result: the two strands, the drug in its pocket, the virus inside the cell, held at least 2 s.

## Not this

- **Not Vector**: no flat two-tone shapes, no little bird, no night sky, no pill labels. This is lit, glossy 3D with depth of field.
- **Not Copperplate Engraving**: no paper, no hatching, no printed plate, no italic captions.
- **Not Neon or Blueprint**: no glowing outlines, no wireframes, no grid, no white lines on blue, no HUD frames.
- **Not a textbook diagram**: no flat arrows, no boxes with words, no legends, no white background.

## Never

- More than one `P.micro` on a page, or any `P.three` / `P.canvas` / `P.box` / `P.circle` / `P.icon` / `P.arrow` / `P.chip` / `P.card` in this style. Never set `META.vendor` or `META.webgl` yourself: the server does.
- Wrong chemistry: recoloured atoms, invented molecules passed by name (only the built-in names work; others throw), bonds drawn by hand, a water molecule that isn't bent.
- A hero smaller than about 200 px across in the middle of empty medium; a page with only labels moving; everything on one depth plane.
- A dock whose `at` is not a spoken word's time; a flash or glow on things that are not interacting; more than one orange accent event at once.
- `M.number` counting slowly through a whole page, or two numbers on a page; text under 28 px; anything placed in the subtitle band (y > 880) or above y 170.
- `Math.random()`, `Date.now()`, timers or state carried between frames: everything is a function of `lt`.
