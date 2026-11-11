/* A team at work: a movable named robot (bot), an envelope that flies on an arc (env), a file card whose rows append over time
 * (jfile), and a clock with a live readout (timer). All pure in lt. */
(function () {
  const { h, col, clamp, ease, lerp, Builder } = PV;
  const B = Builder.prototype;

  /**
   * bot(cx, cy, s, name, o) — robot icon with a name chip under it, on its own layer (so it can be moved with P.move).
   * o: { at, color, chipW, size, label: false }. Returns the layer with .cx/.cy.
   */
  B.bot = function (cx, cy, s, name, o = {}) {
    const L = this.layer(), at = o.at ?? 0, c = o.color || 'blue', size = o.size ?? 26;
    L.circle(cx, cy, s * 1.18, { fill: c + 'F', color: c, sw: 2.4, at, dur: 0.4, texture: false });
    L.icon('robot', cx, cy, s * 0.82, { at: at + 0.15, dur: 0.5 });
    if (o.label !== false) {
      const w = o.chipW ?? Math.max(90, name.length * size * 0.62 + 34);
      L.chip(cx - w / 2, cy + s * 0.62, w, name, { color: c, at: at + 0.3, h: size * 1.6, size });
    }
    L.cx = cx; L.cy = cy;
    return L;
  };

  /**
   * env(o) — an envelope that flies along an arc. o: { from, to, t0, dur, arc, color, until, label, s }
   * Visible from t0 (pops) and parks at `to` until o.until (then fades). Returns the layer.
   */
  B.env = function (o) {
    const L = this.layer(), c = o.color || 'orange', s = o.s ?? 1, w = 74 * s, hh = 50 * s, dur = o.dur ?? 1.0;
    L.box(-w / 2, -hh / 2, w, hh, { r: 6, fill: 'paper', color: c, sw: 2.6, at: 0, dur: 0.01, texture: false, rough: 0.6 });
    L.path(`M${-w / 2 + 3} ${-hh / 2 + 3} L0 ${hh * 0.12} L${w / 2 - 3} ${-hh / 2 + 3}`, { color: c, sw: 2.4, at: 0, dur: 0.01, single: true, rough: 0.5 });
    if (o.label) L.text(o.label, { x: 0, y: hh / 2 + 2, w: 240, align: 'c', size: o.size ?? 24, font: 'mono', weight: 700, color: c, at: 0, mode: 'fade', dur: 0.01, raw: true });
    this.tick((lt) => {
      if (lt < o.t0 || (o.until != null && lt > o.until + 0.35)) { L.wrap.style.opacity = '0'; return; }
      const k = (o.ease || ease.inOut)(clamp((lt - o.t0 - 0.15) / dur));
      const [x, y] = o.path ? o.path(k, lt) : PV.arcAt(o.from, o.to, k, o.arc ?? -80);
      const pop = clamp((lt - o.t0) / 0.2), out = o.until != null ? 1 - clamp((lt - o.until) / 0.35) : 1;
      L.wrap.style.opacity = (pop * out).toFixed(3);
      L.wrap.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(Math.sin(k * Math.PI) * -10).toFixed(2)}deg) scale(${(0.7 + 0.3 * ease.back(pop)).toFixed(3)})`;
    });
    return L;
  };

  /**
   * jfile(x, y, w, h, name, rows, o) — a paper file card (folded corner) with a mono name tab and rows that append over time.
   * rows: [{ t, text, color }] — text uses the term() markup ({r:…} {g:…} …); a new row flashes yellow for 0.8 s.
   * o: { at, color, size }. Returns { rowY(i) }.
   */
  const TAGS = { r: 'red', g: 'green', b: 'blue', o: 'orange', m: 'muted', p: 'purple', s: 'soft', k: 'ink' };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const mark = (s) => esc(s).replace(/\{([rgbomspk]):([^{}]*)\}/g, (_, c, t) => `<span style="color:${col(TAGS[c])}">${t}</span>`);
  PV.markup = mark;
  B.jfile = function (x, y, w, hh, name, rows, o = {}) {
    const at = o.at ?? 0, c = o.color || 'soft', size = o.size ?? 26, f = 34, rowH = size * 1.55, top = y + 70;
    this.path(`M${x} ${y} H${x + w - f} L${x + w} ${y + f} V${y + hh} H${x} Z`, { fill: 'paper', color: c, sw: 2.6, at, dur: 0.6 });
    this.path(`M${x + w - f} ${y} V${y + f} H${x + w}`, { color: c, sw: 2, at: at + 0.4, dur: 0.2, single: true });
    this.text(name, { x: x + 22, y: y + 14, size: size, font: 'mono', weight: 700, color: c, at: at + 0.3, mode: 'fade', raw: true });
    this.line(x + 12, y + 58, x + w - 12, y + 58, { color: 'faint', sw: 1.8, at: at + 0.4, dur: 0.3 });
    const els = rows.map((r, i) => {
      const bg = h('div', null, null, this.html);
      Object.assign(bg.style, { position: 'absolute', left: x + 10 + 'px', top: top + i * rowH - 3 + 'px', width: w - 20 + 'px', height: rowH + 'px', background: col('yellow'), borderRadius: '6px', opacity: 0 });
      const el = h('div', 'tx mono', mark(r.text), this.html);
      Object.assign(el.style, { left: x + 22 + 'px', top: top + i * rowH + 'px', fontSize: size + 'px', whiteSpace: 'pre', color: col(r.color || 'ink'), opacity: 0 });
      return [bg, el, r.t];
    });
    this.tick((lt) => els.forEach(([bg, el, t]) => {
      const k = clamp((lt - t) / 0.35);
      el.style.opacity = k.toFixed(3);
      el.style.transform = `translateX(${((1 - ease.out(k)) * -16).toFixed(1)}px)`;
      bg.style.opacity = (lt < t ? 0 : 0.45 * (1 - clamp((lt - t - 0.4) / 0.8))).toFixed(3);
    }));
    return { rowY: (i) => top + i * rowH, rowH };
  };

  /** timer(x, y, fn, o) — a clock icon plus a live mono readout fn(lt) → str. o: { at, color, size } */
  B.timer = function (x, y, fn, o = {}) {
    const at = o.at ?? 0, c = o.color || 'orange';
    this.icon('clock', x, y, o.icon ?? 70, { at });
    return this.live(x + 50, y - (o.size ?? 40) * 0.72, fn, { at: at + 0.2, font: 'latin', weight: 700, size: o.size ?? 40, color: c });
  };
})();
