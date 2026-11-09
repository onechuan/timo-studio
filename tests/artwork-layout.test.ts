import { expect, it } from 'vitest';
import { legacyArtworkSchema } from '../packages/contracts/src/artwork.js';
import { fitArtwork } from '../packages/agent/src/director/layout.js';

const element = {
  id: 'label',
  type: 'text',
  text: '常见做法',
  fontSize: 28,
  x: 920,
  y: 636,
  width: 350,
  height: 56,
  cueIndex: 0,
  layer: 0,
};
const page = (elements: unknown[], tracks: unknown[] = []) =>
  legacyArtworkSchema.parse({
    version: 2,
    intent: '边界检查',
    elements,
    tracks,
  });

it('nudges small static overflow and preserves the original artwork', () => {
  const original = page([element]);
  const next = fitArtwork(original, '16:9');
  expect(next.elements[0]).toMatchObject({
    x: 920,
    y: 634,
    width: 350,
    height: 56,
  });
  expect(original.elements[0].y).toBe(636);
});
it('does not rearrange groups, animated objects, or large overflows', () => {
  const original = page(
    [
      {
        ...element,
        id: 'group',
        type: 'group',
        x: 64,
        y: 180,
        width: 100,
        height: 100,
      },
      { ...element, id: 'child', parentId: 'group' },
      { ...element, id: 'animated' },
      { ...element, id: 'large', y: 650 },
    ],
    [
      {
        elementId: 'animated',
        property: 'move',
        keyframes: [
          { at: { cueId: 'c1', progress: 0 }, value: { x: 920, y: 636 } },
        ],
      },
    ],
  );
  expect(fitArtwork(original, '16:9')).toEqual(original);
});
it('fits portrait bounds as well', () => {
  const original = page([
    { ...element, x: 44, y: 280, width: 350, height: 56 },
  ]);
  const next = fitArtwork(original, '9:16');
  expect(next.elements[0].x).toBe(48);
});
