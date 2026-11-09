/* Files: a small file card (ftile), a directory tree drawn as an indented list with guide lines (filetree), and a chip that flies
 * on an arc from one place to another (fly). All pure in lt. */
(function () {
  const { clamp, ease, lerp, Builder } = PV;
  const B = Builder.prototype;

  /** ftile(x, y, w, h, name, o) — a file card: mono name on top + a few grey code lines. o: { at, color, lines, size, dur } */
  B.ftile = function (x, y, w, hh, name, o = {}) {
    const at = o.at ?? 0, c = o.color || 'soft', n = o.lines ?? 3, size = o.size ?? 24, dur = o.dur ?? 0.3;
    this.box(x, y, w, hh, { r: 10, fill: o.fill || 'paper', color: c, sw: 2.2, at, dur, texture: false, rough: 0.7 });
    if (name) this.text(name, { x: x + w / 2, y: y + 8, w: w + 40, align: 'c', size, font: 'mono', weight: 700, color: o.tcolor || c, at: at + dur * 0.5, mode: 'fade', dur: 0.2, raw: true });
    const top = name ? y + size * 1.7 + 8 : y + 14, gap = (y + hh - 12 - top) / Math.max(1, n);
    for (let i = 0; i < n; i++) this.line(x + 16, top + (i + 0.5) * gap, x + 16 + (w - 32) * (0.45 + ((i * 37) % 50) / 100), top + (i + 0.5) * gap, { color: 'faint', sw: 3, at: at + dur, dur: 0.15 });
  };

  /**
   * filetree(x, y, rows, o) — rows in walk order: [[label, depth, kind ('d' dir | 'f' file)], …], e.g. [['src/', 0, 'd'], ['app.ts', 1, 'f']].
   * Drawn as an indented list with guide lines. o: { at, step (s between rows), rowH, size, indent, color(row) → key }
   * Returns { rows, y(i) (row top), cx(i) (text x), w(i) (approx text width) }.
   */
  B.filetree = function (x, y, list, o = {}) {
    const at = o.at ?? 0, step = o.step ?? 0.06, rowH = o.rowH ?? 40, size = o.size ?? 26, ind = o.indent ?? 34;
    const rows = list.map(([label, depth, kind]) => ({ label, depth, kind }));
    rows.forEach((r, i) => {
      const ry = y + i * rowH, tx = x + r.depth * ind;
      if (r.depth > 0) this.line(tx - ind + 10, ry + rowH / 2, tx - 6, ry + rowH / 2, { color: 'faint', sw: 2, at: at + i * step, dur: 0.15 });
      const c = o.color ? o.color(r) : r.kind === 'd' ? 'soft' : 'ink';
      this.text(r.label, { x: tx, y: ry + (rowH - size * 1.35) / 2, size, font: 'mono', weight: r.kind === 'd' ? 700 : 400, color: c, at: at + i * step + 0.05, mode: 'fade', dur: 0.2, raw: true });
    });
    // vertical guides under each dir
    rows.forEach((r, i) => {
      if (r.kind !== 'd') return;
      let j = i + 1;
      while (j < rows.length && rows[j].depth > r.depth) j++;
      const last = [...rows.slice(i + 1, j)].reverse().find((q) => q.depth === r.depth + 1);
      const li = rows.indexOf(last);
      if (li > i) this.line(x + r.depth * ind + 10, y + i * rowH + rowH * 0.8, x + r.depth * ind + 10, y + li * rowH + rowH / 2, { color: 'faint', sw: 2, at: at + i * step + 0.1, dur: 0.3 });
    });
    return { rows, y: (i) => y + i * rowH, cx: (i) => x + rows[i].depth * ind, w: (i) => rows[i].label.length * size * 0.6 };
  };

  /**
   * fly(label, from, to, t0, o) — a mono chip on its own layer that flies from [x, y] to [x, y] (centres) over o.dur with an arc,
   * visible from t0 (pops at the source) until o.until. o: { color, w, size, dur, arc, until }
   */
  B.fly = function (label, from, to, t0, o = {}) {
    const L = this.layer(), c = o.color || 'orange', size = o.size ?? 26, w = o.w ?? label.length * size * 0.62 + 30, hh = size * 1.7, dur = o.dur ?? 1.0;
    L.box(-w / 2, -hh / 2, w, hh, { r: 10, fill: c + 'F', color: c, sw: 2.4, at: 0, dur: 0.01, texture: false });
    L.text(label, { x: 0, y: -size * 0.68, w: w + 20, align: 'c', size, font: 'mono', weight: 700, color: c, at: 0, mode: 'fade', dur: 0.01, raw: true });
    this.tick((lt) => {
      if (lt < t0 || (o.until != null && lt > o.until + 0.3)) { L.wrap.style.opacity = '0'; return; }
      const k = ease.inOut(clamp((lt - t0 - 0.3) / dur)), arc = Math.sin(k * Math.PI) * (o.arc ?? -90);
      const pop = clamp((lt - t0) / 0.25), out = o.until != null ? 1 - clamp((lt - o.until) / 0.3) : 1;
      L.wrap.style.opacity = (pop * out).toFixed(3);
      L.wrap.style.transform = `translate(${lerp(from[0], to[0], k).toFixed(1)}px, ${(lerp(from[1], to[1], k) + arc).toFixed(1)}px) scale(${(1 + 0.15 * Math.sin(k * Math.PI)).toFixed(3)})`;
    });
    return L;
  };
})();
