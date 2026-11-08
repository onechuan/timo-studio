import type { ProjectRepository } from '@timotv/core';
export function diagnosticHandler(repo: ProjectRepository) {
  return async (id: string) => {
    const job = await repo.getJob(id);
    if (!job) throw new Error('JOB_NOT_FOUND');
    if (job.status === 'succeeded' || job.status === 'cancelled') return;
    await repo.updateJob(id, {
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
    });
    try {
      const project = await repo.get(job.projectId);
      const timeline = await repo.timeline(job.projectId);
      if (!project || !timeline) throw new Error('INVALID_PROJECT');
      await repo.updateJob(id, {
        status: 'succeeded',
        progress: 100,
        finishedAt: new Date().toISOString(),
        errorCode: null,
        errorMessage: null,
      });
    } catch {
      await repo.updateJob(id, {
        status: 'failed',
        errorCode: 'DIAGNOSTIC_FAILED',
        errorMessage: '项目或时间轴诊断失败',
        finishedAt: new Date().toISOString(),
      });
      throw new Error('DIAGNOSTIC_FAILED');
    }
  };
}
