/* Token chips: a row of hand-drawn blocks that can flip to show their id and be moved by the page (chip.move). */
(function () {
  const { h, clamp, ease, Builder } = PV;
  const CYCLE = ['blue', 'orange', 'green', 'purple', 'red'];

  /** Rendered width of a label at a font size (fonts are loaded by the time pages are built for real). */
  function measure(host, str, size, font) {
    const el = h('span', 'tx ' + font, null, host);
    el.style.fontSize = size + 'px';
    el.style.whiteSpace = 'pre';
    el.textContent = str;
    const w = el.offsetWidth;
    el.remove();
    return w;
  }
  const labelOf = (t) => (typeof t === 'string' ? t : t.text ? t.text.replace(/^ /, '␣') : t.bytes.join(' '));

  /**
   * tokens(list, o) — list: strings or { text, id, bytes, partial } (see extras/data.js).
   * o: { x, y, h, size, gap, pad, align: 'l'|'c', at, stagger, colors, flipAt: t | (i) → t, idSize, idFirst (show the id, flip to text) }
   * Returns { chips, w }. Each chip: { L, x, y, w, h, cx, cy, t } and a settable chip.move = (lt) → { dx, dy, s, rot, op }.
   */
  Builder.prototype.tokens = function (list, o = {}) {
    const hh = o.h ?? 68, size = o.size ?? 36, gap = o.gap ?? 12, pad = o.pad ?? 18, at = o.at ?? 0, st = o.stagger ?? 0.12;
    const fontOf = (t) => (typeof t !== 'string' && t.partial ? 'mono' : 'hand');
    const idSize = o.idSize ?? size * 0.72;
    const widths = list.map((t) => Math.max(hh * 0.9, measure(this.html, labelOf(t), fontOf(t) === 'mono' ? size * 0.7 : size, fontOf(t)) + pad * 2,
      typeof t === 'string' ? 0 : measure(this.html, String(t.id), idSize, 'mono') + pad * 1.4));
    const total = widths.reduce((a, b) => a + b, 0) + gap * (list.length - 1);
    let x = o.align === 'c' ? o.x - total / 2 : o.x;
    const chips = list.map((t, i) => {
      const w = widths[i], c = (o.colors && o.colors[i]) || CYCLE[i % CYCLE.length], t0 = at + i * st;
      const L = this.layer();
      const partial = typeof t !== 'string' && t.partial;
      L.box(x, o.y, w, hh, { r: 12, fill: c + 'F', color: c, sw: 2.4, at: t0, dur: 0.35, texture: false, rough: 0.8 });
      const fs = partial ? size * 0.7 : size;
      const label = L.text(labelOf(t), { x: x + w / 2, y: o.y + (hh - fs * 1.45) / 2, w: w + 40, align: 'c', size: fs, font: partial ? 'mono' : 'hand',
        color: partial ? 'soft' : 'ink', at: t0 + 0.1, mode: 'fade', dur: 0.3, raw: true });
      const id = typeof t === 'string' ? null : L.text(String(t.id), { x: x + w / 2, y: o.y + (hh - idSize * 1.45) / 2, w: w + 60, align: 'c', size: idSize,
        font: 'mono', color: c, at: o.idFirst ? t0 + 0.1 : 0, mode: 'fade', dur: o.idFirst ? 0.3 : 0.01, raw: true });
      const chip = { L, x, y: o.y, w, h: hh, cx: x + w / 2, cy: o.y + hh / 2, t, move: null };
      const flipAt = typeof o.flipAt === 'function' ? o.flipAt(i) : o.flipAt;
      this.tick((lt) => {
        const f = flipAt == null ? 0 : clamp((lt - flipAt) / 0.45);
        const m = chip.move ? chip.move(lt) || {} : {};
        const sy = Math.abs(Math.cos(Math.PI * ease.inOut(f)));
        const showId = (f >= 0.5) !== !!o.idFirst;
        label.el.style.visibility = showId && id ? 'hidden' : 'visible';
        if (id) id.el.style.visibility = showId ? 'visible' : 'hidden';
        L.wrap.style.transformOrigin = `${chip.cx}px ${chip.cy}px`;
        L.wrap.style.transform = `translate(${(m.dx || 0).toFixed(1)}px, ${(m.dy || 0).toFixed(1)}px) rotate(${(m.rot || 0).toFixed(2)}deg) scale(${(m.s ?? 1).toFixed(4)}, ${((m.s ?? 1) * sy).toFixed(4)})`;
        L.wrap.style.opacity = (m.op ?? 1).toFixed(3);
      });
      x += w + gap;
      return chip;
    });
    return { chips, w: total };
  };
})();
