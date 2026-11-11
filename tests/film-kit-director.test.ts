import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  generateFilmKitPart,
  planFilmKit,
} from '../packages/agent/src/director/film-kit.js';
import type {
  FilmKitItem,
  Production,
} from '../packages/contracts/src/index.js';

const production = (): Production =>
  ({
    projectId: 'film-kit',
    revision: 1,
    stage: 'illustrating',
    aspectRatio: '16:9',
    brief: {
      topic: '咖啡为什么会变凉',
      materials: '',
      durationSec: 60,
      language: 'zh',
      style: 'chalk',
      voiceProvider: 'local',
      voice: '',
    },
    storyboard: {
      title: '咖啡为什么会变凉',
      summary: '热量从咖啡转移到环境',
      kit: [
        {
          name: 'coffeeCup',
          what: '同一只白色陶瓷咖啡杯，液面高度和杯把方向保持一致',
          pages: ['p01', 'p03', 'p05'],
        },
        {
          name: 'title',
          what: '替换引擎标题',
          pages: ['p01', 'p03'],
        },
        {
          name: 'steam',
          what: '只出现一次的蒸汽',
          pages: ['p01'],
        },
      ],
      scenes: ['p01', 'p02', 'p03', 'p04', 'p05'].map((id) => ({
        id,
        title: id,
        say: id,
        visual: id,
        beats: ['出现', '变化'],
      })),
    },
    scenes: [],
    artifacts: {},
    events: [],
  }) as Production;

describe('Film Kit director', () => {
  it('keeps at most three valid subjects recurring on known pages', () => {
    expect(planFilmKit(production())).toEqual([
      {
        name: 'coffeeCup',
        what: '同一只白色陶瓷咖啡杯，液面高度和杯把方向保持一致',
        pages: ['p01', 'p03', 'p05'],
      },
    ]);
  });

  it('generates one hashed reusable component and its isolated check', async () => {
    const item = planFilmKit(production())[0]!;
    const source =
      '(function(){ const B = PV.Builder.prototype; B.coffeeCup = function(x,y,o={}) { return this.circle(x,y,80,o); }; })();';
    const checkSource =
      "const cup = P.coffeeCup(960, 500, { at: P.c(0), color: 'yellow' });";
    const part = await generateFilmKitPart(production(), item, {
      generate: async () => ({
        value: { name: item.name, source, checkSource },
        usage: { input: 12, output: 34 },
      }),
    });

    expect(part).toMatchObject({
      ...item,
      source,
      checkSource,
      sourceHash: createHash('sha256').update(source).digest('hex'),
      usage: { input: 12, output: 34 },
    });
  });

  it.each([
    '(function(){ const B = PV.Builder.prototype; B.title = function(){}; })();',
    '(function(){ const B = PV.Builder.prototype; B.coffeeCup = function(){ fetch("https://example.com"); }; })();',
  ])('rejects unsafe or reserved component source', async (source) => {
    const item: FilmKitItem = {
      name: 'coffeeCup',
      what: '同一只白色陶瓷咖啡杯',
      pages: ['p01', 'p03'],
    };
    await expect(
      generateFilmKitPart(production(), item, {
        generate: async () => ({
          value: {
            name: item.name,
            source,
            checkSource: 'P.coffeeCup(960, 500, { at: P.c(0) });',
          },
          usage: { input: 1, output: 1 },
        }),
      }),
    ).rejects.toThrow('FILM_KIT_INVALID');
  });
});
