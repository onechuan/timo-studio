/* Exchanges and stacks: a two-party sequence diagram with flying messages (seq), a panel that types out JSON (jsonPanel), cards that
 * fold down into name tabs (fold3d) and a CSS-3D stack of layers whose slabs change colour over time (stack3d). All pure in lt. */
(function () {
  const { clamp, lerp, ease, col, h, Builder } = PV;
  const B = Builder.prototype;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /** Colour a line of JSON: keys purple, strings green, numbers/bools orange, punctuation muted. */
  const hlJson = (s) => esc(s).replace(/("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null|-?\d+(?:\.\d+)?)\b|([{}\[\],])/g, (m, str, colon, lit, p) => {
    if (str) return `<span style="color:${col(colon ? 'purple' : 'green')}">${str}</span>${colon || ''}`;
    if (lit) return `<span style="color:${col('orange')}">${lit}</span>`;
    return `<span style="color:${col('muted')}">${p}</span>`;
  });
  PV.hlJson = hlJson;

  /**
   * seq(o) — two lifelines for an exchange between two parties. o: { xl, xr, y0, y1, at, left: { label, logo, color }, right: {…}, headY }
   * Returns { send(y, dir, t, label, o) } — dir 'r' (left → right) or 'l'. The arrow draws over o.dur while an envelope
   * chip carrying the label flies along it, then parks as the arrow's caption.
   */
  B.seq = function (o) {
    const at = o.at ?? 0, hy = o.headY ?? o.y0 - 70;
    [[o.xl, o.left], [o.xr, o.right]].forEach(([x, s], i) => {
      if (s.logo) this.logo(s.logo, x - 150, hy, 64, { at: at + i * 0.2 });
      this.text(s.label, { x: s.logo ? x + 30 : x, y: hy - 26, w: 340, align: 'c', size: 32, weight: 700, color: s.color || 'ink', at: at + 0.1 + i * 0.2, mode: 'fade' });
      this.line(x, o.y0, x, o.y1, { color: 'faint', sw: 3, at: at + 0.3 + i * 0.2, dur: 0.6, dashed: true });
    });
    const self = this;
    return {
      send(y, dir, t, label, oo = {}) {
        const c = oo.color || (dir === 'r' ? 'blue' : 'green'), dur = oo.dur ?? 0.9;
        const [xa, xb] = dir === 'r' ? [o.xl + 10, o.xr - 10] : [o.xr - 10, o.xl + 10];
        self.arrow(xa, y, xb, y, { color: c, sw: 3, at: t, dur, dashed: oo.dashed, head: 16 });
        const w = oo.w ?? 330, L = self.layer();
        L.box(xa - w / 2, y - 30, w, 56, { r: 10, fill: 'paper', color: c, sw: 2.4, at: -5, dur: 0.01, texture: false, rough: 0.7 });
        L.text(label, { x: xa, y: y - 23, w: w + 40, align: 'c', size: oo.size ?? 27, font: 'mono', weight: 700, color: c, at: -5, mode: 'fade', dur: 0.01, raw: true });
        self.tick((lt) => {
          const k = clamp((lt - t) / dur), park = ease.inOut(clamp((lt - t - dur) / 0.4));
          const x = lerp(0, xb - xa, ease.inOut(k)) * (1 - park) + ((xb - xa) / 2) * park;
          L.wrap.style.opacity = lt < t ? '0' : '1';
          L.wrap.style.transform = `translate(${x.toFixed(1)}px, ${(-38 * park).toFixed(1)}px) scale(${lerp(1, 0.9, park).toFixed(3)})`;
          L.wrap.style.transformOrigin = `${xa}px ${y}px`;
        });
        return L;
      },
    };
  };

  /**
   * jsonPanel(x, y, w, h, frames, o) — a paper card that shows the latest frame whose t ≤ lt; each frame types in at o.cps.
   * frames: [{ t, lines: [str], title, color }]. JSON lines are syntax-coloured.
   */
  B.jsonPanel = function (x, y, w, hh, frames, o = {}) {
    const at = o.at ?? 0, size = o.size ?? 24, cps = o.cps ?? 120;
    this.box(x, y, w, hh, { r: 16, fill: 'paper', color: 'soft', sw: 2.4, at, dur: 0.6, texture: false });
    const head = h('div', 'tx hand', '', this.html), body = h('div', 'tx mono', '', this.html);
    Object.assign(head.style, { left: x + 26 + 'px', top: y + 14 + 'px', fontSize: '26px', fontWeight: 700, whiteSpace: 'nowrap' });
    Object.assign(body.style, { left: x + 26 + 'px', top: y + 62 + 'px', width: w - 52 + 'px', fontSize: size + 'px', lineHeight: 1.5, whiteSpace: 'pre', color: col('ink') });
    this.show(head, { at: at + 0.3 }); this.show(body, { at: at + 0.3 });
    this.tick((lt) => {
      let f = null;
      for (const fr of frames) if (lt >= fr.t) f = fr;
      if (!f) { if (body._k !== '') { body._k = ''; body.innerHTML = ''; head.innerHTML = ''; } return; }
      let n = Math.floor((lt - f.t) * cps);
      const shown = [];
      for (const ln of f.lines) { if (n <= 0) break; shown.push(ln.slice(0, n)); n -= ln.length + 1; }
      const key = f.t + '|' + shown.length + '|' + (shown[shown.length - 1] || '').length;
      if (body._k === key) return;
      body._k = key;
      body.innerHTML = shown.map(hlJson).join('\n');
      head.innerHTML = esc(f.title || '');
      head.style.color = col(f.color || 'soft');
    });
  };

  /**
   * fold3d(cards, o) — cards standing on a shelf that fold backwards (rotateX) into thin name tabs, and can stand up again.
   * cards: [{ x, y, w, h, name, sub, color, lines }]; o.fold(i, lt) → 0 (standing) .. 1 (folded). Needs P.host perspective.
   */
  B.fold3d = function (cards, o = {}) {
    const at = o.at ?? 0;
    this.host.style.perspective = (o.persp ?? 1400) + 'px';
    return cards.map((c, i) => {
      const L = this.layer(), t0 = at + i * (o.stagger ?? 0.05), col0 = c.color || 'blue';
      L.box(c.x, c.y, c.w, c.h, { r: 10, fill: col0 + 'F', color: col0, sw: 2.2, at: t0, dur: 0.3, texture: false, rough: 0.7 });
      L.text(c.name, { x: c.x + c.w / 2, y: c.y + 10, w: c.w, align: 'c', size: o.size ?? 22, font: 'mono', weight: 700, color: col0, at: t0 + 0.1, mode: 'fade', dur: 0.2, raw: true });
      if (c.sub) L.text(c.sub, { x: c.x + c.w / 2, y: c.y + 46, w: c.w, align: 'c', size: 24, font: 'latin', color: 'soft', at: t0 + 0.15, mode: 'fade', dur: 0.2, raw: true });
      const ly = c.y + (c.sub ? 94 : 56);
      for (let k = 0; k < (c.lines ?? 4); k++) L.line(c.x + 14, ly + k * 22, c.x + c.w - 14 - ((k * 37) % 50), ly + k * 22, { color: 'faint', sw: 5, at: t0 + 0.15, dur: 0.2 });
      if (o.tabs !== false) this.follow((lt) => { const f = clamp(o.fold ? o.fold(i, lt) : 0); return f < 0.5 ? null : { text: c.name, x: c.x + c.w / 2, y: c.y + c.h + 2, opacity: (f - 0.5) * 2 }; },
        { size: o.size ?? 24, font: 'mono', weight: 700, color: col0, w: c.w + 20 });
      this.tick((lt) => {
        const f = clamp(o.fold ? o.fold(i, lt) : 0);
        L.wrap.style.transformOrigin = `${c.x + c.w / 2}px ${c.y + c.h}px`;
        L.wrap.style.transform = `rotateX(${(f * 84).toFixed(2)}deg)`;
      });
      return L;
    });
  };

  /**
   * stack3d(o) — layers as CSS-3D slabs. o: { cx, cy, w, h, gap, layers: [{ label, at }], color(i, lt) → key,
   *   tilt(lt) → { rx, rz }, persp }. Layer 0 is the bottom. Returns the group layer.
   */
  B.stack3d = function (o) {
    const w = o.w ?? 520, hh = o.h ?? 300, gap = o.gap ?? 90, x = o.cx - w / 2, y = o.cy - hh / 2;
    this.host.style.perspective = (o.persp ?? 1800) + 'px';
    const S = this.layer();
    S.wrap.style.transformStyle = 'preserve-3d';
    S.wrap.style.transformOrigin = `${o.cx}px ${o.cy}px`;
    const slabs = o.layers.map((ly, i) => {
      const L = S.layer();
      L.liveRough((lt, R) => {
        if (lt < ly.at) return null;
        const c = o.color(i, lt);
        return [R.box(x, y, w, hh, { r: 18, fill: c + 'F', color: c, sw: 3, seed: 70 + i * 5, rough: 0.8 })];
      });
      L.follow((lt) => (lt < ly.at ? null : { text: ly.label, x: o.cx, y: y + hh - 78, color: o.color(i, lt) }), { size: o.size ?? 44, weight: 700, w });
      return { L, at: ly.at };
    });
    this.tick((lt) => {
      const tl = o.tilt ? o.tilt(lt) : {};
      S.wrap.style.transform = `rotateX(${(tl.rx ?? 56).toFixed(2)}deg) rotateZ(${(tl.rz ?? -30).toFixed(2)}deg)`;
      slabs.forEach((s, i) => {
        const k = ease.out(clamp((lt - s.at) / 0.6));
        s.L.wrap.style.transform = `translateZ(${(i * gap + (1 - k) * 300).toFixed(1)}px)`;
        s.L.wrap.style.opacity = k.toFixed(3);
      });
    });
    return S;
  };
})();
