import { z } from 'zod';
export const jobSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  type: z.enum([
    'diagnostic',
    'plan',
    'produce',
    'illustrate',
    'export',
    'edit-export',
  ]),
  status: z.enum(['queued', 'running', 'succeeded', 'failed', 'cancelled']),
  progress: z.number().int().min(0).max(100),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().nullable(),
  finishedAt: z.string().datetime().nullable(),
});
export type Job = z.infer<typeof jobSchema>;
