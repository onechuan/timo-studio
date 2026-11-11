import { z } from 'zod';

export const visualProblemSchema = z.object({
  atMs: z.number().int().nonnegative(),
  elementIds: z
    .array(z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/))
    .max(48)
    .default([]),
  what: z.string().trim().min(1).max(600),
  fix: z.string().trim().min(1).max(1000),
});
export const visualVerdictSchema = z
  .object({
    pass: z.boolean(),
    issues: z.array(visualProblemSchema).max(5),
  })
  .superRefine((v, ctx) => {
    if (v.pass !== (v.issues.length === 0))
      ctx.addIssue({ code: 'custom', message: '审片结论与问题数量不一致' });
  });
const reviewIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
export const reviewIssueSchema = z
  .object({
    kind: z.enum(['layout', 'visual', 'runtime']),
    severity: z.enum(['error', 'warning']),
    atMs: z.number().int().nonnegative(),
    elementIds: z.array(reviewIdSchema).max(48),
    what: z.string().trim().min(1).max(600),
    fix: z.string().trim().min(1).max(1000),
  })
  .strict();
export const reviewFrameSchema = z
  .object({
    key: z.string().trim().min(1).max(500),
    timeMs: z.number().int().nonnegative(),
    cueId: reviewIdSchema.optional(),
  })
  .strict();
export const wholeFilmIssueSchema = z
  .object({
    kind: z.enum(['continuity', 'visual', 'rhythm', 'runtime']),
    severity: z.enum(['error', 'warning']),
    sceneIds: z.array(reviewIdSchema).min(1).max(6),
    atMs: z.number().int().nonnegative(),
    elementIds: z.array(reviewIdSchema).max(48).default([]),
    what: z.string().trim().min(1).max(600),
    fix: z.string().trim().min(1).max(1000),
  })
  .strict();
export const wholeFilmReviewSchema = z
  .object({
    fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    status: z.enum([
      'checking',
      'repairing',
      'passed',
      'unreviewed',
      'needs_attention',
      'failed',
      'accepted',
    ]),
    round: z.number().int().min(0).max(2),
    frames: z.array(reviewFrameSchema).max(120),
    issues: z.array(wholeFilmIssueSchema).max(20),
    error: z.string().trim().min(1).max(1000).optional(),
    resume: z.enum(['checking', 'repairing']).optional(),
  })
  .strict();
export type ReviewIssue = z.infer<typeof reviewIssueSchema>;
export type ReviewFrame = z.infer<typeof reviewFrameSchema>;
export type WholeFilmIssue = z.infer<typeof wholeFilmIssueSchema>;
export type WholeFilmReview = z.infer<typeof wholeFilmReviewSchema>;
export interface SceneReview {
  fingerprint: string;
  status:
    | 'checking'
    | 'repairing'
    | 'passed'
    | 'unreviewed'
    | 'needs_attention'
    | 'failed'
    | 'accepted';
  round: number;
  mode: 'visual' | 'layout';
  frames: ReviewFrame[];
  issues: ReviewIssue[];
  omittedCueIds: string[];
  error?: string;
  resume?: 'checking' | 'repairing';
}
export const sceneReviewLabels: Record<SceneReview['status'], string> = {
  checking: '检查中',
  repairing: '修正中',
  passed: '视觉审片通过',
  unreviewed: '未视觉审片',
  needs_attention: '待人工确认',
  failed: '审片失败',
  accepted: '已人工接受',
};
