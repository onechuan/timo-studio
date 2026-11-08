import { Queue, Worker } from 'bullmq';
import type { TaskQueue } from '@timotv/core';
export const queueName = 'timotv-diagnostics';
export function connection(url: string, worker = false) {
  const u = new URL(url);
  if (!['redis:', 'rediss:'].includes(u.protocol))
    throw new Error('REDIS_URL 协议无效');
  return {
    host: u.hostname,
    port: Number(u.port || 6379),
    username: u.username ? decodeURIComponent(u.username) : undefined,
    password: u.password ? decodeURIComponent(u.password) : undefined,
    db: Number(u.pathname.slice(1) || 0),
    tls: u.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: worker ? null : 1,
    connectTimeout: 2000,
    ...(!worker
      ? { enableOfflineQueue: false, retryStrategy: () => 1000 }
      : {}),
  };
}
export function taskQueue(url: string): TaskQueue & { close(): Promise<void> } {
  const q = new Queue(queueName, { connection: connection(url) });
  q.on('error', () => {});
  return {
    async health() {
      await q.getJobCounts('waiting');
    },
    async enqueueDiagnostic(id) {
      await q.add(
        'diagnostic',
        { id },
        { jobId: id, removeOnComplete: 100, removeOnFail: 100 },
      );
    },
    async close() {
      await q.close();
    },
  };
}
export function diagnosticWorker(
  url: string,
  run: (id: string) => Promise<void>,
) {
  return new Worker(
    queueName,
    async (job) => {
      await run(job.data.id);
    },
    { connection: connection(url, true), concurrency: 2 },
  );
}
