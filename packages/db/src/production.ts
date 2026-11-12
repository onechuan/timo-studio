import { Prisma, type PrismaClient } from '@prisma/client';
import type { Production, ProductionFailure } from '@timotv/contracts';
import {
  DomainError,
  ProductionFailureError,
  type ProductionStore,
} from '@timotv/core';
const json = (v: Production) =>
  JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
const conflict = () =>
  new DomainError(
    'REVISION_CONFLICT',
    '制作内容已更新或正在运行，请重新加载',
    409,
  );
const queueFailure = (
  code: string,
  publicMessage: string,
  cause?: unknown,
): ProductionFailure =>
  new ProductionFailureError(
    {
      code,
      phase: 'queue',
      retryable: true,
      publicMessage,
    },
    cause === undefined ? undefined : { cause },
  ).failure;
export function productionStore(db: PrismaClient): ProductionStore {
  return {
    async get(projectId) {
      const row = await db.production.findUnique({ where: { projectId } });
      return row ? (row.data as unknown as Production) : null;
    },
    async create(doc) {
      try {
        await db.production.create({
          data: {
            projectId: doc.projectId,
            revision: doc.revision,
            data: json(doc),
          },
        });
        return doc;
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        )
          throw conflict();
        throw e;
      }
    },
    async save(doc, expectedRevision) {
      const result = await db.production.updateMany({
        where: {
          projectId: doc.projectId,
          revision: expectedRevision,
          jobId: null,
        },
        data: { data: json(doc), revision: doc.revision },
      });
      if (result.count !== 1) throw conflict();
      return doc;
    },
    async claim(projectId, revision, stage, type, options) {
      return db.$transaction(async (tx) => {
        const row = await tx.production.findUniqueOrThrow({
          where: { projectId },
        });
        if (row.revision !== revision || row.jobId) throw conflict();
        const job = await tx.job.create({ data: { projectId, type } });
        const current = row.data as unknown as Production;
        const nextRevision = type === 'export' ? revision : revision + 1;
        const next: Production = {
          ...current,
          stage,
          revision: nextRevision,
          jobId: job.id,
          failure: undefined,
          error: undefined,
          failedAction: undefined,
          // A pipeline resume must not keep a page-scoped review task from an
          // earlier failure; otherwise only that page is processed and pages
          // still waiting for artwork are skipped.
          reviewTask: options?.illustrationSceneId
            ? {
                sceneId: options.illustrationSceneId,
                mode: options.reviewMode ?? 'illustrate',
              }
            : undefined,
        };
        if (
          type === 'produce' &&
          !(
            current.stage === 'failed' &&
            current.failedAction === 'produce' &&
            current.artifacts.audio
          )
        ) {
          next.artifacts = {};
          next.durationMs = undefined;
        }
        if (type === 'illustrate') {
          const resumesReview =
            !options?.illustrationSceneId &&
            !options?.restartIllustration &&
            current.stage === 'failed' &&
            current.reviewTask &&
            current.reviewTask.mode !== 'illustrate';
          next.artifacts =
            options?.reviewMode || resumesReview
              ? { ...current.artifacts }
              : {
                  audio: current.artifacts.audio,
                  subtitles: current.artifacts.subtitles,
                };
          if (options?.reviewMode && options.illustrationSceneId) {
            next.scenes = current.scenes.map((s) =>
              s.id !== options.illustrationSceneId
                ? s
                : {
                    ...s,
                    review:
                      s.review?.status === 'failed'
                        ? {
                            ...s.review,
                            status: s.review.resume ?? 'checking',
                            error: undefined,
                          }
                        : options.reviewMode === 'repair' && s.review
                          ? {
                              ...s.review,
                              status: 'repairing',
                              round: 1,
                              error: undefined,
                              resume: undefined,
                            }
                          : undefined,
                  },
            );
            const interrupted = current.scenes.find(
              (s) => s.id === options.illustrationSceneId,
            )?.review;
            if (
              interrupted?.status === 'failed' &&
              current.reviewTask?.sceneId === options.illustrationSceneId
            )
              next.reviewTask = current.reviewTask;
          } else if (options?.illustrationSceneId) {
            next.scenes = current.scenes.map((s) => {
              if (s.id !== options.illustrationSceneId) return s;
              const { artwork: _artwork, review: _review, ...scene } = s;
              return scene;
            });
          } else if (
            options?.restartIllustration ||
            !(
              current.stage === 'failed' &&
              current.failedAction === 'illustrate'
            )
          )
            next.scenes = current.scenes.map(
              ({ artwork: _artwork, review: _review, ...scene }) => scene,
            );
        }
        if (type === 'plan') {
          next.scenes = [];
          next.storyboard = undefined;
          next.artifacts = {};
          next.durationMs = undefined;
        }
        const updated = await tx.production.updateMany({
          where: { projectId, revision, jobId: null },
          data: { revision: nextRevision, jobId: job.id, data: json(next) },
        });
        if (updated.count !== 1) throw conflict();
        return { production: next, job: { id: job.id, type: job.type } };
      });
    },
    async failSubmission(projectId, jobId) {
      const row = await db.production.findUnique({ where: { projectId } });
      if (!row || row.jobId !== jobId) return;
      const job = await db.job.findUnique({ where: { id: jobId } });
      const failure = queueFailure(
        'QUEUE_SUBMISSION_FAILED',
        '任务提交失败，请重试',
      );
      const next = {
        ...(row.data as unknown as Production),
        stage: 'failed' as const,
        jobId: undefined,
        failure,
        error: failure.publicMessage,
        failedAction: job?.type as 'plan' | 'produce' | 'illustrate' | 'export',
      };
      await db.$transaction([
        db.production.updateMany({
          where: { projectId, jobId },
          data: { jobId: null, data: json(next) },
        }),
        db.job.updateMany({
          where: { id: jobId, status: 'queued' },
          data: {
            status: 'failed',
            errorCode: failure.code,
            errorMessage: failure.publicMessage,
            finishedAt: new Date(),
          },
        }),
      ]);
    },
  };
}
/** Only the task owning this revision can persist a run; user edits and newer tasks cannot be overwritten. */
export async function persistProductionRun(
  db: PrismaClient,
  p: Production,
  jobId: string,
  done = false,
) {
  const result = await db.production.updateMany({
    where: { projectId: p.projectId, revision: p.revision, jobId },
    data: {
      data: json({ ...p, jobId: done ? undefined : jobId }),
      ...(done ? { jobId: null } : {}),
    },
  });
  if (result.count !== 1) throw conflict();
}

/** Requeue queued submissions; release running tasks only on confirmed terminal queue state. */
export async function reconcileProductionQueue(
  db: PrismaClient,
  queue: {
    enqueue(id: string): Promise<void>;
    state?(id: string): Promise<string | undefined>;
  },
) {
  const jobs = await db.job.findMany({
    where: {
      status: { in: ['queued', 'running'] },
      type: { in: ['plan', 'produce', 'illustrate', 'export'] },
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });
  for (const job of jobs) {
    const row = await db.production.findUnique({
      where: { projectId: job.projectId },
    });
    if (row?.jobId !== job.id) {
      await db.job.updateMany({
        where: { id: job.id, status: 'queued' },
        data: { status: 'cancelled', finishedAt: new Date() },
      });
      continue;
    }
    const state = await queue.state?.(job.id);
    if (state === 'failed' || state === 'completed') {
      await failProductionJob(
        db,
        job.id,
        queueFailure(
          'QUEUE_TERMINAL_STATE',
          '队列任务已结束但制作未完成，请重试',
        ),
      );
    } else if (job.status === 'queued' && (!state || state === 'unknown')) {
      await queue.enqueue(job.id);
    }
  }
}

export async function failProductionJob(
  db: PrismaClient,
  id: string,
  failure: ProductionFailure | string,
) {
  const normalizedFailure =
    typeof failure === 'string'
      ? queueFailure('PRODUCTION_UNKNOWN_FAILED', failure)
      : failure;
  await db.$transaction(async (tx) => {
    const job = await tx.job.findUnique({ where: { id } });
    if (!job || !['queued', 'running'].includes(job.status)) return;
    const row = await tx.production.findUnique({
      where: { projectId: job.projectId },
    });
    if (!row || row.jobId !== id) return;
    const p = row.data as unknown as Production;
    const result = await tx.production.updateMany({
      where: { projectId: job.projectId, revision: row.revision, jobId: id },
      data: {
        jobId: null,
        data: json({
          ...p,
          jobId: undefined,
          stage: 'failed',
          failedAction: job.type as
            'plan' | 'produce' | 'illustrate' | 'export',
          failure: normalizedFailure,
          error: normalizedFailure.publicMessage,
        }),
      },
    });
    if (result.count)
      await tx.job.updateMany({
        where: { id, status: { in: ['queued', 'running'] } },
        data: {
          status: 'failed',
          errorCode: normalizedFailure.code,
          errorMessage: normalizedFailure.publicMessage,
          finishedAt: new Date(),
        },
      });
  });
}
