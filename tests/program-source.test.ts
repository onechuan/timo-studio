import { describe, expect, it } from 'vitest';
import {
  drawingEngineAssets,
  hashProgramSource,
  validateProgramSource,
} from '../packages/renderer/src/program.js';

const valid = `TIMO.visual('s1', (P) => {
  P.title('第一性原理');
  P.circle(960, 520, 180, { at: P.c(0), color: 'yellow' });
});`;

describe('V3 drawing program boundary', () => {
  it('accepts one local TIMO registration and hashes UTF-8 source', () => {
    expect(() => validateProgramSource('s1', valid)).not.toThrow();
    expect(hashProgramSource(valid)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashProgramSource(valid)).toBe(hashProgramSource(valid));
  });

  it.each([
    ['network', "TIMO.visual('s1', P => fetch('/secret'))"],
    ['xhr', "TIMO.visual('s1', P => new XMLHttpRequest())"],
    ['socket', "TIMO.visual('s1', P => new WebSocket('ws://x'))"],
    ['worker', "TIMO.visual('s1', P => new Worker('x.js'))"],
    ['dynamic import', "TIMO.visual('s1', P => import('x'))"],
    ['eval', "TIMO.visual('s1', P => eval('1'))"],
    ['function constructor', "TIMO.visual('s1', P => Function('return 1'))"],
    ['window', "TIMO.visual('s1', P => window.alert(1))"],
    ['document', "TIMO.visual('s1', P => document.body.remove())"],
    ['parent', "TIMO.visual('s1', P => parent.postMessage('x', '*'))"],
    ['top', "TIMO.visual('s1', P => top.location.reload())"],
    ['opener', "TIMO.visual('s1', P => opener.close())"],
    ['storage', "TIMO.visual('s1', P => localStorage.clear())"],
    ['navigation', "TIMO.visual('s1', P => location.assign('/'))"],
    ['script close', "TIMO.visual('s1', P => P.title('</script>'))"],
    [
      'second registration',
      "TIMO.visual('s1', P => P.title('a')); TIMO.visual('s1', P => P.title('b'));",
    ],
    ['wrong id', "TIMO.visual('s2', P => P.title('a'))"],
    ['engine escape', "ENGINE.visual('s1', P => P.title('a'))"],
    [
      'Film Kit redefinition',
      "B.coffeeCup=()=>{}; TIMO.visual('s1', P => P.coffeeCup())",
    ],
  ])('rejects %s access', (_name, source) => {
    expect(() => validateProgramSource('s1', source)).toThrow(
      'Unsafe drawing program',
    );
  });

  it('loads only trusted engine, style, and logical component assets', () => {
    const assets = drawingEngineAssets('chalkboard', ['flowgraph']);
    expect(assets.css).toContain('#chalk');
    expect(assets.scripts.join('\n')).toContain('class Builder');
    expect(assets.scripts.join('\n')).toContain('B.graph');
    expect(assets.scripts.every((script) => !/<\/script/i.test(script))).toBe(
      true,
    );
    expect(() => drawingEngineAssets('chalkboard', ['../flowgraph'])).toThrow();
    expect(() =>
      drawingEngineAssets('chalkboard', ['not-installed']),
    ).toThrow();
  });
});
