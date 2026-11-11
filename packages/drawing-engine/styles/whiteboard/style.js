/* Whiteboard sketch: a clean white board, sketchy multi-stroke marker lines, a few marker colours; RSA-Animate style explainers. */
window.STYLE = {
  id: 'whiteboard',
  // markers wobble more than a pen and go over a line twice; the default line is a fat marker tip
  roughScale: 1.2, bowScale: 1.1, sw: 3.4, single: false,
  // same colour names as the runtime palette: black marker ink, four marker colours, very light washes for fills
  palette: {
    ink: '#1E2226', soft: '#4B5158', muted: '#8C939B', faint: '#CDD2D7',
    red: '#D0342C', redF: '#FADBD8',        // red marker: the problem, the cost, the circled mistake
    orange: '#E5762A', orangeF: '#FCE5D2',  // orange marker: the highlight, the number that matters
    green: '#1E8A4A', greenF: '#D6EEDD',    // green marker: the fix, the good path, ticks
    blue: '#1F5DBA', blueF: '#D9E5F7',      // blue marker: structure, labels, the second voice
    purple: '#8A3F7E', purpleF: '#F0DCEB',  // plum (rarely used; whiteboard sets rarely carry violet)
    yellow: '#F6CB1F', paper: '#FFFFFF',    // yellow is a highlighter, never a line colour
    inkF: '#E7E9EC', softF: '#ECEEF0', mutedF: '#F1F2F4', faintF: '#F6F7F8',
  },
  // near-white melamine: one soft diagonal sheen, a faint ghost of an erased marker, no grid and no paper grain
  background: (stage) => {
    const ghost = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${stage.w}" height="${stage.h}"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="2" seed="21"/><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.58  0 0 0 0 0.62  0 0 0 0.055 0"/></filter><rect width="${stage.w}" height="${stage.h}" filter="url(#g)"/></svg>`);
    return [
      `url("data:image/svg+xml;utf8,${ghost}")`,
      'linear-gradient(118deg, rgba(255,255,255,0) 28%, rgba(255,255,255,0.75) 40%, rgba(255,255,255,0) 52%)',
      `radial-gradient(${stage.w * 1.1}px ${stage.h * 0.95}px at 46% 40%, #FDFDFC, #F6F7F6 64%, #ECEEEE)`,
    ].join(',');
  },
};
