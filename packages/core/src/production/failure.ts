import { randomUUID } from 'node:crypto';
import type {
  ProductionFailure,
  ProductionFailureContext,
  ProductionPhase,
} from '@timotv/contracts';

export type ProductionFailureInput = Omit<
  ProductionFailure,
  'diagnosticId' | 'causeSummary'
> & {
  causeSummary?: string;
};

export interface ProductionFailureFallback {
  phase: ProductionPhase;
  retryable?: boolean;
  publicMessage?: string;
  context?: ProductionFailureContext;
}

const assignmentSecret =
  /\b((?:TIMO_|VOLCENGINE_|ARK_|DEEPSEEK_|OPENAI_|ELEVENLABS_)?(?:API[_-]?KEY|ACCESS[_-]?KEY|SECRET(?:[_-]?KEY)?|TOKEN|PASSWORD|PWD))\b(\s*[:=]\s*)(["']?)[^\s,"'};]+\3/gi;

export function sanitizeCause(value: unknown): string {
  const source =
    value instanceof Error
      ? value.stack || `${value.name}: ${value.message}`
      : typeof value === 'string'
        ? value
        : (() => {
            try {
              return JSON.stringify(value) ?? String(value);
            } catch {
              return String(value);
            }
          })();

  return source
    .replace(/\b(Authorization\s*:\s*Bearer)\s+[^\s,;]+/gi, '$1 [REDACTED]')
    .replace(/\b(Bearer)\s+[^\s,;]+/gi, '$1 [REDACTED]')
    .replace(
      /\b([a-z][a-z0-9+.-]*:\/\/)([^/\s:@]+):([^@\s/]+)@/gi,
      '$1[REDACTED]@',
    )
    .replace(assignmentSecret, '$1$2[REDACTED]')
    .slice(0, 800);
}

export class ProductionFailureError extends Error {
  readonly failure: ProductionFailure;

  constructor(input: ProductionFailureInput, options?: ErrorOptions) {
    super(input.publicMessage, options);
    this.name = 'ProductionFailureError';
    this.failure = {
      ...input,
      diagnosticId: randomUUID(),
      causeSummary:
        (input.causeSummary === undefined
          ? undefined
          : sanitizeCause(input.causeSummary)) ??
        (options?.cause === undefined
          ? undefined
          : sanitizeCause(options.cause)),
    };
  }
}

export function toProductionFailure(
  error: unknown,
  fallback: ProductionFailureFallback,
): ProductionFailure {
  if (error instanceof ProductionFailureError) return error.failure;

  return {
    code: 'PRODUCTION_UNKNOWN_FAILED',
    phase: fallback.phase,
    retryable: fallback.retryable ?? false,
    publicMessage: fallback.publicMessage ?? '制作失败，请稍后重试',
    diagnosticId: randomUUID(),
    context: fallback.context,
    causeSummary: sanitizeCause(error),
  };
}
