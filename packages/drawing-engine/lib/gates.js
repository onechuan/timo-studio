/* Stages a thing passes through: a row of dots that marks the current stage (stageDots), a CSS-3D corridor of gates a packet walks
 * through (gates3d), and a chip that follows a path (pkt). Stages are [{ label, color }], one colour each. All pure in lt. */
(function () {
  const { clamp, ease, Builder } = PV;
  const B = Builder.prototype;
  const stage = (s) => ({ n: s.label, c: s.color || 'blue', f: s.color && s.color !== 'soft' ? s.color + 'F' : 'paper' });

  /** stageDots(steps, cur, o) — one dot per stage on a line (top right by default); stage `cur` (0-based) is filled and named. o: { at, x, y, gap } */
  B.stageDots = function (steps, cur, o = {}) {
    const S = steps.map(stage), at = o.at ?? 0.1, sp = o.gap ?? 80, x0 = o.x ?? 1730 - sp * (S.length - 1), y = o.y ?? 86;
    this.line(x0, y, x0 + sp * (S.length - 1), y, { color: 'faint', sw: 3, at, dur: 0.4, rough: 0.4 });
    S.forEach((s, i) => {
      const on = i === cur, x = x0 + i * sp;
      this.circle(x, y, on ? 56 : 30, { fill: on || i < cur ? s.f === 'paper' ? 'faint' : s.f : 'paper', color: i <= cur ? s.c : 'faint', sw: on ? 3.2 : 2, at: at + 0.05 * i, dur: 0.25 });
      if (on) this.text(String(i + 1), { x, y: y - 20, w: 40, align: 'c', size: 28, font: 'latin', weight: 700, color: s.c, at: at + 0.4, mode: 'fade' });
    });
    const s = S[cur];
    this.text(s.n, { x: x0 + cur * sp, y: y + 34, w: 220, align: 'c', size: 26, weight: 700, color: s.c, at: at + 0.45, mode: 'fade' });
  };

  /**
   * gates3d(o) — door frames receding in depth (CSS 3D), one per stage, a floor track, and a packet travelling through them.
   * o: { cx, cy, w, h, gap, persp, steps: [{ label, color }], at(i) → t, view(lt) → { ry, rx, tx, ty }, pos(lt) → gate index (float, -1 = before gate 0) | null,
   *      pass(i) → t (green check on gate i's plaque), label: packet text }
   */
  B.gates3d = function (o) {
    const ST = o.steps.map(stage), n = ST.length, gap = o.gap ?? 300, w = o.w ?? 340, hh = o.h ?? 400;
    const x = o.cx - w / 2, y = o.cy - hh / 2;
    this.host.style.perspective = (o.persp ?? 1500) + 'px';
    const S = this.layer();
    S.wrap.style.transformStyle = 'preserve-3d';
    S.wrap.style.transformOrigin = `${o.cx}px ${o.cy}px 0px`;
    // floor: drawn "above" the base line, then laid flat along -z
    const F = S.layer(), fy = y + hh, len = gap * (n + 0.6);
    F.line(o.cx - w / 2 + 30, fy, o.cx - w / 2 + 30, fy - len, { color: 'faint', sw: 3, at: o.at(0), dur: 0.8 });
    F.line(o.cx + w / 2 - 30, fy, o.cx + w / 2 - 30, fy - len, { color: 'faint', sw: 3, at: o.at(0) + 0.1, dur: 0.8 });
    F.wrap.style.transformOrigin = `${o.cx}px ${fy}px`;
    F.wrap.style.transform = `translateZ(${gap * 0.6}px) rotateX(90deg)`;
    const gates = ST.map((st, i) => {
      const L = S.layer(), t0 = o.at(i);
      L.path(`M${x} ${y + hh} L${x} ${y} L${x + w} ${y} L${x + w} ${y + hh}`, { color: st.c, sw: 8, at: t0, dur: 0.45, rough: 0.7 });
      L.circle(o.cx, y - 56, 84, { fill: st.f, color: st.c, sw: 3, at: t0 + 0.2, dur: 0.3 });
      L.text(String(i + 1), { x: o.cx, y: y - 84, w: 80, align: 'c', size: 44, font: 'latin', weight: 700, color: st.c, at: t0 + 0.3, mode: 'fade' });
      if (o.pass) L.check(o.cx + 70, y - 56, 48, { at: o.pass(i) });
      L.wrap.style.transform = `translateZ(${-i * gap}px)`;
      return L;
    });
    // packet
    const K = S.layer(), pw = o.pw ?? 200;
    K.chip(o.cx - pw / 2, y + hh - 90, pw, o.label ?? '', { color: 'orange', fill: 'yellow', at: -5, h: 64, size: 32 });
    this.tick((lt) => {
      const v = o.view ? o.view(lt) : {};
      S.wrap.style.transform = `translate(${(v.tx ?? 0).toFixed(1)}px, ${(v.ty ?? 0).toFixed(1)}px) rotateX(${(v.rx ?? -8).toFixed(2)}deg) rotateY(${(v.ry ?? -50).toFixed(2)}deg)`;
      gates.forEach((L, i) => { const k = ease.out(clamp((lt - o.at(i)) / 0.5)); L.wrap.style.opacity = k.toFixed(3); L.wrap.style.transform = `translateZ(${(-i * gap + (1 - k) * 200).toFixed(1)}px)`; });
      const p = o.pos ? o.pos(lt) : null;
      K.wrap.style.opacity = p == null ? '0' : '1';
      if (p != null) K.wrap.style.transform = `translateZ(${(-p * gap).toFixed(1)}px)`;
    });
    return { S, gates };
  };

  /** pkt(label, w, fn, o) — a chip on its own layer; move it with pk.at(lt) → { x, y, c?, op? } (x, y = centre). */
  B.pkt = function (label, w, fn, o = {}) {
    const L = this.layer(), hh = o.h ?? 58, cols = o.colors || ['orange'];
    const sub = cols.map((c) => { const S2 = L.layer(); S2.chip(-w / 2 + 960, -hh / 2 + 540, w, label, { color: c, fill: c === 'orange' ? 'yellow' : c + 'F', at: -5, h: hh, size: o.size ?? 28 }); return S2; });
    this.tick((lt) => {
      const v = fn(lt);
      if (!v) { L.wrap.style.opacity = '0'; return; }
      L.wrap.style.opacity = (v.op ?? 1).toFixed(3);
      L.wrap.style.transform = `translate(${(v.x - 960).toFixed(1)}px, ${(v.y - 540).toFixed(1)}px) rotate(${(v.rot ?? 0).toFixed(1)}deg)`;
      sub.forEach((S2, i) => { S2.wrap.style.opacity = i === (v.c ?? 0) ? '1' : '0'; });
    });
    return L;
  };
})();
