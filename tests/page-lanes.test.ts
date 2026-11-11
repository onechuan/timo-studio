import { expect, it } from 'vitest';
import { pageLanePlan } from '../packages/agent/src/director/page-lanes.js';

it('keeps adjacent pages in the same continuity lane', () => {
  expect(pageLanePlan(['p01', 'p02', 'p03', 'p04', 'p05'], 2)).toEqual([
    { id: 'lane-1', sceneIds: ['p01', 'p02', 'p03'] },
    { id: 'lane-2', sceneIds: ['p04', 'p05'] },
  ]);
});

it('bounds concurrency and never creates empty lanes', () => {
  expect(pageLanePlan(['p01', 'p02'], 8)).toEqual([
    { id: 'lane-1', sceneIds: ['p01', 'p02'] },
  ]);
  expect(pageLanePlan([], 3)).toEqual([]);
});
