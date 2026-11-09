import type { ZodIssue } from 'zod';

const fields = new Set(
  'sceneId artwork version runtime intent source sourceHash style extras elements tracks id type name x y width height cueIndex parentId layer transition fill stroke strokeWidth opacity radius d text fontSize align direction state parameter elementId property easing keyframes at value cueId progress offsetMs'.split(
    ' ',
  ),
);
function fieldPath(path: (string | number)[]) {
  return (
    path.reduce<string>(
      (text, part) =>
        typeof part === 'number'
          ? `${text}[${part}]`
          : `${text ? text + '.' : ''}${fields.has(part) ? part : '[未知字段]'}`,
      '',
    ) || 'artwork'
  );
}

/** Follow the union branch matching the declared version/type, not irrelevant alternatives. */
function leaves(issues: ZodIssue[]): ZodIssue[] {
  return issues.flatMap((issue) => {
    if (issue.code !== 'invalid_union') return [issue];
    const branches = issue.unionErrors.map((error) => leaves(error.issues));
    const score = (branch: ZodIssue[]) =>
      branch.length +
      branch.filter(
        (i) =>
          i.code === 'invalid_literal' &&
          ['version', 'type'].includes(String(i.path.at(-1))),
      ).length *
        1000;
    return branches.sort((a, b) => score(a) - score(b))[0] ?? [issue];
  });
}

export function artworkValidationDetails(
  issues: ZodIssue[],
  includeObjectIds = false,
): string[] {
  return [
    ...new Set(
      leaves(issues).map((issue) => {
        let reason: string;
        switch (issue.code) {
          // These messages originate in our schema/refinements, never in provider text.
          case 'custom':
            reason = includeObjectIds
              ? issue.message
              : issue.message.replace(/对象 [a-zA-Z0-9_-]{1,80}/g, '对象');
            break;
          case 'invalid_type':
            reason =
              issue.received === 'undefined'
                ? '缺少必填字段'
                : '字段类型不正确';
            break;
          case 'too_small':
            reason = `低于最小限制 ${issue.minimum}`;
            break;
          case 'too_big':
            reason = `超过最大限制 ${issue.maximum}`;
            break;
          case 'invalid_enum_value':
            reason = '不是支持的选项';
            break;
          case 'invalid_literal':
            reason =
              issue.received === undefined
                ? '缺少必填字段'
                : '与要求的固定值不一致';
            break;
          case 'invalid_string':
            reason = '字符串格式不符合要求';
            break;
          case 'unrecognized_keys':
            reason = '包含未支持的字段';
            break;
          default:
            reason = '字段结构或取值不符合要求';
        }
        return `${fieldPath(issue.path)}：${reason}`;
      }),
    ),
  ];
}

export class ArtworkValidationError extends Error {
  constructor(page: number, issues: ZodIssue[], attempts = 2) {
    const details = artworkValidationDetails(issues);
    const shown = details.slice(0, 8);
    super(
      `第 ${page} 页绘图格式校验失败（已尝试 ${attempts} 次），请重试绘图。\n${shown.map((text, i) => `${i + 1}. ${text}`).join('\n')}${details.length > shown.length ? `\n另有 ${details.length - shown.length} 项校验问题。` : ''}`,
    );
    this.name = 'ArtworkValidationError';
  }
}
