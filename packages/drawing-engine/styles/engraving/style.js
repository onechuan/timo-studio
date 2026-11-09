/* Copperplate Engraving (铜版画博物志): a natural-history plate pulled from an engraved copper plate. Cream laid paper with
 * chain lines and a little foxing, the pressed bevel of the plate mark, a ruled border, one warm near-black ink in which
 * every tone is made of swelling hatched lines, italic figure captions, and transparent watercolour laid on by hand
 * after printing. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '600 40px "Noto Serif SC Variable"', '400 40px "Noto Serif SC Variable"',
  '500 40px "Fraunces Variable"', 'italic 400 40px "Fraunces Variable"', 'italic 600 40px "Fraunces Variable"',
]);
window.STYLE = {
  id: 'engraving',
  // a burin line: clean, no sketchy wobble, fine weight
  roughScale: 0, bowScale: 0, sw: 2, single: true,
  // same colour names as every style: ink is the printer's ink; the colours are the colourist's transparent washes
  // (muted earth and mineral pigments), light *F tones for a pale wash
  palette: {
    ink: '#1E1712', soft: '#4A3D31', muted: '#857560', faint: '#C7B898',
    red: '#B4513C', redF: '#E8C2B1',        // madder: blood, muscle, the one organ that matters
    orange: '#C4873E', orangeF: '#EDD3AE',  // raw sienna / amber: an insect's body, wood, bone
    yellow: '#D6AE48',                      // gamboge: pollen, yolk, a highlight
    green: '#6C8752', greenF: '#D5DDBF',    // sap green / verdigris: leaves, the sea on a chart
    blue: '#557A98', blueF: '#CCD9E1',      // Prussian wash: water, the cold side, a wing's sheen
    purple: '#7A6585', purpleF: '#DDD2DC',  // a stain, a dye, a vein
    paper: '#F1E8D2',
    inkF: '#DDD1B7', softF: '#E3D8C0', mutedF: '#E8DEC8', faintF: '#ECE3CE',
  },
  // laid paper: chain lines and laid lines, fibres, a faint uneven tone, foxing toward the edges; the plate mark pressed
  // into it (a bevel lit from the upper left) and the plate's ruled border (a rule and a hairline)
  background: (stage) => {
    const W = stage.w, H = stage.h;
    const R = (() => { let x = 29 >>> 0; return () => { x = (x + 0x6d2b79f5) >>> 0; let t = Math.imul(x ^ (x >>> 15), 1 | x); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
    let fib = '';
    for (let i = 0; i < 260; i++) {
      const px = R() * 600, py = R() * 600, a = R() * 6.283, l = 4 + R() * 14;
      fib += `<path d="M${px.toFixed(0)} ${py.toFixed(0)} q${(Math.cos(a + 0.6) * l * 0.5).toFixed(1)} ${(Math.sin(a + 0.6) * l * 0.5).toFixed(1)} ${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}" stroke="rgba(110,80,44,${(0.05 + R() * 0.07).toFixed(2)})" stroke-width="${(0.4 + R() * 0.6).toFixed(1)}" fill="none"/>`;
    }
    const fibres = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">${fib}</svg>`);
    let fox = '';
    for (let i = 0; i < 70; i++) {
      let x = R() * W, y = R() * H;
      if (R() < 0.75) { if (R() < 0.5) x = R() < 0.5 ? R() * 150 : W - R() * 150; else y = R() < 0.5 ? R() * 110 : H - R() * 110; }
      fox += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(1 + R() * 4.5).toFixed(1)}" fill="rgba(150,98,48,${(0.06 + R() * 0.12).toFixed(2)})"/>`;
    }
    // the plate mark (pressed in by the plate's edge) and the ruled border inside it
    const px0 = 46, py0 = 26, px1 = W - 46, py1 = H - 22, b = 6, bx0 = 76, by0 = 52, bx1 = W - 76, by1 = H - 46;
    const plate = `<rect x="${px0}" y="${py0}" width="${px1 - px0}" height="${py1 - py0}" fill="rgba(160,128,84,0.07)"/>`
      + `<path d="M${px0 - b} ${py0 - b}H${px1 + b}L${px1} ${py0}H${px0}V${py1}L${px0 - b} ${py1 + b}Z" fill="rgba(96,68,38,0.30)"/>`
      + `<path d="M${px1 + b} ${py0 - b}V${py1 + b}H${px0 - b}L${px0} ${py1}H${px1}V${py0}Z" fill="rgba(255,250,238,0.85)"/>`
      + `<rect x="${px0 - b}" y="${py0 - b}" width="${px1 - px0 + 2 * b}" height="${py1 - py0 + 2 * b}" fill="none" stroke="rgba(90,62,34,0.22)" stroke-width="1"/>`
      + `<rect x="${bx0}" y="${by0}" width="${bx1 - bx0}" height="${by1 - by0}" fill="none" stroke="rgba(30,23,18,0.82)" stroke-width="2.4"/>`
      + `<rect x="${bx0 + 9}" y="${by0 + 9}" width="${bx1 - bx0 - 18}" height="${by1 - by0 - 18}" fill="none" stroke="rgba(30,23,18,0.7)" stroke-width="0.9"/>`;
    const sheet = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${fox}${plate}</svg>`);
    const blotch = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.25  0 0 0 0.09 0"/></filter><rect width="${W}" height="${H}" filter="url(#b)"/></svg>`);
    return [
      `url("data:image/svg+xml;utf8,${sheet}") 0 0 / ${W}px ${H}px no-repeat`,
      `url("data:image/svg+xml;utf8,${fibres}")`,
      `url("data:image/svg+xml;utf8,${blotch}") 0 0 / ${W}px ${H}px no-repeat`,
      'repeating-linear-gradient(0deg, rgba(120,92,56,0.045) 0 1px, transparent 1px 5px)',
      'repeating-linear-gradient(90deg, rgba(120,92,56,0.06) 0 1.5px, transparent 1.5px 78px)',
      `radial-gradient(${W * 0.95}px ${H * 0.95}px at 48% 44%, #F4ECD8, #F1E8D2 58%, #E6D9BB)`,
    ].join(',');
  },
};
