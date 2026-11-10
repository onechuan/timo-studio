import { expect, it } from 'vitest';
import {
  ProductionFailureError,
  sanitizeCause,
  toProductionFailure,
} from '../packages/core/src/production/failure.js';

it('preserves typed failure phase and retry context', () => {
  const failure = toProductionFailure(
    new ProductionFailureError({
      code: 'REVIEW_BROWSER_RUNTIME_FAILED',
      phase: 'reviewing',
      retryable: true,
      publicMessage: '第 2 页关键帧检查失败，可重试本页',
      context: { sceneId: 'p02' },
    }),
    { phase: 'illustrating' },
  );

  expect(failure).toMatchObject({
    code: 'REVIEW_BROWSER_RUNTIME_FAILED',
    phase: 'reviewing',
    retryable: true,
    context: { sceneId: 'p02' },
  });
  expect(failure.diagnosticId).toMatch(/^[a-f0-9-]{36}$/);
});

it('redacts credentials from internal cause summaries', () => {
  expect(
    sanitizeCause(
      'Authorization: Bearer secret-token postgresql://user:pass@localhost db API_KEY=abc',
    ),
  ).not.toMatch(/secret-token|user:pass|abc/);
});

it('maps unknown errors to a safe fallback failure', () => {
  const failure = toProductionFailure(new Error('API_KEY=secret unavailable'), {
    phase: 'planning',
  });

  expect(failure).toMatchObject({
    code: 'PRODUCTION_UNKNOWN_FAILED',
    phase: 'planning',
    retryable: false,
    publicMessage: '制作失败，请稍后重试',
  });
  expect(failure.causeSummary).not.toContain('secret');
});

it('handles empty thrown values without failing the mapper', () => {
  expect(
    toProductionFailure(undefined, { phase: 'queue' }),
  ).toMatchObject({
    code: 'PRODUCTION_UNKNOWN_FAILED',
    phase: 'queue',
  });
});
