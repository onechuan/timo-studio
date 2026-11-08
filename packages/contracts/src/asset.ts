import { z } from 'zod';
export const assetSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  kind: z.enum(['video', 'audio', 'image']),
  originalName: z.string(),
  storageKey: z.string(),
  durationMs: z.number().int().nonnegative().nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  mimeType: z.string(),
});
export type Asset = z.infer<typeof assetSchema>;
