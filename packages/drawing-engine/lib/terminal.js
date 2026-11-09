/* Terminal and timeline: a terminal window whose lines follow lt (term), a lane Gantt chart swept by a playhead (gantt), and packets
 * flowing along a polyline (flow). All pure in lt. */
(function () {
  const { h, col, clamp, ease, Builder } = PV;
  const B = Builder.prototype;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  /** Tiny line markup for term(): {r:red} {g:..} {b:..} {o:..} {m:muted} {p:..} {s:soft} {k:ink}. */
  const TAGS = { r: 'red', g: 'green', b: 'blue', o: 'orange', m: 'muted', p: 'purple', s: 'soft', k: 'ink' };
  const mark = (s) => esc(s).replace(/\{([rgbomspk]):([^{}]*)\}/g, (_, c, t) => `<span style="color:${col(TAGS[c])}">${t}</span>`);
  PV.SPIN = (lt) => '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'[Math.floor(lt * 12) % 10];

  /**
   * term(x, y, w, h, o) — a paper terminal window. o: { at, title, size, lines(lt) → [str] | null, color }
   * Lines use the {r:…} markup; a trailing '▍' blinks as a cursor if o.cursor(lt) is true.
   */
  B.term = function (x, y, w, hh, o = {}) {
    const at = o.at ?? 0, size = o.size ?? 28, c = o.color || 'soft';
    this.box(x, y, w, hh, { r: 16, fill: 'paper', color: c, sw: 2.6, at, dur: 0.7, texture: false });
    this.line(x + 4, y + 50, x + w - 4, y + 50, { color: 'faint', sw: 2, at: at + 0.3, dur: 0.4 });
    ['red', 'orange', 'green'].forEach((k, i) => this.circle(x + 30 + i * 28, y + 25, 15, { fill: k + 'F', color: k, sw: 1.6, at: at + 0.35 + i * 0.05, dur: 0.2 }));
    if (o.title) this.text(o.title, { x: x + w / 2, y: y + 8, w: w - 200, align: 'c', size: 24, color: 'muted', at: at + 0.4, mode: 'fade' });
    const el = h('div', 'tx mono', '', this.html);
    Object.assign(el.style, { left: x + 26 + 'px', top: y + 66 + 'px', width: w - 52 + 'px', fontSize: size + 'px', lineHeight: 1.55, whiteSpace: 'pre-wrap', color: col('ink') });
    this.show(el, { at: at + 0.5, dur: 0.3, dy: 0 });
    this.tick((lt) => {
      const L = o.lines ? o.lines(lt) : null;
      const html = L ? L.map(mark).join('<br>') + (o.cursor && o.cursor(lt) && Math.floor(lt * 2.2) % 2 === 0 ? '<span style="color:#9C9186">▍</span>' : '') : '';
      if (el._h !== html) { el._h = html; el.innerHTML = html; }
    });
    return el;
  };

  /**
   * gantt(o) — o: { x, y, w, laneH, gap, lanes: [{ label, color }], span: seconds shown, clock(lt) → data seconds,
   *   bars: [{ lane, a, b, label, color, ghost }], at, axis: true, labelW }
   * A bar grows from a to min(b, clock); its label fades in when the clock reaches a. Returns { X(sec), laneY(i) }.
   */
  B.gantt = function (o) {
    const lw = o.labelW ?? 230, x0 = o.x + lw, W = o.w - lw, lh = o.laneH ?? 70, gap = o.gap ?? 26, at = o.at ?? 0;
    const X = (s) => x0 + (s / o.span) * W, laneY = (i) => o.y + i * (lh + gap);
    o.lanes.forEach((ln, i) => {
      this.text(ln.label, { x: o.x, y: laneY(i) + lh / 2 - (ln.size ?? 30) * 0.72, w: lw - 20, size: ln.size ?? 30, weight: 700, color: ln.color || 'ink', at: at + i * 0.1, mode: 'fade' });
      this.line(x0, laneY(i) + lh, x0 + W, laneY(i) + lh, { color: 'faint', sw: 1.6, at: at + 0.1 + i * 0.1, dur: 0.5 });
    });
    const bottom = laneY(o.lanes.length - 1) + lh;
    if (o.axis !== false) {
      this.line(x0, o.y - 10, x0, bottom + 8, { color: 'soft', sw: 2.2, at, dur: 0.4 });
      for (let s = 0; s <= o.span + 1e-6; s += o.tick ?? 1) {
        this.text(o.fmt ? o.fmt(s) : s + 's', { x: X(s), y: bottom + 14, w: 120, align: 'c', size: 22, font: 'mono', color: 'muted', at: at + 0.3, mode: 'fade' });
      }
    }
    const clock = (lt) => (lt < at ? 0 : o.clock(lt));
    this.liveRough((lt, R) => {
      const t = clock(lt), out = [];
      o.bars.forEach((b, i) => {
        if (t <= b.a) return;
        const e = Math.min(t, b.b), c = b.color || 'blue', y = laneY(b.lane) + (b.dy ?? 8), hh = b.h ?? lh - 16;
        const w = X(e) - X(b.a);
        if (w < 2) return;
        out.push(R.box(X(b.a), y, w, hh, { r: 8, fill: b.ghost ? 'paper' : c + 'F', color: c, sw: 2.2, seed: 40 + i * 3, rough: 0.7 }));
      });
      if (o.playhead !== false && t > 0) {
        const px = X(Math.min(t, o.span));
        out.push(R.line(px, o.y - 24, px, bottom + 6, { color: o.playColor || 'red', sw: 2.6, seed: 9, rough: 0.3 }));
      }
      return out;
    });
    o.bars.forEach((b) => {
      if (!b.label) return;
      const y = laneY(b.lane) + (b.dy ?? 8), hh = b.h ?? lh - 16, size = b.size ?? 24;
      const el = this.text(b.label, { x: X(b.a) + 12, y: y + (hh - size * 1.4) / 2, size, font: b.font || 'hand', weight: 700, color: b.color || 'blue', at: -5, mode: 'fade', dur: 0.01, raw: b.raw });
      this.tick((lt) => { el.el.style.opacity = clamp((clock(lt) - b.a) / Math.max(0.05, (b.b - b.a) * 0.3)).toFixed(3); });
    });
    return { X, laneY, bottom, clock };
  };

  /**
   * flow(pts, packets, o) — packets travel along a polyline pts [[x, y], …].
   * packets: [{ t, label, color, w }]; o: { dur, h, size, fade: true }. Each packet is a rough chip on its own layer.
   */
  B.flow = function (pts, packets, o = {}) {
    const segs = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); total += l; }
    const at = (u) => {
      let d = u * total;
      for (let i = 0; i < segs.length; i++) {
        if (d <= segs[i] || i === segs.length - 1) { const k = segs[i] ? clamp(d / segs[i]) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; }
        d -= segs[i];
      }
      return pts[pts.length - 1];
    };
    const hh = o.h ?? 46, dur = o.dur ?? 1.6, [sx, sy] = pts[0];
    return packets.map((pk) => {
      const L = this.layer(), w = pk.w ?? 90;
      L.chip(sx - w / 2, sy - hh / 2, w, pk.label, { color: pk.color || 'blue', at: -5, h: hh, size: pk.size ?? o.size ?? 24 });
      this.tick((lt) => {
        const u = (lt - pk.t) / (pk.dur ?? dur);
        if (u < 0 || (u > 1 && !pk.stay)) { L.wrap.style.opacity = '0'; return; }
        const [px, py] = at((pk.ease || ease.inOut)(clamp(u)));
        L.wrap.style.transform = `translate(${(px - sx).toFixed(1)}px, ${(py - sy).toFixed(1)}px)`;
        const fade = o.fade === false || pk.stay ? 1 : Math.min(1, u * 8, (1 - u) * 8);
        L.wrap.style.opacity = clamp(fade).toFixed(3);
      });
      return L;
    });
  };
})();
