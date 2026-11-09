import { readFileSync } from 'node:fs';
import { contentTypeSchema, type ContentType } from '@timotv/contracts';

const directories: Record<ContentType, string> = {
  general: 'general-narration',
  explainer: 'science-explainer',
  product: 'product-introduction',
};

/** Only the artwork stage loads this bundled method; no user-supplied paths. */
export function loadArtworkSkill(): string {
  return readFileSync(
    new URL('../../skills/visual-storytelling/SKILL.md', import.meta.url),
    'utf8',
  );
}

export function loadProgramArtworkSkill(): string {
  return readFileSync(
    new URL('../../skills/program-drawing/SKILL.md', import.meta.url),
    'utf8',
  );
}

/** Code selects a bundled skill; user input can never supply a filesystem path. */
export function loadContentSkill(
  contentType: ContentType | undefined,
  stage: 'planning' | 'script',
): string {
  const type = contentTypeSchema.parse(contentType ?? 'general');
  const base = new URL(`../../skills/${directories[type]}/`, import.meta.url);
  const common = readFileSync(new URL('SKILL.md', base), 'utf8');
  const reference = readFileSync(
    new URL(`references/${stage}.md`, base),
    'utf8',
  );
  const shared = readFileSync(new URL(`../shared/${stage}.md`, base), 'utf8');
  return [
    '以下是代码为本次创作选择的内置 Skill，仅补充表达方法。阶段职责、submit 输出结构、审批和事实约束仍以上文为准。示例只说明写法，不能当作用户资料或产品事实。',
    shared,
    common,
    reference,
  ].join('\n\n');
}
