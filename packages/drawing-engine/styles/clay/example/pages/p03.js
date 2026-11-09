ENGINE.visual('p03', (P) => {
  P.set('lilac');
  P.title('困意信号：该换状态了', { accent: 'purple' });

  const tBored = P.cw(0, '无聊');
  const tSig = P.cw(1, '信号');
  const tUp = P.c(2);

  // sleepy moon floating upper right
  P.prop('moon', 1460, 330, {
    size: 300, float: true, face: true, color: 'yellow',
    mood: lt => (lt < tUp ? 'sleepy' : 'happy'), at: 0,
  });
  P.fx('zzz', 1580, 230, { at: 0.4, out: tUp });

  // book standing, then toppling down onto the floor
  P.prop('book', lt => 900 + 60 * PV.K(lt, tBored, 0.4), lt => 760 + 70 * PV.K(lt, tBored, 0.4), {
    size: 230, ground: 880, at: 0.2,
  });
  P.fx('puff', 960, 860, { at: tBored + 0.4 });

  // you: orange buddy, sleepy -> slumped -> surprised -> jumps up refreshed
  P.buddy(560, 870, {
    size: 440, body: 'orange', hat: 'beanie', accent: 'blue', face: 'r',
    pose: [[0, 'sleepy'], [tBored, 'sad'], [tSig, 'surprised'], [tUp, 'jump'], [tUp + 0.9, 'cheer']],
    mood: [[0, 'sleepy'], [tBored, 'sad'], [tSig, 'shock'], [tUp, 'laugh']],
    at: 0,
  });
  P.fx('puff', 560, 860, { at: tUp + 0.6 });
  P.fx('sparkle', 560, 560, { at: tUp + 0.8 });

  // label for sleepy / bored
  P.plate(1380, 660, 360, 96, '犯困 / 无聊', { color: 'paper', size: 44, at: tBored, out: tSig - 0.1 });

  // the signal bulb pops on above the head
  P.prop('bulb', 760, 290, {
    size: 190, float: true, face: true,
    mood: lt => (lt < tSig + 0.3 ? 'shock' : 'happy'),
    on: lt => lt > tSig + 0.3, at: tSig,
  });
  P.fx('crumbs', 760, 290, { at: tSig + 0.3 });
  P.plate(1080, 290, 280, 96, '换状态', { color: 'yellow', size: 48, tail: [880, 300], at: tSig + 0.4 });

  // camera: push on the bulb, then back to wide
  P.cam([P.push(tSig, 900, 450, 1.15), P.back(tUp)]);
});
