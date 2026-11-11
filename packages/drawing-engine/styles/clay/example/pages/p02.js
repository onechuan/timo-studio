ENGINE.visual('p02', (P) => {
  const L = (a, b, u) => a + (b - a) * u;
  P.set('sky');
  P.title('降温：哈欠像给大脑开窗');
  const c1 = P.c(1), c2 = P.c(2), c3 = P.c(3), inhale = P.cw(1, '凉空气'), cool = P.cw(2, '降温');
  // you: orange buddy with a blue beanie (the same look on every page)
  P.buddy(440, 870, { size: 440, body: 'orange', hat: 'beanie', accent: 'blue', face: 'r', at: 0,
    pose: [[0, 'think'], [c1, 'surprised'], [c2, 'cheer'], [c3, 'shrug']],
    mood: (lt) => (lt < c1 ? 'think' : lt < c2 ? 'shock' : lt < c3 ? 'laugh' : 'sad') });
  // the brain, a character with a face, floating in the upper right
  P.prop('brain', 1360, 430, { size: 290, float: true, face: true, at: 0.1, mood: (lt) => (lt < c2 ? 'worried' : lt < c3 + 0.4 ? 'happy' : 'worried') });
  P.fx('sweat', 1480, 330, { at: P.c(0, 0.4), dur: 1.4 });
  // cool air: a cloud drifts into the mouth along a clay coil
  P.coil([[1020, 300], [820, 420], [600, 590]], { color: 'blue', width: 22, end: 'arrow', at: c1 + 0.3, dur: 0.9, out: c2 });
  const k = (lt) => PV.K(lt, c1 + 0.5, Math.max(1, inhale - c1));
  P.prop('cloud', (lt) => L(1040, 600, k(lt)), (lt) => L(280, 600, k(lt)), { size: 210, float: true, face: true, color: 'paper', at: c1, out: inhale + 0.7 });
  P.fx('puff', 600, 620, { at: inhale + 0.6 });
  P.plate(940, 820, 480, 110, '吸入凉空气', { color: 'blue', ink: 'paper', size: 48, at: c1 + 0.3, out: c2 });
  // the squash reveal: blood flows up, the brain sparkles, the word lands in clay
  P.coil([[520, 520], [760, 380], [1000, 400], [1200, 450]], { color: 'red', width: 24, end: 'arrow', at: P.cw(2, '血流', -0.2), dur: 0.9, out: c3 });
  P.fx('sparkle', 1360, 400, { at: cool, dur: 1.6, size: 1.4 });
  P.fx('crumbs', 1360, 840, { at: cool });
  P.letters('{降温}', 1360, 860, { size: 190, hi: 'red', align: 'center', at: cool, stagger: 0.1, out: c3 });
  // too hot: an angry red sun, and the trick stops working
  P.prop('sun', 900, 300, { size: 230, float: true, face: true, mood: 'angry', color: 'red', at: c3 + 0.1 });
  P.plate(1360, 800, 500, 112, '太热就不灵', { color: 'red', ink: 'paper', size: 50, at: P.cw(3, '太热'), tilt: -0.04 });
  P.cam([P.push(c2 + 0.2, 960, 520, 1.1), P.back(c3)]);
});
