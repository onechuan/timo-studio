/* A pipeline (pipeline): a packet walks down a column of steps; each step either emits a fragment that flies into a result panel,
 * or puffs out a grey "null" that drifts away. Pure in lt. */
(function () {
  const { clamp, lerp, ease, Builder } = PV;

  /**
   * pipeline(o) — o: { x, y, w, h, gap, at (packet enters), step (s per pipe) | times: [tOut per pipe], ctx (packet label, default 'ctx'), panel.title (caption above the result panel),
   *   segs: [{ name, color, out: bool, frag, tok }], panel: { x, y, w, rowH }, emitColor(i) }
   * Returns { tIn(i) (packet reaches pipe i), tOut(i) (pipe i answers), total(lt) (tokens landed so far), slot(i) }.
   */
  Builder.prototype.pipeline = function (o) {
    const { x, y, w } = o, hh = o.h ?? 84, gap = o.gap ?? 26, at = o.at ?? 0, step = o.step ?? 1.4;
    const segs = o.segs, n = segs.length, rowY = (i) => y + i * (hh + gap);
    const tOut = (i) => (o.times ? o.times[i] : at + 1.05 + i * step), tIn = (i) => tOut(i) - 0.45;
    const pn = o.panel, rowH = pn.rowH ?? 76;
    // pipes, with short connectors between them
    segs.forEach((sg, i) => {
      const c = sg.color || 'blue';
      this.box(x, rowY(i), w, hh, { r: 14, fill: 'paper', color: c, sw: 2.6, at: at + i * 0.08, dur: 0.4, texture: false });
      this.text(sg.name, { x: x + w / 2, y: rowY(i) + hh / 2 - 19, w, align: 'c', size: 28, font: 'mono', weight: 700, color: c, at: at + 0.1 + i * 0.08, mode: 'fade', raw: true });
      if (i < n - 1) this.line(x + w / 2, rowY(i) + hh + 2, x + w / 2, rowY(i + 1) - 2, { color: 'faint', sw: 5, at: at + 0.2 + i * 0.08, dur: 0.2 });
    });
    // the pipe being visited glows
    this.liveRough((lt, R) => {
      const out = [];
      segs.forEach((sg, i) => {
        const k = clamp((lt - tIn(i) + 0.15) / 0.2) * (1 - clamp((lt - tOut(i) - 0.35) / 0.4));
        if (k > 0.02) out.push(R.box(x - 8, rowY(i) - 8, w + 16, hh + 16, { r: 18, color: sg.color || 'blue', sw: 2 + 3 * k, seed: 40 + i, rough: 0.6 }));
      });
      return out.length ? out : null;
    });
    // the ctx packet: slides down the column and leaves at the bottom
    const pk = this.layer();
    const pw = 120, px = x - pw - 40;
    pk.mtag(px, y + (hh - 52) / 2, pw, o.ctx || 'ctx', { at, color: 'orange' });
    this.tick((lt) => {
      let yy = 0;
      for (let i = 1; i < n; i++) yy += (hh + gap) * ease.inOut(clamp((lt - tOut(i - 1) - 0.25) / Math.min(0.9, tIn(i) - tOut(i - 1) - 0.25)));
      pk.wrap.style.transform = `translateY(${yy.toFixed(1)}px)`;
      pk.wrap.style.opacity = (1 - clamp((lt - tOut(n - 1) - 0.4) / 0.5)).toFixed(3);
    });
    // the panel the fragments land in
    this.box(pn.x, pn.y, pn.w, pn.h, { r: 18, fill: 'paper', color: 'soft', sw: 2.4, at: at + 0.2, dur: 0.6, texture: false });
    if (pn.title) this.text(pn.title, { x: pn.x + pn.w / 2, y: pn.y - 52, w: pn.w, align: 'c', size: 30, weight: 700, color: 'soft', at: at + 0.3, mode: 'fade' });
    let k = 0;
    const slots = segs.map((sg) => (sg.out ? k++ : -1));
    segs.forEach((sg, i) => {
      const c = sg.color || 'blue';
      if (!sg.out) {   // a grey puff of "null"
        this.liveRough((lt, R) => {
          const u = clamp((lt - tOut(i)) / 1.3);
          if (u <= 0 || u >= 1) return null;
          const cx = x + w + 60 + u * 70, cy = rowY(i) + hh / 2 - u * 50, a = (1 - u) * 0.8;
          return [0, 1, 2].map((j) => R.circle(cx + j * 26 - 20, cy + (j % 2) * 12, 26 + u * 40 + j * 8, { color: `rgba(156,145,134,${a.toFixed(2)})`, sw: 2, seed: 80 + i * 3 + j }));
        });
        this.follow((lt) => { const u = clamp((lt - tOut(i)) / 1.6); return u <= 0 || u >= 1 ? null : { text: 'null', x: x + w + 90 + u * 60, y: rowY(i) + hh / 2 - 22 - u * 60, opacity: Math.min(1, (1 - u) * 2.2) }; },
          { size: 34, font: 'mono', weight: 700, color: 'muted', w: 160 });
        return;
      }
      const sx = pn.x + 20, sy = pn.y + 24 + slots[i] * rowH, sw = pn.w - 40, t0 = tOut(i);
      const L = this.layer();
      L.box(sx, sy, sw, rowH - 14, { r: 10, fill: c + 'F', color: c, sw: 2.2, at: t0, dur: 0.25, texture: false, rough: 0.7 });
      L.text(sg.frag, { x: sx + 20, y: sy + (rowH - 14) / 2 - 19, size: 26, font: 'mono', weight: 700, color: c, at: t0 + 0.05, mode: 'fade', dur: 0.2, raw: true });
      L.text(`${sg.tok}`, { x: sx + sw - 20, y: sy + (rowH - 14) / 2 - 20, w: 100, align: 'r', size: 30, font: 'latin', weight: 700, color: c, at: t0 + 0.05, mode: 'fade', dur: 0.2 });
      const dx0 = x + w + 20 - sx, dy0 = rowY(i) + (hh - rowH + 14) / 2 - sy;
      this.tick((lt) => {
        const u = ease.inOut(clamp((lt - t0) / 0.8)), arc = Math.sin(u * Math.PI) * -60;
        L.wrap.style.transform = `translate(${(dx0 * (1 - u)).toFixed(1)}px, ${(dy0 * (1 - u) + arc).toFixed(1)}px)`;
      });
    });
    const total = (lt) => segs.reduce((a, sg, i) => a + (sg.out && lt >= tOut(i) + 0.8 ? sg.tok : 0), 0);
    return { tIn, tOut, total, slot: (i) => slots[i], rowY };
  };
})();
