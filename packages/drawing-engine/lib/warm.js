/* Warm story illustration · flat illustration kit: metaphor objects for knowledge explainers (snowball, jar of coins, tree, trail,
 * hands, calendar, number tags). Flat fills, a soft shade and one highlight per object, no sketchy lines.
 * Every property that can change takes a number or a function of page-local time lt, so pages stay pure in t.
 * Entrances are a short ease-out rise (no bounce); objects never pop in from nothing mid-sentence without `at`. */
(function () {
  const { s, col, clamp, lerp, ease, Builder } = PV;
  const B = Builder.prototype;
  const val = (v, lt, d) => (typeof v === 'function' ? v(lt) : v ?? d);
  const rgb = (c) => { const h = col(c).replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  /** colour c darkened toward the palette ink by k (0..1) */
  const shade = (c, k = 0.2) => { const a = rgb(c), b = rgb('ink'); return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`; };
  const fmt = (n) => (+n).toFixed(2);

  /** entrance: rise 14px and fade over dur, ease-out; returns 0..1 */
  const enter = (lt, at, dur = 0.7) => ease.out(clamp((lt - at) / dur));
  /** draws an object into its own group, fading it in at o.at; it fades out at o.out, or from hide(t, dur) like any
   *  other element's handle */
  function mount(self, o, draw) {
    const g = s('g', { opacity: 0 }, self.svg);
    const at = o.at ?? 0, dur = o.dur ?? 0.7;
    let outAt = o.out, outDur = 0.5;
    const parts = draw(g);
    self.tick((lt) => {
      const k = enter(lt, at, dur);
      const out = outAt != null ? 1 - ease.out(clamp((lt - outAt) / outDur)) : 1;
      g.setAttribute('opacity', fmt(k * out));
      g.setAttribute('transform', `translate(0 ${fmt((1 - k) * 14)})`);
      parts?.update?.(lt);
    });
    return { g, ...(parts || {}), hide(t, d = 0.5) { outAt = t; outDur = Math.max(0.01, d); return this; } };
  }

  /** ground(y, o): a soft rolling hill line across the frame — o: { color, at, height } */
  B.ground = function (y, o = {}) {
    return mount(this, o, (g) => {
      const c = col(o.color || 'greenF'), h = o.height ?? 140;
      s('path', { d: `M-300 ${y + 10} C 380 ${y - 46} 720 ${y + 30} 1060 ${y - 8} S 1700 ${y - 40} 2220 ${y + 6} L2220 ${y + h} L-300 ${y + h} Z`, fill: c }, g);
      s('path', { d: `M-300 ${y + 26} C 500 ${y + 4} 980 ${y + 46} 2220 ${y + 22} L2220 ${y + h} L-300 ${y + h} Z`, fill: shade(c, 0.06), opacity: 0.6 }, g);
    });
  };

  /** snowball(cx, cy, r, o): a ball that can grow and roll — r, cx, cy, spin (degrees) may be functions of lt */
  B.snowball = function (cx, cy, r, o = {}) {
    return mount(this, o, (g) => {
      const body = s('g', {}, g);
      const base = col(o.color || 'paper');
      const ball = s('circle', { r: 1, fill: base, stroke: col(o.edge || 'faint'), 'stroke-width': 3 }, body);
      const sh = s('path', { fill: shade('blueF', 0.15), opacity: 0.55 }, body);
      const hi = s('ellipse', { fill: '#fff', opacity: 0.55 }, body);
      const dots = [0, 1, 2].map(() => s('circle', { r: 1, fill: col('blueF'), opacity: 0.9 }, body));
      const shadow = s('ellipse', { fill: col('ink'), opacity: 0.08 }, g);
      g.insertBefore(shadow, body);
      return {
        update(lt) {
          const R = val(r, lt), X = val(cx, lt), Y = val(cy, lt), rot = val(o.spin, lt, 0);
          ball.setAttribute('r', fmt(R));
          sh.setAttribute('d', `M${fmt(-R * 0.15)} ${fmt(-R)} A${fmt(R)} ${fmt(R)} 0 0 1 ${fmt(R * 0.35)} ${fmt(R * 0.94)} A${fmt(R * 1.05)} ${fmt(R * 1.05)} 0 0 0 ${fmt(-R * 0.15)} ${fmt(-R)} Z`);
          hi.setAttribute('cx', fmt(-R * 0.38)); hi.setAttribute('cy', fmt(-R * 0.4)); hi.setAttribute('rx', fmt(R * 0.22)); hi.setAttribute('ry', fmt(R * 0.14));
          dots.forEach((d, i) => { const a = (rot + i * 120) * Math.PI / 180; d.setAttribute('cx', fmt(Math.cos(a) * R * 0.55)); d.setAttribute('cy', fmt(Math.sin(a) * R * 0.5)); d.setAttribute('r', fmt(R * 0.07)); });
          body.setAttribute('transform', `translate(${fmt(X)} ${fmt(Y)})`);
          shadow.setAttribute('cx', fmt(X)); shadow.setAttribute('cy', fmt(Y + R * 0.98)); shadow.setAttribute('rx', fmt(R * 0.9)); shadow.setAttribute('ry', fmt(R * 0.16));
        },
      };
    });
  };

  /** jar(cx, bottomY, w, h, o): a glass jar holding coins — o: { level: 0..1 or fn(lt), label } */
  B.jar = function (cx, by, w, h, o = {}) {
    return mount(this, o, (g) => {
      const x0 = cx - w / 2, r = w * 0.16;
      s('ellipse', { cx, cy: by + 6, rx: w * 0.55, ry: 12, fill: col('ink'), opacity: 0.08 }, g);
      const clipId = 'jar' + Math.round(cx) + '_' + Math.round(by);
      const clip = s('clipPath', { id: clipId }, g);
      s('rect', { x: x0, y: by - h, width: w, height: h, rx: r }, clip);
      s('rect', { x: x0, y: by - h, width: w, height: h, rx: r, fill: col('blueF'), opacity: 0.35 }, g);
      const coins = s('g', { 'clip-path': `url(#${clipId})` }, g);
      const fill = s('rect', { x: x0, width: w, fill: col('orange') }, coins);
      const rows = [];
      for (let i = 0; i < 14; i++) rows.push(s('path', { fill: 'none', stroke: shade('orange', 0.25), 'stroke-width': 3, opacity: 0.5 }, coins));
      s('rect', { x: x0, y: by - h, width: w, height: h, rx: r, fill: 'none', stroke: col('soft'), 'stroke-width': 4, opacity: 0.55 }, g);
      s('rect', { x: x0 + w * 0.12, y: by - h + 22, width: w * 0.08, height: h * 0.55, rx: w * 0.04, fill: '#fff', opacity: 0.45 }, g);
      s('rect', { x: x0 - 8, y: by - h - 22, width: w + 16, height: 30, rx: 10, fill: col('soft') }, g);
      return {
        update(lt) {
          const lv = clamp(val(o.level, lt, 0));
          const top = by - lv * (h - 12);
          fill.setAttribute('y', fmt(top)); fill.setAttribute('height', fmt(by - top));
          rows.forEach((p, i) => {
            const y = by - 10 - i * 22;
            p.setAttribute('d', y > top + 6 ? `M${x0 + 10} ${y} q ${w / 4} -8 ${w / 2 - 10} 0 t ${w / 2 - 10} 0` : '');
          });
        },
      };
    });
  };

  /** coin(cx, cy, r, o): one coin; o.fall: { from (y), at, dur } drops it in with gravity and a small settle */
  B.coin = function (cx, cy, r = 34, o = {}) {
    return mount(this, { ...o, dur: 0.01 }, (g) => {
      const c = s('g', {}, g);
      s('ellipse', { cx: 0, cy: r * 0.12, rx: r, ry: r * 0.98, fill: shade('orange', 0.25) }, c);
      s('circle', { cx: 0, cy: 0, r, fill: col('orange') }, c);
      s('circle', { cx: 0, cy: 0, r: r * 0.68, fill: 'none', stroke: col('yellow'), 'stroke-width': r * 0.1, opacity: 0.8 }, c);
      s('ellipse', { cx: -r * 0.35, cy: -r * 0.38, rx: r * 0.2, ry: r * 0.12, fill: '#fff', opacity: 0.5 }, c);
      return {
        update(lt) {
          const f = o.fall;
          let y = val(cy, lt), x = val(cx, lt), op = 1;
          if (f) {
            const k = clamp((lt - (f.at ?? o.at ?? 0)) / (f.dur ?? 0.55));
            y = lerp(f.from ?? y - 400, y, k * k);
            op = k > 0 ? 1 : 0;
            if (f.vanish && k >= 1) op = 0;   // falls into a jar: gone once it lands
          }
          c.setAttribute('transform', `translate(${fmt(x)} ${fmt(y)})`);
          c.setAttribute('opacity', op);
        },
      };
    });
  };

  /** tree(cx, baseY, size, o): a tree that grows — o: { grow: 0..1 or fn(lt), fruits: count or fn(lt) } */
  B.tree = function (cx, by, size = 320, o = {}) {
    return mount(this, o, (g) => {
      const trunk = s('path', { fill: col('soft') }, g);
      const crowns = [[0, -0.78, 0.42], [-0.26, -0.62, 0.3], [0.27, -0.6, 0.31], [0, -0.98, 0.3]].map(([dx, dy, rr], i) => ({
        dx, dy, rr, el: s('circle', { fill: i % 2 ? shade('green', 0.08) : col('green') }, g),
      }));
      const fruits = [[-0.2, -0.7], [0.18, -0.82], [0.05, -0.55], [-0.08, -0.95], [0.3, -0.66], [-0.32, -0.56]].map(([dx, dy]) => ({ dx, dy, el: s('circle', { fill: col('red') }, g) }));
      return {
        update(lt) {
          const k = clamp(val(o.grow, lt, 1)), H = size * lerp(0.25, 1, k), W = size * 0.09 * lerp(0.5, 1, k);
          trunk.setAttribute('d', `M${fmt(cx - W / 2)} ${by} L${fmt(cx - W * 0.3)} ${fmt(by - H * 0.62)} L${fmt(cx + W * 0.3)} ${fmt(by - H * 0.62)} L${fmt(cx + W / 2)} ${by} Z`);
          crowns.forEach((c) => { c.el.setAttribute('cx', fmt(cx + c.dx * H)); c.el.setAttribute('cy', fmt(by + c.dy * H)); c.el.setAttribute('r', fmt(c.rr * H * ease.out(k))); });
          const n = val(o.fruits, lt, 0);
          fruits.forEach((f, i) => { const kk = clamp(n - i); f.el.setAttribute('cx', fmt(cx + f.dx * H)); f.el.setAttribute('cy', fmt(by + f.dy * H)); f.el.setAttribute('r', fmt(size * 0.035 * ease.out(kk))); });
        },
      };
    });
  };

  /** trail(points, o): a winding path drawn as a soft road — o: { progress: 0..1 or fn(lt), width, color, walker: true } */
  B.trail = function (pts, o = {}) {
    return mount(this, o, (g) => {
      const d = 'M' + pts.map((p) => p.join(' ')).join(' L');
      const w = o.width ?? 34;
      const base = s('path', { d, fill: 'none', stroke: col(o.color || 'orangeF'), 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      const mid = s('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-dasharray': '14 18', opacity: 0.7, 'stroke-linecap': 'round' }, g);
      const walker = o.walker ? s('circle', { r: w * 0.42, fill: col(o.walkerColor || 'blue') }, g) : null;
      let len = 0;
      return {
        update(lt) {
          if (!len) len = base.getTotalLength() || 1;
          const k = clamp(val(o.progress, lt, 1));
          for (const el of [base, mid]) { el.style.strokeDasharray = el === mid ? '14 18' : `${len} ${len}`; }
          base.style.strokeDashoffset = fmt(len * (1 - k));
          mid.setAttribute('opacity', k > 0.02 ? 0.7 : 0);
          mid.style.clipPath = '';
          if (walker) { const p = base.getPointAtLength(len * k); walker.setAttribute('cx', fmt(p.x)); walker.setAttribute('cy', fmt(p.y - w * 0.15)); walker.setAttribute('opacity', k > 0 ? 1 : 0); }
        },
        pointAt: (k) => { const L = base.getTotalLength(); const p = base.getPointAtLength(L * clamp(k)); return [p.x, p.y]; },
      };
    });
  };

  /** hand(cx, cy, size, o): a flat mitten hand seen from the side — o: { rot, color } (people stay faceless) */
  B.hand = function (cx, cy, size = 160, o = {}) {
    return mount(this, o, (g) => {
      const h = s('g', {}, g);
      const c = col(o.color || 'redF');
      s('rect', { x: -size * 0.95, y: -size * 0.16, width: size * 0.7, height: size * 0.34, rx: size * 0.12, fill: col('blue') }, h);
      s('path', { d: `M${-size * 0.3} ${-size * 0.22} q ${size * 0.55} ${-size * 0.12} ${size * 0.62} ${size * 0.16} q ${size * 0.04} ${size * 0.26} ${-size * 0.18} ${size * 0.3} l ${-size * 0.44} 0 z`, fill: c }, h);
      s('path', { d: `M${-size * 0.05} ${-size * 0.26} q ${size * 0.16} ${-size * 0.16} ${size * 0.26} ${-size * 0.02}`, fill: 'none', stroke: c, 'stroke-width': size * 0.12, 'stroke-linecap': 'round' }, h);
      return { update(lt) { h.setAttribute('transform', `translate(${fmt(val(cx, lt))} ${fmt(val(cy, lt))}) rotate(${fmt(val(o.rot, lt, 0))})`); } };
    });
  };

  /** calendar(cx, cy, size, o): a desk calendar whose page shows o.label (string or fn(lt) → string) */
  B.calendar = function (cx, cy, size = 220, o = {}) {
    return mount(this, o, (g) => {
      const w = size, h = size * 0.95;
      s('rect', { x: cx - w / 2, y: cy - h / 2 + 8, width: w, height: h, rx: 18, fill: col('ink'), opacity: 0.08 }, g);
      s('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 18, fill: col('paper') }, g);
      s('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h * 0.26, rx: 18, fill: col('red') }, g);
      s('rect', { x: cx - w / 2, y: cy - h / 2 + h * 0.16, width: w, height: h * 0.1, fill: col('red') }, g);
      for (const dx of [-0.25, 0.25]) s('rect', { x: cx + dx * w - 7, y: cy - h / 2 - 16, width: 14, height: 34, rx: 7, fill: col('soft') }, g);
      const t = s('text', { x: cx, y: cy + h * 0.24, 'text-anchor': 'middle', 'font-size': size * 0.34, 'font-family': 'Fredoka, LXGW WenKai, sans-serif', 'font-weight': 600, fill: col('ink') }, g);
      return { update(lt) { const v = String(val(o.label, lt, '')); if (t.textContent !== v) t.textContent = v; } };
    });
  };

  /** tag(cx, cy, text, o): a rounded label that sits on an object — numbers belong on things, not on cards.
   *  o.count: { from, to, at, dur, fmt(n) } counts up and lands at at + dur (use P.cw to land on the spoken word). */
  B.tag = function (cx, cy, text, o = {}) {
    return mount(this, o, (g) => {
      const size = o.size ?? 44, c = col(o.color || 'ink'), bg = col(o.bg || 'paper');
      const box = s('rect', { rx: size * 0.42, fill: bg, stroke: shade(o.bg || 'paper', 0.12), 'stroke-width': 2 }, g);
      const t = s('text', { x: cx, y: cy + size * 0.36, 'text-anchor': 'middle', 'font-size': size, 'font-family': 'Fredoka, LXGW WenKai, sans-serif', 'font-weight': 600, fill: c }, g);
      const pad = size * 0.55;
      return {
        update(lt) {
          let v = text;
          if (o.count) {
            const { from = 0, to, at, dur = 1, fmt: f = (n) => Math.round(n).toLocaleString('zh-CN') } = o.count;
            const k = ease.out(clamp((lt - at) / dur));
            v = (o.prefix || '') + f(lerp(from, to, k)) + (o.suffix || '');
          }
          if (t.textContent !== v) {
            t.textContent = v;
            // width from character count (no layout reads in the frame loop): CJK ≈ 1em, latin/digits ≈ 0.58em
            const em = [...v].reduce((a, ch) => a + (/[㐀-鿿]/.test(ch) ? 1 : 0.6), 0);
            const W = em * size + pad * 2;
            box.setAttribute('x', fmt(cx - W / 2)); box.setAttribute('y', fmt(cy - size * 0.62)); box.setAttribute('width', fmt(W)); box.setAttribute('height', fmt(size * 1.3));
          }
        },
      };
    });
  };
})();
