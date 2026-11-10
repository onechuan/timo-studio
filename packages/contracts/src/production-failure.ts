import { z } from 'zod';

export const productionPhaseSchema = z.enum([
  'planning',
  'scripting',
  'narrating',
  'illustrating',
  'reviewing',
  'composing',
  'rendering',
  'storage',
  'queue',
]);
export type ProductionPhase = z.infer<typeof productionPhaseSchema>;

export const productionFailureContextSchema = z
  .object({
    sceneId: z.string().optional(),
    cueId: z.string().optional(),
  })
  .strict();
export type ProductionFailureContext = z.infer<
  typeof productionFailureContextSchema
>;

export const productionFailureSchema = z
  .object({
    code: z.string().regex(/^[A-Z][A-Z0-9_]+$/),
    phase: productionPhaseSchema,
    retryable: z.boolean(),
    publicMessage: z.string().min(1).max(500),
    diagnosticId: z.string().uuid(),
    context: productionFailureContextSchema.optional(),
    causeSummary: z.string().max(800).optional(),
  })
  .strict();
export type ProductionFailure = z.infer<typeof productionFailureSchema>;
