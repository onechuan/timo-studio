/* Composite widgets built from primitives: chat bubbles, chips, keycaps, cards, live counters. */
(function () {
  const { h, col, ease, clamp, Builder } = PV;
  const B = Builder.prototype;

  /** Chat bubble with a tail. side: 'l' (AI) | 'r' (user). Returns { box, text, h }. */
  B.bubble = function (x, y, w, str, o = {}) {
    const size = o.size ?? 34, pad = o.pad ?? 22;
    const lines = o.lines ?? str.split('\n').length;
    const hh = lines * size * 1.45 + pad * 2 - 6;
    const r = 18, side = o.side || 'l';
    const tx = side === 'l' ? x + 30 : x + w - 30;
    const d = `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + hh - r} Q${x + w} ${y + hh} ${x + w - r} ${y + hh} ` +
      (side === 'r' ? `H${tx + 8} L${tx + 20} ${y + hh + 20} L${tx - 14} ${y + hh} ` : '') +
      `H${side === 'l' ? tx + 14 : x + r} ` + (side === 'l' ? `L${tx - 16} ${y + hh + 20} L${tx - 6} ${y + hh} H${x + r} ` : '') +
      `Q${x} ${y + hh} ${x} ${y + hh - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
    const at = o.at ?? 0;
    const box = this.path(d, { fill: o.fill || (side === 'r' ? 'blueF' : 'paper'), color: o.color || (side === 'r' ? 'blue' : 'soft'), at, dur: 0.7, sw: 2.4 });
    const text = this.text(str, { x: x + pad, y: y + pad - 4, size, w: w - pad * 2, at: at + 0.45, cps: o.cps ?? 16, color: o.tcolor, pen: false, lh: 1.45 });
    return { box, text, h: hh, hide(t, d2) { box.hide(t, d2); text.hide(t, d2); } };
  };

  /** Small tag chip: rounded box + centred label. */
  B.chip = function (x, y, w, label, o = {}) {
    const hh = o.h ?? 50, at = o.at ?? 0, c = o.color || 'blue';
    const box = this.box(x, y, w, hh, { r: 12, fill: o.fill || c + 'F', color: c, at, dur: 0.5, sw: 2.2, rough: 0.8, texture: false });
    const text = this.text(label, { x: x + w / 2, y: y + (hh - (o.size ?? 28) * 1.3) / 2, w, align: 'c', size: o.size ?? 28, weight: 700, color: c, at: at + 0.2, mode: 'fade', dur: 0.35 });
    return { box, text, hide(t, d2) { box.hide(t, d2); text.hide(t, d2); } };
  };

  /** Keyboard keycap with press animation at o.press. */
  B.keycap = function (x, y, label, o = {}) {
    const w = o.w ?? 130, hh = o.h ?? 96, at = o.at ?? 0;
    const L = this.layer();
    L.box(x, y + 10, w, hh, { r: 16, fill: 'faint', color: 'soft', at, dur: 0.5, texture: false });
    L.box(x + 6, y, w - 12, hh - 16, { r: 12, fill: 'paper', color: 'ink', at: at + 0.2, dur: 0.5 });
    L.text(label, { x: x + w / 2, y: y + (hh - 16 - 40) / 2 - 2, w, align: 'c', size: 38, font: 'latin', at: at + 0.5, mode: 'fade' });
    if (o.press != null) {
      this.tick((lt) => {
        const k = clamp((lt - o.press) / 0.35);
        const dip = k < 0.3 ? ease.out(k / 0.3) : 1 - ease.out((k - 0.3) / 0.7);
        L.wrap.style.transform = `translateY(${(dip * 9).toFixed(1)}px)`;
      });
    }
    return L;
  };

  /** Card: box with a handwritten heading. */
  B.card = function (x, y, w, hh, o = {}) {
    const at = o.at ?? 0;
    const box = this.box(x, y, w, hh, { r: o.r ?? 20, fill: o.fill ?? null, color: o.color || 'soft', at, dur: o.dur ?? 0.9, sw: o.sw ?? 2.4, texture: o.texture });
    let title = null;
    if (o.title) title = this.text(o.title, { x: x + w / 2, y: y + (o.ty ?? 22), w, align: 'c', size: o.tsize ?? 42, font: o.font || 'hand', weight: 700, color: o.tcolor || o.color || 'ink', at: at + 0.5, cps: 14 });
    return { box, title };
  };

  /** A live number/label driven by time: fn(lt) → string. */
  B.live = function (x, y, fn, o = {}) {
    const el = h('div', 'tx ' + (o.font || 'hand'), '', this.html);
    Object.assign(el.style, { left: x + 'px', top: y + 'px', fontSize: (o.size ?? 40) + 'px', color: col(o.color || 'ink'), fontWeight: o.weight || 400, whiteSpace: 'nowrap' });
    if (o.align === 'c') { el.style.width = (o.w ?? 400) + 'px'; el.style.left = x - (o.w ?? 400) / 2 + 'px'; el.style.textAlign = 'center'; }
    this.show(el, { at: o.at ?? 0, dur: 0.4, dy: 6 });
    this.tick((lt) => { const v = fn(lt); if (el._v !== v) { el._v = v; el.innerHTML = v; } });
    return el;
  };

  /** Pop a finished element with a little bounce at time t (for emphasis). */
  B.pulse = function (el, t, amp = 0.08) {
    this.tick((lt) => {
      const k = clamp((lt - t) / 0.5);
      const s = k <= 0 || k >= 1 ? 1 : 1 + Math.sin(k * Math.PI) * amp;
      el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center';
      el.style.scale = s.toFixed(4);
    });
  };

  /** Rubber stamp (rotated boxed text that thumps in). */
  B.stamp = function (x, y, str, o = {}) {
    const at = o.at ?? 0, c = o.color || 'red';
    const L = this.layer();
    const w = o.w ?? 200, hh = o.h ?? 76;
    L.box(x - w / 2, y - hh / 2, w, hh, { r: 10, color: c, sw: 3.4, at, dur: 0.35, rough: 1.4, texture: false });
    L.text(str, { x, y: y - (o.size ?? 38) * 0.68, w, align: 'c', size: o.size ?? 38, weight: 700, color: c, at, mode: 'fade', dur: 0.2 });
    this.tick((lt) => {
      const k = clamp((lt - at) / 0.35);
      const s = 1.6 - 0.6 * ease.back(k);
      L.wrap.style.opacity = k > 0 ? Math.min(1, k * 3).toFixed(3) : '0';
      L.wrap.style.transformOrigin = `${x}px ${y}px`;
      L.wrap.style.transform = `rotate(${o.rot ?? -8}deg) scale(${s.toFixed(4)})`;
    });
    return L;
  };
})();


/** Real brand logo (from extras/logos.js, generated by engine/tools/logos.mjs). Shown as-is: never roughened or redrawn.
 *  logo(name, cx, cy, size, { at, dur, mono: colour key — only for single-colour simple-icons marks }) */
PV.Builder.prototype.logo = function (name, cx, cy, size = 100, o = {}) {
  const L = (window.PV.LOGOS || {})[name];
  if (!L) throw new Error(`logo "${name}" does not exist: run node engine/tools/logos.mjs ${name} in the project directory first and register extras/logos.js in META.extras`);
  const el = PV.h('div', 'logo', L.svg, this.html);
  Object.assign(el.style, { position: 'absolute', left: cx - size / 2 + 'px', top: cy - size / 2 + 'px', width: size + 'px', height: size + 'px' });
  const svg = el.firstChild;
  svg.setAttribute('width', size); svg.setAttribute('height', size);
  if (o.mono && L.source === 'simple-icons') svg.querySelector('path').setAttribute('fill', PV.col(o.mono));
  return this.show(el, { at: o.at ?? 0, dur: o.dur ?? 0.5, dy: 0, scale: 0.6, ease: PV.ease.back });
};
