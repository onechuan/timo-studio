/* A strip of segments (strip): one whole drawn as a horizontal band of parts whose widths and colours follow lt — a budget, a
 * request, a day — with an optional green "kept" bar above and a red wave over a part being redone. Pure in lt. */
(function () {
  const { clamp, Builder } = PV;

  /**
   * strip(x, y, w, h, o) — o: { at, max (units that fill w), segs(lt) → [{ v, color, label, font, size }],
   *   hit(lt) → units of the kept prefix (green bar above) | null, wave(lt) → { from, to } units drawn red (redone) | null, n (label slots) }
   * Returns { X(units), total(lt) }.
   */
  Builder.prototype.strip = function (x, y, w, hh, o = {}) {
    const at = o.at ?? 0, sc = w / (o.max ?? 100), X = (u) => x + u * sc;
    const grow = (lt) => PV.ease.out(clamp((lt - at) / 0.6));
    const layout = (lt) => {
      let u = 0;
      return (o.segs(lt) || []).map((sg) => { const r = Object.assign({ a: u }, sg); u += Math.max(0, sg.v); r.b = u; return r; });
    };
    const total = (lt) => { const L = layout(lt); return L.length ? L[L.length - 1].b : 0; };
    this.liveRough((lt, R) => {
      const g = grow(lt);
      if (g <= 0) return null;
      const out = [];
      layout(lt).forEach((sg, i) => {
        const a = X(sg.a * g), b = X(sg.b * g);
        if (b - a < 3) return;
        const c = sg.color || 'blue';
        out.push(R.box(a + 3, y, b - a - 6, hh, { r: 10, fill: (sg.fill || c + 'F'), color: c, sw: 2.4, seed: 300 + i * 7, rough: 0.7 }));
      });
      const hit = o.hit ? o.hit(lt) : null;
      if (hit != null && hit > 0.01) out.push(R.line(x + 4, y - 18, X(hit) - 4, y - 18, { color: 'green', sw: 7, rough: 0.4, seed: 91 }));
      const wv = o.wave ? o.wave(lt) : null;
      if (wv && wv.to - wv.from > 0.01) {
        out.push(R.line(X(wv.from) + 4, y - 18, X(wv.to) - 4, y - 18, { color: 'red', sw: 7, rough: 0.4, seed: 93 }));
        out.push(R.box(X(wv.from) + 2, y - 6, X(wv.to) - X(wv.from) - 4, hh + 12, { r: 12, color: 'red', sw: 3.2, seed: 95, rough: 0.9, fill: 'rgba(196,80,64,0.16)', fillStyle: 'solid' }));
      }
      return out;
    });
    for (let i = 0; i < (o.n ?? 8); i++) {
      this.follow((lt) => {
        const g = grow(lt), sg = layout(lt)[i];
        if (!sg || !sg.label || g < 1) return null;
        const a = X(sg.a), b = X(sg.b);
        if (b - a < 40) return null;
        return { text: sg.label, x: (a + b) / 2, y: y + hh / 2 - (sg.size ?? 26) * 0.72, color: sg.tcolor || sg.color || 'ink', opacity: clamp((b - a - 40) / 40) };
      }, { size: o.size ?? 26, font: o.font || 'hand', weight: 700, w: 420 });
    }
    return { X, total };
  };
})();
