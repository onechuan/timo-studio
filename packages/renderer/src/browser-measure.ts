import type { ReviewIssue } from '@timotv/contracts';
/** Self-contained browser function; transformed DOM geometry includes ancestor groups. */
export function measureReviewFrame({
  atMs,
  decorativeIds,
}: {
  atMs: number;
  decorativeIds: string[];
}): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const add = (
    what: string,
    elementIds: string[],
    severity: 'error' | 'warning' = 'error',
  ) =>
    issues.push({
      kind: 'layout',
      severity,
      atMs,
      elementIds,
      what,
      fix: '调整对象位置、尺寸、层级或文字换行，并重新检查该时间点。',
    });
  const canvas = document
    .querySelector('#film-canvas')!
    .getBoundingClientRect();
  type Box = Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'>;
  const outside = (a: Box, b: Box, tolerance = 2) =>
    a.left < b.left - tolerance ||
    a.right > b.right + tolerance ||
    a.top < b.top - tolerance ||
    a.bottom > b.bottom + tolerance;
  const intersects = (a: Box, b: Box) =>
    Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
  const visible = (el: Element) => {
    let opacity = 1;
    for (let node: Element | null = el; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden')
        return false;
      opacity *= Number(style.opacity);
    }
    const r = el.getBoundingClientRect();
    return opacity > 0.02 && r.width > 0 && r.height > 0;
  };
  const union = (a: Box, b: Box): Box => ({
    left: Math.min(a.left, b.left),
    top: Math.min(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
  });
  // HTML text sits in a fixed-width .tx box (1200px for centered text), so its
  // container can extend past the canvas while every drawn glyph is inside it.
  // Measure the revealed characters instead of the layout container.
  const isText = (el: Element) => el.classList.contains('tx');
  const textBox = (el: Element): Box | null => {
    let box: Box | null = null;
    for (const span of el.querySelectorAll<HTMLElement>('.ch')) {
      if (!visible(span)) continue;
      const r = span.getBoundingClientRect();
      box = box
        ? union(box, r)
        : { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    }
    return box;
  };
  // Null for text that has not been written yet: its wide container is not drawn.
  const boxOf = (el: Element): Box | null =>
    isText(el) ? textBox(el) : el.getBoundingClientRect();
  // A drawn SVG thing keeps its full geometry while its strokes are still
  // visibility:hidden. Treat it as absent until at least one shape is shown.
  const drawn = (el: Element) => {
    if (el.namespaceURI !== 'http://www.w3.org/2000/svg') return true;
    const shapes = el.querySelectorAll(
      'path, line, rect, circle, ellipse, polyline, polygon, text, image, use',
    );
    return !shapes.length || [...shapes].some(visible);
  };
  const viewportBox = (svg: SVGSVGElement) => {
    const v = svg.viewBox.baseVal,
      m = svg.getScreenCTM();
    if (!m) return svg.getBoundingClientRect();
    const x = v.width ? v.x : 0,
      y = v.height ? v.y : 0,
      w = v.width || svg.width.baseVal.value,
      h = v.height || svg.height.baseVal.value;
    const points = [
      [x, y],
      [x + w, y],
      [x, y + h],
      [x + w, y + h],
    ].map(([px, py]) => new DOMPoint(px, py).matrixTransform(m));
    const left = Math.min(...points.map((p) => p.x)),
      top = Math.min(...points.map((p) => p.y));
    return new DOMRect(
      left,
      top,
      Math.max(...points.map((p) => p.x)) - left,
      Math.max(...points.map((p) => p.y)) - top,
    );
  };
  const caption = document.querySelector('#caption, .subs span');
  const captionBox = (() => {
    if (!caption) return new DOMRect();
    const range = document.createRange();
    range.selectNodeContents(caption);
    return range.getBoundingClientRect();
  })();
  if (caption?.textContent && outside(captionBox, canvas))
    add('字幕实际文字超出画面安全边界。', []);
  const headings = [
    ...document.querySelectorAll<HTMLElement | SVGGraphicsElement>(
      '#visual > svg text, .hud .tx',
    ),
  ]
    .filter((e) => !e.closest('[data-artwork-id]'))
    .map((el) => ({ el, box: boxOf(el) }))
    .filter(
      (
        heading,
      ): heading is {
        el: HTMLElement | SVGGraphicsElement;
        box: Box;
      } => heading.box !== null,
    );
  for (const heading of headings)
    if (outside(heading.box, canvas)) add('标题实际文字超出画面边界。', []);
  const elements: Element[] = [];
  const boxes = new Map<Element, Box>();
  for (const el of document.querySelectorAll<SVGGraphicsElement>(
    '[data-artwork-id], [data-item]',
  )) {
    if (!visible(el) || !drawn(el)) continue;
    const box = boxOf(el);
    if (!box) continue;
    elements.push(el);
    boxes.set(el, box);
  }
  const elementId = (el: Element) =>
    el.getAttribute('data-artwork-id') ||
    `item-${el.getAttribute('data-item')}`;
  let subjects = 0;
  for (const el of elements) {
    const id = elementId(el),
      box = boxes.get(el)!,
      decorative = decorativeIds.includes(id);
    if (!decorative && intersects(box, canvas)) subjects++;
    if (!decorative && outside(box, canvas))
      add('变换后的对象超出画面边界。', [id]);
    if (!decorative && caption?.textContent && intersects(box, captionBox))
      add('对象侵占字幕文字区域。', [id], 'warning');
    if (
      !decorative &&
      headings.some(
        (h) =>
          !el.contains(h.el) && !h.el.contains(el) && intersects(box, h.box),
      )
    )
      add('对象侵占标题文字区域。', [id]);
    for (const text of el.querySelectorAll<SVGGraphicsElement>('text')) {
      if (text.closest('[data-artwork-id]') !== el || !visible(text)) continue;
      const actual = text.getBoundingClientRect();
      if (outside(actual, canvas)) add('文字实际绘制范围超出画面。', [id]);
      for (
        let ancestor = text.parentElement;
        ancestor && ancestor !== el.parentElement;
        ancestor = ancestor.parentElement
      ) {
        if (
          ancestor.tagName.toLowerCase() === 'svg' &&
          outside(actual, viewportBox(ancestor as unknown as SVGSVGElement), 4)
        ) {
          add(
            ['hidden', 'clip'].includes(getComputedStyle(ancestor).overflow)
              ? '文字被对象绘图区域裁切。'
              : '文字实际绘制范围超出对象布局区域。',
            [id],
          );
          break;
        }
      }
    }
  }
  if (!subjects) add('当前采样帧未发现可见主体。', []);
  for (let i = 0; i < elements.length; i++)
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i],
        b = elements[j],
        aid = elementId(a),
        bid = elementId(b);
      if (
        decorativeIds.includes(aid) ||
        decorativeIds.includes(bid) ||
        a.contains(b) ||
        b.contains(a)
      )
        continue;
      if (intersects(boxes.get(a)!, boxes.get(b)!))
        add(
          '对象边界相交；请结合截图确认是否为有意叠放。',
          [aid, bid],
          'warning',
        );
    }
  return issues;
}
