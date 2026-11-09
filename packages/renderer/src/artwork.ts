import {
  compileMotion,
  evaluateScene,
  componentSvg,
  type CompiledMotion,
} from './motion.js';
import {
  artworkBounds,
  isLegacyArtwork,
  sceneArtworkSchema,
  type ArtworkElement,
  type FilmScene,
} from '@timotv/contracts';
import { illustration, palettes, type Palette } from './illustrations.js';
const escapeXml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[c]!,
  );
export interface ArtworkLayer {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  startMs: number;
  endMs?: number;
  first: boolean;
  transition: string;
  opacity: number;
  svg: string;
  parentId?: string;
  fillColor?: string;
}
export interface ArtworkFrame {
  motion?: CompiledMotion;
  ink?: string;
  width: number;
  height: number;
  paper: string;
  heading: string;
  layers: ArtworkLayer[];
}
/** Width estimates include full-width CJK and preserve every character, including long words. */
export function wrapArtworkText(
  text: string,
  width: number,
  fontSize: number,
): string[] {
  const lines: string[] = [];
  let line = '',
    used = 0;
  for (const ch of Array.from(text)) {
    const unit = /[\u2e80-\uffff]/u.test(ch)
      ? 1
      : /[MW@#%]/.test(ch)
        ? 0.85
        : /[il.,'!:; ]/.test(ch)
          ? 0.32
          : 0.59;
    if (ch === '\n') {
      lines.push(line);
      line = '';
      used = 0;
      continue;
    }
    if (used + unit * fontSize > width && line) {
      lines.push(line);
      line = '';
      used = 0;
    }
    line += ch;
    used += unit * fontSize;
  }
  if (line) lines.push(line);
  return lines;
}
function textSvg(
  text: string,
  width: number,
  height: number,
  size: number,
  color: string,
  align = 'left',
) {
  let font = size,
    lines = wrapArtworkText(text, width, font);
  while (((lines.length - 1) * 1.32 + 1.44) * font > height && font > 24) {
    font -= 1;
    lines = wrapArtworkText(text, width, font);
  }
  const x = align === 'center' ? width / 2 : align === 'right' ? width : 0;
  return `<text fill="${color}" font-size="${font}" font-family="'PingFang SC','Microsoft YaHei',system-ui,sans-serif" text-anchor="${align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start'}">${lines.map((l, i) => `<tspan x="${x}" y="${font * 1.08 + i * font * 1.32}">${escapeXml(l)}</tspan>`).join('')}</text>`;
}
function fallback(scene: FilmScene, portrait: boolean): ArtworkElement[] {
  const source = scene.title + ' ' + scene.visual + ' ' + scene.beats.join(' ');
  const names: [RegExp, string][] = [
    [/面条|牛肉面|拉面|汤面|牛肉汤|食物|noodle|soup|bowl/i, 'bowl'],
    [/咖啡|茶|coffee|tea\b/i, 'cup'],
    [/智能体|机器人|agent|robot/i, 'robot'],
    [/大脑|思考|模型|brain|think/i, 'brain'],
    [/工具|tool/i, 'toolbox'],
    [/树|成长|tree|grow/i, 'tree'],
    [/数据|database|storage/i, 'database'],
    [/代码|编程|code|terminal/i, 'terminal'],
    [/全球|地球|globe|world/i, 'globe'],
    [/搜索|检查|search|inspect/i, 'magnifier'],
    [/目标|target|goal/i, 'target'],
    [/日历|calendar|schedule/i, 'calendar'],
    [/学习|书|book|learn/i, 'books'],
    [/灵感|创意|idea/i, 'lightbulb'],
  ];
  const name = names.find(([rx]) => rx.test(source))?.[1] || 'document';
  const elements: any[] = [
    {
      id: 'lead',
      type: 'illustration',
      name,
      x: portrait ? 75 : 80,
      y: portrait ? 280 : 190,
      width: portrait ? 750 : 870,
      height: portrait ? 590 : 490,
      cueIndex: 0,
    },
  ];
  scene.cues.forEach((cue, i) =>
    elements.push({
      id: `beat-${i}`,
      type: 'text',
      text: scene.beats[Math.min(i, scene.beats.length - 1)],
      x: portrait ? 90 : 1010,
      y: portrait ? 940 : 320,
      width: portrait ? 720 : 470,
      height: portrait ? 290 : 310,
      cueIndex: i,
      fontSize: portrait ? 44 : 40,
      fill: 'ink',
    }),
  );
  const parsed = sceneArtworkSchema.parse({
    version: 1,
    intent: '兼容既有分镜',
    elements,
  });
  if (!isLegacyArtwork(parsed)) throw new Error('Legacy fallback rejected');
  return parsed.elements;
}
/** Text sits on the page ground; decorative objects retain their semantic colors. */
function readableTextColor(foreground: string, palette: Palette): string {
  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map((offset) => {
      const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    return (
      channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
    );
  };
  const foregroundLight = luminance(foreground),
    backgroundLight = luminance(palette.paper);
  const contrast =
    (Math.max(foregroundLight, backgroundLight) + 0.05) /
    (Math.min(foregroundLight, backgroundLight) + 0.05);
  return contrast >= 4.5 ? foreground : palette.ink;
}

function primitive(e: ArtworkElement, c: Palette) {
  const fill = c[e.fill] || c.accent,
    stroke = c[e.stroke] || 'none';
  const attrs = `fill="${fill}" stroke="${stroke}" stroke-width="${e.strokeWidth}"`;
  switch (e.type) {
    case 'group':
      return '';
    case 'component':
      return componentSvg(
        e.name,
        e.width,
        e.height,
        e.state,
        e.parameter,
        fill,
        c.ink,
      );
    case 'illustration':
      return illustration(e.name, c);
    case 'text':
      return textSvg(
        e.text,
        e.width,
        e.height,
        e.fontSize,
        readableTextColor(fill, c),
        e.align,
      );
    case 'rect':
      return `<rect width="${e.width}" height="${e.height}" rx="${e.radius}" ${attrs}/>`;
    case 'ellipse':
      return `<ellipse cx="${e.width / 2}" cy="${e.height / 2}" rx="${e.width / 2}" ry="${e.height / 2}" ${attrs}/>`;
    case 'path':
      return `<svg width="${e.width}" height="${e.height}" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${escapeXml(e.d)}" ${attrs} vector-effect="non-scaling-stroke"/></svg>`;
    case 'arrow': {
      const d =
        e.direction === 'right'
          ? 'M5 50 H92 M73 20 L95 50 L73 80'
          : e.direction === 'left'
            ? 'M95 50 H8 M27 20 L5 50 L27 80'
            : e.direction === 'up'
              ? 'M50 95 V8 M20 27 L50 5 L80 27'
              : 'M50 5 V92 M20 73 L50 95 L80 73';
      return `<svg width="${e.width}" height="${e.height}" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="${stroke === 'none' ? fill : stroke}" stroke-width="${Math.max(3, e.strokeWidth)}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
    }
  }
}
export function compileArtwork(
  scene: FilmScene,
  aspect: '16:9' | '9:16',
  style: 'warm' | 'chalk' | 'tech' | 'brand',
): ArtworkFrame {
  const bounds = artworkBounds(aspect),
    c = palettes[style]!;
  // Re-validate at the trust boundary even if a caller bypasses TypeScript / persisted schema.
  const parsed = scene.artwork
    ? sceneArtworkSchema.safeParse(scene.artwork)
    : undefined;
  const artwork =
    parsed?.success === true && isLegacyArtwork(parsed.data)
      ? parsed.data
      : undefined;
  const generated = artwork !== undefined;
  // Large panels are backgrounds; neither panels nor later masks may hide subjects/labels.
  const panelArea =
    (bounds.right - bounds.left) * (bounds.bottom - bounds.top) * 0.1;
  const layerOrder = (e: ArtworkElement) =>
    e.type === 'text'
      ? 2
      : e.type === 'rect' && e.width * e.height >= panelArea
        ? 0
        : 1;
  const v2 = artwork?.version === 2;
  const elements = (
    artwork ? [...artwork.elements] : fallback(scene, aspect === '9:16')
  ).sort((a, b) =>
    v2 ? (a.layer ?? 0) - (b.layer ?? 0) : layerOrder(a) - layerOrder(b),
  );
  const layers = elements.map((original): ArtworkLayer => {
    const e = { ...original };
    if (!v2) {
      e.width = Math.min(e.width, bounds.right - bounds.left);
      e.height = Math.min(e.height, bounds.bottom - bounds.top);
      e.x = Math.max(bounds.left, Math.min(e.x, bounds.right - e.width));
      e.y = Math.max(bounds.top, Math.min(e.y, bounds.bottom - e.height));
      if (e.type === 'text') {
        // Give wrapped text its needed space, staying in the content band.
        const needed = wrapArtworkText(e.text, e.width, 24).length * 24 * 1.32;
        e.height = Math.min(
          bounds.bottom - bounds.top,
          Math.max(e.height, needed),
        );
        e.y = Math.min(e.y, bounds.bottom - e.height);
      }
    }
    const cue = scene.cues[e.cueIndex];
    return {
      id: escapeXml(e.id),
      x: e.x,
      y: e.y,
      width: e.width,
      height: e.height,
      parentId: e.parentId,
      fillColor: c[e.fill],
      startMs:
        v2 && e.cueIndex === 0 ? 0 : (cue?.startMs ?? Number.MAX_SAFE_INTEGER),
      first: e.cueIndex === 0,
      transition: e.transition,
      opacity: e.opacity,
      svg: primitive(e, c),
      ...(!generated && e.type === 'text' ? { endMs: cue?.endMs } : {}),
    };
  });
  const brand = `<g fill="${c.muted}" font-family="system-ui,sans-serif"><text x="${bounds.left}" y="70" font-size="18" letter-spacing="4">THE THINKING SERIES</text><text x="${bounds.right}" y="75" text-anchor="end" font-size="28" font-weight="700" fill="${c.accent}">TimoTV</text></g><g transform="translate(${bounds.left} 100)">${textSvg(scene.title, bounds.right - bounds.left, 72, 42, c.ink)}</g>`;
  const heading =
    style === 'brand'
      ? brand
      : `<path d="M${bounds.left} ${aspect === '9:16' ? 70 : 62} h48" stroke="${c.accent}" stroke-width="7" stroke-linecap="round"/><g transform="translate(${bounds.left} ${aspect === '9:16' ? 100 : 85})">${textSvg(scene.title, bounds.right - bounds.left, aspect === '9:16' ? 128 : 85, aspect === '9:16' ? 48 : 52, c.ink)}</g>`;
  return {
    ...(v2
      ? { motion: compileMotion(artwork, scene.cues, { ...c }), ink: c.ink }
      : {}),
    width: bounds.width,
    height: bounds.height,
    paper: c.paper,
    heading,
    layers,
  };
}
/** Self-contained pure function: also embedded verbatim in the browser/export document. */
export function renderArtworkFrame(
  frame: ArtworkFrame,
  t: number,
  evaluate = evaluateScene,
  component = componentSvg,
): string {
  if (frame.motion) {
    const states = evaluate(frame.motion, t);
    const render = (parentId?: string): string =>
      frame.layers
        .filter((l) => l.parentId === parentId)
        .map((l) => {
          const e = states.find((e) => e.id === l.id)!;
          if (t < l.startMs) return '';
          let svg = l.svg;
          if (e.color && l.fillColor)
            svg = svg.split(l.fillColor).join(e.color);
          if (e.type === 'path') svg = svg.replace(/ d="[^"]*"/, ` d="${e.d}"`);
          if (e.type === 'component')
            svg = component(
              e.name,
              e.width,
              e.height,
              e.state,
              e.parameter,
              e.color ?? l.fillColor ?? frame.ink!,
              frame.ink!,
            );
          return `<g data-artwork-id="${l.id}" opacity="${e.opacity}" transform="translate(${e.x} ${e.y}) translate(${e.width / 2} ${e.height / 2}) rotate(${e.rotation}) scale(${e.scale}) translate(${-e.width / 2} ${-e.height / 2})">${e.type === 'group' ? '' : `<svg width="${e.width}" height="${e.height}" viewBox="0 0 ${e.width} ${e.height}" overflow="visible">${svg}</svg>`}${render(e.id)}</g>`;
        })
        .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${frame.width} ${frame.height}" role="img"><rect width="100%" height="100%" fill="${frame.paper}"/>${frame.heading}${render()}</svg>`;
  }
  let content = '';
  for (const l of frame.layers) {
    if (t < l.startMs || (l.endMs !== undefined && t >= l.endMs)) continue;
    const progress = l.first
      ? 1
      : Math.min(1, Math.max(0, (t - l.startMs) / 520));
    const ease = 1 - Math.pow(1 - progress, 3);
    const dy = l.transition === 'rise' ? (1 - ease) * 24 : 0;
    const scale = l.transition === 'grow' ? 0.88 + 0.12 * ease : 1;
    const clip =
      l.transition === 'draw'
        ? `<clipPath id="reveal-${l.id}"><rect width="${l.width * ease}" height="${l.height}"/></clipPath>`
        : '';
    content += `<g data-artwork-id="${l.id}" opacity="${l.opacity * (l.transition === 'draw' ? 1 : ease)}" transform="translate(${l.x + ((1 - scale) * l.width) / 2} ${l.y + dy + ((1 - scale) * l.height) / 2}) scale(${scale})">${clip}<svg width="${l.width}" height="${l.height}" viewBox="0 0 ${l.width} ${l.height}" overflow="hidden"${clip ? ` clip-path="url(#reveal-${l.id})"` : ''}>${l.svg}</svg></g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${frame.width} ${frame.height}" role="img"><rect width="100%" height="100%" fill="${frame.paper}"/>${frame.heading}${content}</svg>`;
}
