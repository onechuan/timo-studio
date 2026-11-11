import {
  artworkBounds,
  type ArtworkV1,
  type ArtworkV2,
  type ArtworkElement,
} from '@timotv/contracts';

const textUnits = (value: string) =>
  [...value].reduce((n, c) => n + (/[^\x00-\x7f]/.test(c) ? 1 : 0.6), 0);
const overlaps = (a: ArtworkElement, b: ArtworkElement) =>
  Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
    Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)) >
  a.width * a.height * 0.1;
/** Fit only independent illustration boxes and labels; custom shape assemblies remain untouched. */
export function fitArtwork(
  artwork: ArtworkV1 | ArtworkV2,
  aspectRatio: '16:9' | '9:16',
): ArtworkV1 | ArtworkV2 {
  const b = artworkBounds(aspectRatio),
    maxWidth = b.right - b.left,
    maxHeight = b.bottom - b.top;
  const fitted = structuredClone(artwork);
  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));
  if (fitted.version === 2) {
    // Correct small boundary slips only for static, independent objects. Never
    // change group-local coordinates or separate an object from its motion path.
    const animated = new Set(fitted.tracks.map((track) => track.elementId));
    for (const e of fitted.elements) {
      if (e.parentId || e.type === 'group' || animated.has(e.id)) continue;
      if (e.width > maxWidth || e.height > maxHeight) continue;
      const x = clamp(e.x, b.left, b.right - e.width);
      const y = clamp(e.y, b.top, b.bottom - e.height);
      if (Math.abs(x - e.x) <= 4 && Math.abs(y - e.y) <= 4) {
        e.x = x;
        e.y = y;
      }
    }
    return fitted;
  }
  for (const e of fitted.elements)
    if (e.type === 'illustration') {
      const scale = Math.min(1, maxWidth / e.width, maxHeight / e.height);
      e.width *= scale;
      e.height *= scale;
      e.x = clamp(e.x, b.left, b.right - e.width);
      e.y = clamp(e.y, b.top, b.bottom - e.height);
    }
  const obstacles = fitted.elements.filter((e) =>
    ['illustration', 'path', 'ellipse'].includes(e.type),
  );
  const labels = fitted.elements
    .filter((e) => e.type === 'text')
    .sort((a, c) => c.width * c.height - a.width * a.height);
  for (const label of labels) {
    if (label.type !== 'text') continue;
    const font = Math.max(28, label.fontSize),
      lineHeight = font * 1.32,
      units = textUnits(label.text);
    const widths = [
      ...new Set([
        clamp(label.width, Math.min(maxWidth, font * 2), maxWidth),
        Math.min(maxWidth, Math.ceil(units * font)),
        Math.min(maxWidth, 320),
        Math.min(maxWidth, 480),
        maxWidth,
      ]),
    ];
    let best:
      | { x: number; y: number; width: number; height: number; score: number }
      | undefined;
    for (const width of widths) {
      const height = Math.max(
        lineHeight,
        Math.ceil((units * font) / width) * lineHeight,
      );
      if (height > maxHeight) continue;
      const xs = [
        clamp(label.x, b.left, b.right - width),
        b.left,
        b.right - width,
      ];
      const ys = [
        clamp(label.y, b.top, b.bottom - height),
        b.top,
        b.bottom - height,
      ];
      for (let x = b.left; x <= b.right - width; x += 24) xs.push(x);
      for (let y = b.top; y <= b.bottom - height; y += 24) ys.push(y);
      for (const x of xs)
        for (const y of ys) {
          const candidate = { ...label, x, y, width, height, fontSize: font };
          if (
            obstacles.some(
              (o) =>
                overlaps(candidate, o) ||
                (o.type === 'text' && overlaps(o, candidate)),
            )
          )
            continue;
          const score =
            (x - label.x) ** 2 +
            (y - label.y) ** 2 +
            0.05 * ((width - label.width) ** 2 + (height - label.height) ** 2);
          if (!best || score < best.score)
            best = { x, y, width, height, score };
        }
    }
    // No partial rearrangement when a complete, readable composition cannot be placed.
    if (!best) return artwork;
    const { score: _score, ...box } = best;
    Object.assign(label, box, { fontSize: font });
    obstacles.push(label);
  }
  return fitted;
}
