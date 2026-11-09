import {
  validateArtworkCues,
  type ArtworkV1,
  type ArtworkV2,
  type ArtworkElement,
  type MotionCue,
  type MotionTrack,
} from '@timotv/contracts';
export interface CompiledTrack {
  elementId: string;
  property: MotionTrack['property'];
  easing: string;
  keyframes: {
    timeMs: number;
    value: MotionTrack['keyframes'][number]['value'];
  }[];
}
export interface CompiledMotion {
  elements: ArtworkElement[];
  tracks: CompiledTrack[];
  colors: Record<string, string>;
}
export type EvaluatedObject = ArtworkElement & {
  scale: number;
  rotation: number;
  color?: string;
  parameter?: number;
  state?: string;
};
export function compileMotion(
  artwork: ArtworkV1 | ArtworkV2,
  cues: MotionCue[],
  colors: Record<string, string> = {},
): CompiledMotion {
  const errors = validateArtworkCues(artwork, cues);
  if (errors.length) throw new Error(errors.join('; '));
  return {
    elements: structuredClone(artwork.elements),
    colors,
    tracks:
      artwork.version === 2
        ? artwork.tracks.map((track) => ({
            ...track,
            keyframes: track.keyframes.map((k) => {
              const cue = cues.find((c) => c.id === k.at.cueId)!;
              return {
                timeMs:
                  cue.startMs! +
                  (cue.endMs! - cue.startMs!) * k.at.progress +
                  k.at.offsetMs,
                value: k.value,
              };
            }),
          }))
        : [],
  };
}
/** Pure and self-contained: the exact function is embedded into preview and export HTML. */
export function evaluateScene(
  scene: CompiledMotion,
  time: number,
): EvaluatedObject[] {
  const result = scene.elements.map((e) => ({
    ...e,
    scale: 1,
    rotation: 0,
  })) as EvaluatedObject[];
  const t = Number.isFinite(time) ? Math.max(0, time) : 0;
  for (const track of scene.tracks) {
    const e = result.find((e) => e.id === track.elementId)!;
    const frames = track.keyframes;
    let a = frames[0]!,
      b = a;
    for (const frame of frames) {
      if (frame.timeMs <= t) a = frame;
      if (frame.timeMs > t) {
        b = frame;
        break;
      }
      b = a;
    }
    let p =
      a === b || t <= a.timeMs
        ? 0
        : Math.min(1, (t - a.timeMs) / (b.timeMs - a.timeMs));
    if (track.easing === 'smooth') p = p * p * (3 - 2 * p);
    const lerp = (x: number, y: number) => x + (y - x) * p;
    let value: any = a.value;
    if (typeof a.value === 'number' && typeof b.value === 'number')
      value = lerp(a.value, b.value);
    if (typeof a.value === 'object' && typeof b.value === 'object')
      value = { x: lerp(a.value.x, b.value.x), y: lerp(a.value.y, b.value.y) };
    if (
      track.property === 'path' &&
      typeof a.value === 'string' &&
      typeof b.value === 'string'
    ) {
      const rx = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g;
      const nums = b.value.match(rx) ?? [];
      let i = 0;
      value = a.value.replace(rx, (n) =>
        String(lerp(Number(n), Number(nums[i++]))),
      );
    }
    if (track.property === 'color') {
      const ca = scene.colors[String(a.value)] ?? String(a.value),
        cb = scene.colors[String(b.value)] ?? String(b.value);
      value =
        /^#[0-9a-f]{6}$/i.test(ca) && /^#[0-9a-f]{6}$/i.test(cb)
          ? '#' +
            [1, 3, 5]
              .map((i) =>
                Math.round(
                  lerp(
                    parseInt(ca.slice(i, i + 2), 16),
                    parseInt(cb.slice(i, i + 2), 16),
                  ),
                )
                  .toString(16)
                  .padStart(2, '0'),
              )
              .join('')
          : ca;
    }
    switch (track.property) {
      case 'move':
        e.x = value.x;
        e.y = value.y;
        break;
      case 'scale':
        e.scale = value;
        break;
      case 'rotate':
        e.rotation = value;
        break;
      case 'opacity':
        e.opacity = value;
        break;
      case 'color':
        e.color = value;
        break;
      case 'path':
        if (e.type === 'path') e.d = value;
        break;
      case 'state':
        e.state = value;
        break;
      case 'parameter':
        e.parameter = value;
        break;
    }
  }
  return result;
}
/** Semantic components: parameter is fill level / activation / transfer progress, all 0..1. */
export function componentSvg(
  name: string,
  width: number,
  height: number,
  state: string,
  parameter: number,
  fill: string,
  ink: string,
): string {
  const p = Math.max(0, Math.min(1, parameter)),
    active = state === 'active' || state === 'complete';
  if (name === 'liquid')
    return `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="12" fill="none" stroke="${ink}" stroke-width="4"/><rect x="8" y="${8 + (height - 16) * (1 - p)}" width="${width - 16}" height="${(height - 16) * p}" rx="4" fill="${fill}" opacity="${active ? 1 : 0.55}"/>`;
  if (name === 'node')
    return `<ellipse cx="${width / 2}" cy="${height / 2}" rx="${Math.max(1, width / 2 - 4)}" ry="${Math.max(1, height / 2 - 4)}" fill="${active ? fill : 'none'}" stroke="${ink}" stroke-width="4"/>${state === 'complete' ? `<path d="M${width * 0.25} ${height * 0.5} L${width * 0.45} ${height * 0.7} L${width * 0.75} ${height * 0.3}" fill="none" stroke="${ink}" stroke-width="5"/>` : ''}`;
  return `<path d="M8 ${height / 2} H${width - 8}" stroke="${ink}" stroke-width="4"/><circle cx="${8 + (width - 16) * p}" cy="${height / 2}" r="${Math.min(height * 0.3, 18)}" fill="${fill}" opacity="${active ? 1 : 0.4}"/>`;
}
