// filetree.js — ftile, filetree, fly
ENGINE.visual('p06', (P) => {
  P.title('filetree.js · filetree / ftile / fly');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.filetree(200, 260, [['project/', 0, 'd'], ['README.md', 1, 'f'], ['src/', 1, 'd'], ['main.js', 2, 'f'], ['util.js', 2, 'f'], ['test/', 1, 'd'], ['main.test.js', 2, 'f']], { at: t0, color: (r) => (r.label === 'main.js' ? 'orange' : r.kind === 'd' ? 'soft' : 'ink') });
  P.ftile(1100, 300, 320, 220, 'main.js', { at: t1, color: 'orange', lines: 4 });
  P.fly('import', [520, 400], [1260, 600], t2, { color: 'blue' });
});
