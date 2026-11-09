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
  const outside = (a: DOMRect, b: DOMRect, tolerance = 2) =>
    a.left < b.left - tolerance ||
    a.right > b.right + tolerance ||
    a.top < b.top - tolerance ||
    a.bottom > b.bottom + tolerance;
  const intersects = (a: DOMRect, b: DOMRect) =>
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
  ].filter((e) => !e.closest('[data-artwork-id]'));
  for (const title of headings)
    if (visible(title) && outside(title.getBoundingClientRect(), canvas))
      add('标题实际文字超出画面边界。', []);
  const elements = [
    ...document.querySelectorAll<SVGGraphicsElement>(
      '[data-artwork-id], [data-item]',
    ),
  ].filter(visible);
  const elementId = (el: Element) =>
    el.getAttribute('data-artwork-id') ||
    `item-${el.getAttribute('data-item')}`;
  let subjects = 0;
  for (const el of elements) {
    const id = elementId(el),
      box = el.getBoundingClientRect(),
      decorative = decorativeIds.includes(id);
    if (!decorative && intersects(box, canvas)) subjects++;
    if (!decorative && outside(box, canvas))
      add('变换后的对象超出画面边界。', [id]);
    if (!decorative && caption?.textContent && intersects(box, captionBox))
      add('对象侵占字幕文字区域。', [id]);
    if (
      !decorative &&
      headings.some((h) => intersects(box, h.getBoundingClientRect()))
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
      if (intersects(a.getBoundingClientRect(), b.getBoundingClientRect()))
        add(
          '对象边界相交；请结合截图确认是否为有意叠放。',
          [aid, bid],
          'warning',
        );
    }
  return issues;
}
