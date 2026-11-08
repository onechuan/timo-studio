import { z } from 'zod';
export const aspectRatioSchema = z.enum(['16:9', '9:16']);
export const createProjectSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    kind: z.enum(['generated', 'edited', 'narration']),
    aspectRatio: aspectRatioSchema,
  })
  .strict();
export const renameProjectSchema = createProjectSchema.pick({ title: true });
export const projectSchema = createProjectSchema.extend({
  id: z.string().uuid(),
  status: z.enum(['draft', 'ready', 'archived']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Project = z.infer<typeof projectSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
