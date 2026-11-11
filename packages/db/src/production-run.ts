import type { PrismaClient } from '@prisma/client';
import type { ProductionFailure } from '@timotv/contracts';
import {
  ProductionFailureError,
  type ProductionRunStore,
} from '@timotv/core';
import { repository } from './index.js';
import { productionStore } from './production.js';
export function productionRunStore(db: PrismaClient): ProductionRunStore {
  const write = async (
    p: Parameters<ProductionRunStore['start']>[0],
    id: string,
    mode: 'start' | 'checkpoint' | 'complete' | 'fail',
    progress = 5,
    failure?: ProductionFailure,
    action?: string,
  ) => {
    const normalizedFailure =
      typeof failure === 'string'
        ? new ProductionFailureError({
            code: 'PRODUCTION_UNKNOWN_FAILED',
            phase:
              action === 'plan'
                ? 'planning'
                : action === 'export'
                  ? 'rendering'
                  : 'illustrating',
            retryable: true,
            publicMessage: failure,
          }).failure
        : failure;
    await db.$transaction(async (tx) => {
      const terminal = mode === 'complete' || mode === 'fail';
      const next = terminal
        ? {
            ...p,
            jobId: undefined,
            failure: mode === 'fail' ? normalizedFailure : undefined,
            error:
              mode === 'fail'
                ? normalizedFailure?.publicMessage
                : undefined,
            ...(mode === 'fail'
              ? {
                  stage: 'failed',
                  failedAction: action,
                  events: [
                    ...p.events,
                    {
                      at: new Date().toISOString(),
                      message: normalizedFailure!.publicMessage,
                    },
                  ].slice(-150),
                }
              : {}),
          }
        : p;
      const updated = await tx.production.updateMany({
        where: { projectId: p.projectId, revision: p.revision, jobId: id },
        data: {
          data: JSON.parse(JSON.stringify(next)),
          ...(terminal ? { jobId: null } : {}),
        },
      });
      if (updated.count !== 1) throw new Error('任务版本已失效');
      const job = await tx.job.updateMany({
        where: {
          id,
          projectId: p.projectId,
          status: { in: ['queued', 'running'] },
        },
        data:
          mode === 'start'
            ? { status: 'running', startedAt: new Date(), progress }
            : mode === 'checkpoint'
              ? { progress }
              : {
                  status: mode === 'complete' ? 'succeeded' : 'failed',
                  ...(mode === 'complete' ? { progress: 100 } : {}),
                  finishedAt: new Date(),
                  ...(normalizedFailure
                    ? {
                        errorCode: normalizedFailure.code,
                        errorMessage: normalizedFailure.publicMessage,
                      }
                    : {}),
                },
      });
      if (job.count !== 1) throw new Error('任务已结束');
      if (mode === 'complete')
        await tx.project.update({
          where: { id: p.projectId },
          data: {
            status: p.stage === 'ready' ? 'ready' : 'draft',
            updatedAt: new Date(),
          },
        });
    });
  };
  return {
    async load(id) {
      const job = await repository(db).getJob(id);
      if (!job) return null;
      const production = await productionStore(db).get(job.projectId);
      return production ? { job, production } : null;
    },
    start: (p, id) => write(p, id, 'start'),
    checkpoint: (p, id, progress) => write(p, id, 'checkpoint', progress),
    complete: (p, id) => write(p, id, 'complete'),
    async fail(p, id, action, failure) {
      try {
        await write(p, id, 'fail', 5, failure, action);
      } catch (error) {
        if (
          error instanceof Error &&
          ['任务版本已失效', '任务已结束'].includes(error.message)
        )
          return;
        throw error;
      }
    },
  };
}
