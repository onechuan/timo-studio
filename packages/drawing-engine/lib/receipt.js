/* A receipt printer that prints one priced line at a time (receipt), and a zipper that compares two lists top-down and closes
 * over the rows that match (zipper). Both pure in lt. */
(function () {
  const { h, col, clamp, ease, Builder } = PV;
  const B = Builder.prototype;

  /**
   * receipt(x, y, w, o) — a printer head at (x, y) with a paper strip growing downward, one row at a time.
   * o: { at, rows: [[left, right]], rowT(i) → time row i prints, winH (visible paper height), rowH, size, title, color,
   *      total(lt) → str (shown in the printer head, right side) }
   * When more rows than fit have printed, the strip scrolls up (old rows slide back under the printer).
   */
  B.receipt = function (x, y, w, o = {}) {
    const at = o.at ?? 0, rowH = o.rowH ?? 40, size = o.size ?? 26, winH = o.winH ?? 520, c = o.color || 'ink';
    const n = o.rows.length, headH = 84;
    const printed = (lt) => { let k = 0; for (let i = 0; i < n; i++) k += clamp((lt - o.rowT(i)) / 0.35); return k; };
    const paperH = (lt) => Math.min(winH, 30 + printed(lt) * rowH);
    // paper (behind the head)
    this.liveRough((lt, R) => {
      if (lt < at + 0.3 || printed(lt) <= 0) return null;
      return [R.box(x + 24, y + headH - 10, w - 48, paperH(lt) + 10, { r: 4, fill: 'paper', color: 'soft', sw: 2, seed: 5, rough: 0.6 })];
    });
    // rows, clipped to the paper window
    const clip = h('div', null, null, this.html);
    Object.assign(clip.style, { position: 'absolute', left: x + 40 + 'px', top: y + headH + 'px', width: w - 80 + 'px', height: winH + 'px', overflow: 'hidden' });
    const inner = h('div', null, null, clip);
    Object.assign(inner.style, { position: 'absolute', left: 0, top: 0, width: '100%' });
    const rows = o.rows.map(([l, r], i) => {
      const d = h('div', 'tx mono', null, inner);
      Object.assign(d.style, { position: 'absolute', left: 0, top: 14 + i * rowH + 'px', width: '100%', fontSize: size + 'px', color: col(c), display: 'flex', justifyContent: 'space-between', whiteSpace: 'nowrap' });
      d.innerHTML = `<span>${l}</span><span>${r}</span>`;
      return d;
    });
    this.tick((lt) => {
      const k = printed(lt), shift = Math.max(0, 30 + k * rowH - winH);
      inner.style.transform = `translateY(${(-shift).toFixed(1)}px)`;
      rows.forEach((d, i) => { const v = clamp((lt - o.rowT(i)) / 0.35); d.style.opacity = v.toFixed(3); });
      clip.style.opacity = lt < at ? '0' : '1';
    });
    // printer head on top
    this.box(x, y, w, headH, { r: 16, fill: (o.fill || 'faint'), color: c, sw: 2.8, at, dur: 0.6, texture: false });
    this.line(x + 20, y + headH - 12, x + w - 20, y + headH - 12, { color: c, sw: 3, at: at + 0.3, dur: 0.3 });
    if (o.title) this.text(o.title, { x: x + 28, y: y + 14, size: 32, weight: 700, color: o.tcolor || c, at: at + 0.3, mode: 'fade' });
    if (o.total) this.follow((lt) => (lt < at + 0.4 ? null : { text: o.total(lt), x: x + w - 130, y: y + 12, color: o.tcolor }), { size: 40, font: 'latin', weight: 700, color: c, w: 240 });
    return { printed, paperH, bottom: (lt) => y + headH + paperH(lt) };
  };

  /**
   * zipper(o) — two lists as columns of row blocks, compared top-down. o: { x, y, cw (column width), gap, rows: [{ a, b, h, size }],
   *   at, head(lt) → y-progress in px from the top of the first row (or null), state(i, lt) → 'idle' | 'ok' | 'bad' | 'new' }
   * Matched rows get teeth between the columns; the head is a pull tab at the current progress.
   */
  B.zipper = function (o) {
    const at = o.at ?? 0, gap = o.gap ?? 80, x1 = o.x, x2 = o.x + o.cw + gap, mid = o.x + o.cw + gap / 2;
    let yy = o.y;
    const R0 = o.rows.map((r) => { const q = Object.assign({ y: yy }, r); yy += r.h + 10; return q; });
    const fillOf = { idle: 'paper', ok: 'greenF', bad: 'redF', new: 'orangeF' }, colOf = { idle: 'soft', ok: 'green', bad: 'red', new: 'orange' };
    this.liveRough((lt, R) => {
      if (lt < at) return null;
      const out = [];
      R0.forEach((r, i) => {
        const st = o.state(i, lt) || 'idle';
        out.push(R.box(x1, r.y, o.cw, r.h, { r: 10, fill: fillOf[st], color: colOf[st], sw: 2.4, seed: 10 + i, rough: 0.7 }));
        out.push(R.box(x2, r.y, o.cw, r.h, { r: 10, fill: fillOf[st], color: colOf[st], sw: 2.4, seed: 60 + i, rough: 0.7 }));
      });
      const hp = o.head ? o.head(lt) : null;
      if (hp != null) {
        const hy = o.y + hp, top = o.y;
        for (let ty = top + 8; ty < hy - 6; ty += 18) {
          out.push(R.line(mid - gap / 2 + 4, ty, mid + 6, ty + 9, { color: 'green', sw: 3, seed: 200 + ty, rough: 0.3 }));
          out.push(R.line(mid + gap / 2 - 4, ty + 9, mid - 6, ty + 18, { color: 'green', sw: 3, seed: 300 + ty, rough: 0.3 }));
        }
        out.push(R.box(mid - 22, hy - 16, 44, 36, { r: 8, fill: 'ink', color: 'ink', sw: 2, seed: 7 }));
        out.push(R.box(mid - 12, hy + 20, 24, 44, { r: 10, fill: 'soft', color: 'ink', sw: 2, seed: 8 }));
      }
      return out;
    });
    R0.forEach((r, i) => {
      const s = r.size ?? 26;
      this.text(r.a, { x: x1 + o.cw / 2, y: r.y + r.h / 2 - s * 0.72, w: o.cw - 20, align: 'c', size: s, font: r.font, color: r.ac || 'ink', at: at + 0.2 + i * 0.1, mode: 'fade', raw: r.raw });
      this.text(r.b, { x: x2 + o.cw / 2, y: r.y + r.h / 2 - s * 0.72, w: o.cw - 20, align: 'c', size: s, font: r.font, color: r.bc || 'ink', at: at + 0.2 + i * 0.1, mode: 'fade', raw: r.raw });
    });
    return { rows: R0, x1, x2, mid, bottom: yy };
  };
})();
