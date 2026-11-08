import {
  createProjectSchema,
  renameProjectSchema,
  timelineSchema,
  type Timeline,
} from '@timotv/contracts';
import type { ProjectRepository, TaskQueue } from '../ports/index.js';
export class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export class ProjectService {
  constructor(
    private repo: ProjectRepository,
    private queue: TaskQueue,
  ) {}
  create(input: unknown) {
    return this.repo.create(createProjectSchema.parse(input));
  }
  list() {
    return this.repo.list();
  }
  async get(id: string) {
    const p = await this.repo.get(id);
    if (!p) throw new DomainError('NOT_FOUND', '项目不存在', 404);
    return p;
  }
  async rename(id: string, input: unknown) {
    await this.get(id);
    return this.repo.rename(id, renameProjectSchema.parse(input).title);
  }
  async timeline(id: string) {
    await this.get(id);
    const t = await this.repo.timeline(id);
    if (!t) throw new DomainError('TIMELINE_MISSING', '项目时间轴缺失', 500);
    return t;
  }
  async saveTimeline(id: string, input: unknown): Promise<Timeline> {
    const t = timelineSchema.parse(input);
    const p = await this.get(id);
    if (t.projectId !== id || t.aspectRatio !== p.aspectRatio)
      throw new DomainError('INVALID_TIMELINE', '项目 ID 或画幅不匹配');
    const assets = new Map((await this.repo.assets(id)).map((a) => [a.id, a]));
    for (const c of [...t.videoClips, ...t.audioClips]) {
      const a = assets.get(c.assetId);
      if (!a || a.projectId !== id)
        throw new DomainError('INVALID_ASSET', '素材不存在或不属于此项目');
      if (a.kind !== c.kind)
        throw new DomainError('INVALID_ASSET', '素材类型不匹配');
      if (
        c.kind !== 'image' &&
        (a.durationMs === null || c.sourceOutMs > a.durationMs)
      )
        throw new DomainError('INVALID_RANGE', '片段超出素材时长');
    }
    return this.repo.saveTimeline(t);
  }
  async diagnose(projectId: string) {
    await this.get(projectId);
    await this.queue.health();
    const job = await this.repo.createJob(projectId);
    try {
      await this.queue.enqueueDiagnostic(job.id);
    } catch {
      await this.repo.updateJob(job.id, {
        status: 'failed',
        errorCode: 'QUEUE_UNAVAILABLE',
        errorMessage: '任务提交失败',
        finishedAt: new Date().toISOString(),
      });
      throw new DomainError('QUEUE_UNAVAILABLE', 'Redis 队列不可用', 503);
    }
    return job;
  }
  async job(id: string) {
    const j = await this.repo.getJob(id);
    if (!j) throw new DomainError('NOT_FOUND', '任务不存在', 404);
    return j;
  }
}
