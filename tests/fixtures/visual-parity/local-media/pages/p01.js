ENGINE.visual('p01', (P) => {
  P.title('本地素材也必须一致');
  const at = P.c(0);
  P.img('materials/parity-card.svg', 420, 250, 1080, 560, {
    at,
    dur: 0.6,
    fit: 'contain',
    r: 24,
  });
  P.text('registered local image', {
    x: 610,
    y: 840,
    size: 48,
    color: 'accent',
    at: at + 0.8,
  });
});
