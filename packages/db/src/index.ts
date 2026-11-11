import {
  PrismaClient,
  Prisma,
  type Project as DbProject,
  type Job as DbJob,
} from '@prisma/client';
import {
  projectSchema,
  jobSchema,
  assetSchema,
  timelineSchema,
  emptyTimeline,
  type Timeline,
} from '@timotv/contracts';
import { DomainError, type ProjectRepository } from '@timotv/core';
export { PrismaClient };
const project = (p: DbProject) =>
  projectSchema.parse({
    id: p.id,
    title: p.title,
    kind: p.kind,
    aspectRatio: p.aspectRatio,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  });
const job = (j: DbJob) =>
  jobSchema.parse({
    id: j.id,
    projectId: j.projectId,
    type: j.type,
    status: j.status,
    progress: j.progress,
    errorCode: j.errorCode,
    errorMessage: j.errorMessage,
    createdAt: j.createdAt.toISOString(),
    startedAt: j.startedAt?.toISOString() ?? null,
    finishedAt: j.finishedAt?.toISOString() ?? null,
  });
const json = (t: Timeline) =>
  JSON.parse(JSON.stringify(t)) as Prisma.InputJsonValue;
export function repository(db: PrismaClient): ProjectRepository {
  return {
    async create(input) {
      return db.$transaction(async (tx) => {
        const p = await tx.project.create({ data: input });
        await tx.timeline.create({
          data: {
            projectId: p.id,
            data: json(emptyTimeline(p.id, input.aspectRatio)),
          },
        });
        return project(p);
      });
    },
    async list() {
      return (
        await db.project.findMany({ orderBy: { updatedAt: 'desc' }, take: 200 })
      ).map(project);
    },
    async get(id) {
      const p = await db.project.findUnique({ where: { id } });
      return p ? project(p) : null;
    },
    async rename(id, title) {
      return project(
        await db.project.update({ where: { id }, data: { title } }),
      );
    },
    async timeline(projectId) {
      const t = await db.timeline.findUnique({ where: { projectId } });
      return t
        ? timelineSchema.parse({ ...(t.data as object), revision: t.revision })
        : null;
    },
    async assets(projectId) {
      return (await db.asset.findMany({ where: { projectId } })).map((a) =>
        assetSchema.parse({
          id: a.id,
          projectId: a.projectId,
          kind: a.kind,
          originalName: a.originalName,
          storageKey: a.storageKey,
          durationMs: a.durationMs,
          width: a.width,
          height: a.height,
          mimeType: a.mimeType,
        }),
      );
    },
    async saveTimeline(t) {
      return db.$transaction(async (tx) => {
        const next = { ...t, revision: t.revision + 1 };
        const result = await tx.timeline.updateMany({
          where: { projectId: t.projectId, revision: t.revision },
          data: { revision: { increment: 1 }, data: json(next) },
        });
        if (result.count !== 1)
          throw new DomainError(
            'REVISION_CONFLICT',
            '时间轴已更新，请重新加载后再保存',
            409,
          );
        await tx.project.update({
          where: { id: t.projectId },
          data: { updatedAt: new Date() },
        });
        return next;
      });
    },
    async createJob(projectId) {
      return job(
        await db.job.create({ data: { projectId, type: 'diagnostic' } }),
      );
    },
    async getJob(id) {
      const j = await db.job.findUnique({ where: { id } });
      return j ? job(j) : null;
    },
    async updateJob(id, patch) {
      return job(
        await db.job.update({
          where: { id },
          data: {
            ...patch,
            startedAt: patch.startedAt ? new Date(patch.startedAt) : undefined,
            finishedAt: patch.finishedAt
              ? new Date(patch.finishedAt)
              : undefined,
          },
        }),
      );
    },
  };
}

export * from './production.js';

export * from './production-run.js';
