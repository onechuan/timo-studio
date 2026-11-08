import type {
  Project,
  CreateProject,
  Timeline,
  Asset,
  Job,
} from '@timotv/contracts';
export interface ProjectRepository {
  create(input: CreateProject): Promise<Project>;
  list(): Promise<Project[]>;
  get(id: string): Promise<Project | null>;
  rename(id: string, title: string): Promise<Project>;
  timeline(id: string): Promise<Timeline | null>;
  assets(projectId: string): Promise<Asset[]>;
  saveTimeline(t: Timeline): Promise<Timeline>;
  createJob(projectId: string): Promise<Job>;
  getJob(id: string): Promise<Job | null>;
  updateJob(
    id: string,
    patch: Partial<
      Pick<
        Job,
        | 'status'
        | 'progress'
        | 'errorCode'
        | 'errorMessage'
        | 'startedAt'
        | 'finishedAt'
      >
    >,
  ): Promise<Job>;
}
export interface TaskQueue {
  enqueueDiagnostic(id: string): Promise<void>;
  health(): Promise<void>;
}
export interface ObjectStorage {
  put(key: string, data: Uint8Array): Promise<void>;
  get(key: string): Promise<Uint8Array>;
}
