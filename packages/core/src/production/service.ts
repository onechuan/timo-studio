import {
  buildEditSource,
  deriveEditTimeline,
  isEditCurrent,
  productionBriefSchema,
  needsDurationDecision,
  productionActionSchema,
  productionUpdateSchema,
  type Production,
  type ProductionEditInput,
  type ProductionStage,
  type ProductionCapabilities,
  type VideoPipeline,
} from '@timotv/contracts';
import { DomainError } from '../projects/service.js';
export type FilmJobType =
  'plan' | 'produce' | 'illustrate' | 'export' | 'edit-export';
export interface ProductionStore {
  get(id: string): Promise<Production | null>;
  create(doc: Production): Promise<Production>;
  save(doc: Production, expectedRevision: number): Promise<Production>;
  claim(
    id: string,
    revision: number,
    stage: ProductionStage,
    type: FilmJobType,
    options?: {
      restartIllustration?: boolean;
      illustrationSceneId?: string;
      reviewMode?: 'review' | 'repair';
    },
  ): Promise<{ production: Production; job: { id: string; type: string } }>;
  failSubmission(id: string, jobId: string): Promise<void>;
}
export interface FilmQueue {
  enqueue(id: string): Promise<void>;
  health(): Promise<void>;
}
export class ProductionService {
  constructor(
    private store: ProductionStore,
    private queue: FilmQueue,
    readonly capabilities:
      ProductionCapabilities | (() => Promise<ProductionCapabilities>),
    private projectExists: (
      id: string,
    ) => Promise<boolean | { aspectRatio: '16:9' | '9:16' } | null>,
    private defaultPipeline: () => Promise<VideoPipeline> = async () =>
      'legacy-v3',
  ) {}
  async get(id: string) {
    const p = await this.store.get(id);
    // A stale edit must never reach the UI or the export action. Hide it
    // without rewriting the row so the original decision stays auditable.
    return p?.edit && !isEditCurrent(p) ? { ...p, edit: undefined } : p;
  }
  async create(id: string, input: unknown) {
    const brief = productionBriefSchema.parse(input);
    const project = await this.projectExists(id);
    if (!project) throw new DomainError('NOT_FOUND', '项目不存在', 404);
    if (await this.store.get(id))
      throw new DomainError(
        'ALREADY_EXISTS',
        '项目已有制作内容，请重新打开',
        409,
      );
    const videoPipeline = await this.defaultPipeline();
    return this.store.create({
      aspectRatio: typeof project === 'object' ? project!.aspectRatio : '16:9',
      projectId: id,
      videoPipeline,
      revision: 0,
      stage: 'draft',
      brief,
      scenes: [],
      artifacts: {},
      events: [],
    });
  }
  private async current(id: string, revision: number) {
    const p = await this.store.get(id);
    if (!p) throw new DomainError('NOT_FOUND', '请先填写主题或资料', 404);
    if (p.revision !== revision)
      throw new DomainError(
        'REVISION_CONFLICT',
        '内容已更新，请重新加载后再操作',
        409,
      );
    if (p.jobId)
      throw new DomainError(
        'PRODUCTION_BUSY',
        '正在制作，请等待当前任务结束',
        409,
      );
    return p;
  }
  async update(id: string, input: unknown) {
    const v = productionUpdateSchema.parse(input),
      p = await this.current(id, v.revision);
    if (v.brief && (v.scenes || v.storyboard))
      throw new DomainError('INVALID_UPDATE', '主题与制作内容请分别保存');
    if (v.storyboard && v.scenes)
      throw new DomainError('INVALID_UPDATE', '分镜与口播请分别保存');
    if (v.storyboard && p.stage !== 'approval')
      throw new DomainError('INVALID_STAGE', '仅能在分镜确认阶段修改分镜');
    if (v.scenes && !p.scenes.length)
      throw new DomainError('INVALID_STAGE', '系统尚未生成口播');
    if (v.edit !== undefined) {
      if (v.brief || v.storyboard || v.scenes)
        throw new DomainError(
          'INVALID_UPDATE',
          '剪辑与主题、分镜或口播请分别保存',
        );
      if (v.edit === null) {
        if (!p.edit) return p;
        const recovering =
          p.stage === 'failed' && p.failedAction === 'edit-export';
        return this.store.save(
          {
            ...p,
            revision: p.revision + 1,
            edit: undefined,
            ...(recovering
              ? {
                  stage: 'ready' as const,
                  failure: undefined,
                  error: undefined,
                  failedAction: undefined,
                }
              : {}),
          },
          p.revision,
        );
      }
      return this.saveEdit(p, v.edit);
    }
    const next: Production = {
      ...p,
      revision: p.revision + 1,
      error: undefined,
      failure: undefined,
      failedAction: undefined,
      durationState: undefined,
      artifacts: {},
      durationMs: undefined,
      reviewTask: undefined,
      // Any content change invalidates what the exported film contained.
      edit: undefined,
    };
    if (v.brief) {
      next.brief = v.brief;
      const { durationSec: oldDuration, ...oldBrief } = p.brief;
      const { durationSec: newDuration, ...newBrief } = v.brief;
      if (
        oldDuration !== newDuration &&
        JSON.stringify(oldBrief) === JSON.stringify(newBrief) &&
        p.artifacts.audio &&
        p.durationMs &&
        p.scenes.length
      ) {
        const targetMs = newDuration * 1000;
        return this.store.save(
          {
            ...next,
            scenes: p.scenes,
            artifacts: p.artifacts,
            durationMs: p.durationMs,
            stage: 'narrating',
            durationState: {
              targetMs,
              minMs: Math.round(targetMs * 0.9),
              maxMs: Math.round(targetMs * 1.1),
              measuredMs: p.durationMs,
              correctionRound: 0,
              status: 'estimating',
            },
          },
          p.revision,
        );
      }
      const {
        voiceProvider: _oldProvider,
        voice: _oldVoice,
        contentType: oldType = 'general',
        ...oldContent
      } = p.brief;
      const {
        voiceProvider: _newProvider,
        voice: _newVoice,
        contentType: newType = 'general',
        ...newContent
      } = v.brief;
      if (
        oldType === newType &&
        JSON.stringify(oldContent) === JSON.stringify(newContent)
      ) {
        next.scenes = p.scenes.map((s) => ({
          ...s,
          review: undefined,
          cues: s.cues.map((c) => ({ id: c.id, text: c.text })),
        }));
        next.stage = next.scenes.length
          ? 'narrating'
          : p.storyboard
            ? 'approval'
            : 'draft';
      } else {
        next.stage = 'draft';
        next.storyboard = undefined;
        next.scenes = [];
      }
    }
    if (v.storyboard) {
      next.storyboard = v.storyboard;
      next.scenes = [];
      next.stage = 'approval';
    }
    if (v.scenes) {
      next.scenes = v.scenes.map((s) => ({
        ...s,
        artwork: (() => {
          const old = p.scenes.find((previous) => previous.id === s.id);
          const semantic = (scene: typeof s) =>
            JSON.stringify([
              scene.title,
              scene.visual,
              scene.beats,
              scene.layout,
              scene.cues.map((c) => [c.id, c.text]),
            ]);
          return old && semantic(old) === semantic(s) ? old.artwork : undefined;
        })(),
        cues: s.cues.map((c) => ({ id: c.id, text: c.text })),
      }));
      next.stage = 'narrating';
    }
    return this.store.save(next, p.revision);
  }
  private async saveEdit(p: Production, input: ProductionEditInput) {
    if (!p.artifacts.video || !p.durationMs || !p.scenes.length)
      throw new DomainError('INVALID_STAGE', '请先导出视频，再进行剪辑');
    if (
      p.stage !== 'ready' &&
      !(p.stage === 'failed' && p.failedAction === 'edit-export')
    )
      throw new DomainError('INVALID_STAGE', '请等待当前制作完成后再剪辑');
    const source = buildEditSource(p);
    let timeline;
    try {
      timeline = deriveEditTimeline(source, input.clips);
    } catch (error) {
      throw new DomainError(
        'INVALID_EDIT',
        error instanceof Error ? error.message : '剪辑范围无效',
        422,
      );
    }
    return this.store.save(
      {
        ...p,
        revision: p.revision + 1,
        stage: 'ready',
        failure: undefined,
        error: undefined,
        failedAction: undefined,
        edit: {
          source,
          clips: timeline.clips,
          subtitles: timeline.subtitles,
        },
      },
      p.revision,
    );
  }
  async act(id: string, input: unknown) {
    const a = productionActionSchema.parse(input),
      current = await this.current(id, a.revision);
    let p = current;
    let type: FilmJobType | undefined, stage: ProductionStage | undefined;
    if (a.action === 'accept-duration') {
      const measuredMs = p.durationState?.measuredMs ?? p.durationMs;
      if (
        !needsDurationDecision(p) ||
        !measuredMs ||
        !p.artifacts.audio ||
        !p.scenes.length ||
        !Number.isFinite(measuredMs) ||
        measuredMs <= 0 ||
        p.scenes.some(
          (s) =>
            !s.cues.length ||
            s.cues.some(
              (c) =>
                !Number.isFinite(c.startMs) ||
                !Number.isFinite(c.endMs) ||
                c.startMs! < 0 ||
                c.endMs! <= c.startMs! ||
                c.endMs! > measuredMs,
            ),
        )
      )
        throw new DomainError(
          'INVALID_STAGE',
          '仅能接受等待确认的真实配音时长',
        );
      await this.needModel();
      const minMs = Math.round(measuredMs * 0.9);
      const maxMs = Math.round(measuredMs * 1.1);
      p = await this.store.save(
        {
          ...p,
          revision: p.revision + 1,
          stage: 'ready',
          failure: undefined,
          error: undefined,
          failedAction: undefined,
          durationState: {
            ...p.durationState!,
            status: 'accepted',
            targetMs: measuredMs,
            minMs,
            maxMs,
            measuredMs,
            policy: 'accepted-source',
          },
        },
        p.revision,
      );
      type = 'illustrate';
      stage = 'illustrating';
    } else if (a.action === 'accept') {
      const scene = p.scenes.find((s) => s.id === a.sceneId);
      if (
        !scene?.review ||
        scene.review.status !== 'needs_attention' ||
        !p.artifacts.preview ||
        scene.review.issues.some(
          (i) => i.kind === 'runtime' && i.severity === 'error',
        )
      )
        throw new DomainError(
          'INVALID_STAGE',
          '仅能接受可预览且等待确认的画面',
        );
      return this.store.save(
        {
          ...p,
          revision: p.revision + 1,
          scenes: p.scenes.map((s) =>
            s.id === a.sceneId
              ? { ...s, review: { ...s.review!, status: 'accepted' } }
              : s,
          ),
        },
        p.revision,
      );
    }
    if (a.action === 'accept-duration') {
      // The validated branch above already persisted the explicit policy and
      // selected illustration as the resume action.
    } else if (a.action === 'plan') {
      await this.needModel();
      type = 'plan';
      stage = 'planning';
      if (
        a.feedback &&
        (p.brief.topic + '\n分镜修改意见：' + a.feedback).length > 4000
      )
        throw new DomainError(
          'INVALID_UPDATE',
          '主题与修改意见合计不能超过 4000 字，请缩短后重试',
        );
      if (a.feedback)
        p.brief = {
          ...p.brief,
          topic: p.brief.topic + '\n分镜修改意见：' + a.feedback,
        };
      // Feedback is persisted before claiming and changes the revision as an ordinary edit.
      if (a.feedback) {
        p.revision++;
        await this.store.save(p, a.revision);
      }
    } else if (a.action === 'approve') {
      if (
        !p.storyboard ||
        !(p.stage === 'approval' || (p.stage === 'failed' && !p.scenes.length))
      )
        throw new DomainError('INVALID_STAGE', '请先生成并确认分镜');
      await this.needModel();
      await this.needVoice(p);
      type = 'produce';
      stage = 'scripting';
    } else if (a.action === 'produce') {
      if (
        !p.scenes.length ||
        !['failed', 'ready', 'narrating', 'illustrating', 'composing'].includes(
          p.stage,
        )
      )
        throw new DomainError('INVALID_STAGE', '请先批准分镜，自动生成口播');
      if (!(
        p.stage === 'failed' &&
        p.failedAction === 'produce' &&
        p.artifacts.audio
      ))
        await this.needVoice(p);
      if (p.scenes.some((s) => !s.artwork)) await this.needModel();
      type = 'produce';
      stage = 'narrating';
    } else if (['illustrate', 'review', 'repair'].includes(a.action)) {
      if (a.sceneId && !p.scenes.some((s) => s.id === a.sceneId))
        throw new DomainError('INVALID_SCENE', '要重画的分镜页不存在');
      if (
        !p.scenes.length ||
        !p.artifacts.audio ||
        !p.durationMs ||
        p.scenes.some((s) =>
          s.cues.some((c) => c.startMs === undefined || c.endMs === undefined),
        )
      )
        throw new DomainError('INVALID_STAGE', '请先完成配音，再单独绘图');
      if (a.action !== 'review') await this.needModel();
      if (
        a.action !== 'illustrate' &&
        !p.scenes.find((s) => s.id === a.sceneId)?.artwork
      )
        throw new DomainError('INVALID_STAGE', '请先绘制当前页');
      if (
        a.action === 'repair' &&
        !p.scenes.find((s) => s.id === a.sceneId)?.review?.issues.length
      )
        throw new DomainError('INVALID_STAGE', '请先审片，再按问题修正当前页');
      type = 'illustrate';
      stage = 'illustrating';
    } else if (a.action === 'edit-export') {
      if (
        p.scenes.some(
          (s) =>
            s.review &&
            ['needs_attention', 'failed', 'checking', 'repairing'].includes(
              s.review.status,
            ),
        )
      )
        throw new DomainError(
          'REVIEW_REQUIRED',
          '请先修正或明确接受待确认的画面，再导出',
        );
      if (
        !p.edit ||
        !isEditCurrent(p) ||
        !p.artifacts.video ||
        !(
          p.stage === 'ready' ||
          (p.stage === 'failed' && p.failedAction === 'edit-export')
        )
      )
        throw new DomainError(
          'INVALID_STAGE',
          '剪辑已过期，请重新保存剪辑后再导出',
        );
      type = 'edit-export';
      stage = 'rendering';
    } else {
      if (
        p.scenes.some(
          (s) =>
            s.review &&
            ['needs_attention', 'failed', 'checking', 'repairing'].includes(
              s.review.status,
            ),
        )
      )
        throw new DomainError(
          'REVIEW_REQUIRED',
          '请先修正或明确接受待确认的画面，再导出',
        );
      if (
        !(
          p.stage === 'ready' ||
          (p.stage === 'failed' && p.failedAction === 'export')
        ) ||
        !p.artifacts.preview ||
        !p.artifacts.audio
      )
        throw new DomainError('INVALID_STAGE', '请先完成配音和画面制作');
      type = 'export';
      stage = 'rendering';
    }
    if (!type || !stage)
      throw new DomainError('INVALID_ACTION', '不支持的制作操作');
    await this.needRuntime(
      type === 'export'
        ? ['database', 'queue', 'browser', 'ffmpeg']
        : type === 'edit-export'
          ? ['database', 'queue', 'ffmpeg']
          : type === 'produce' || type === 'illustrate'
            ? ['database', 'queue', 'browser']
            : ['database', 'queue'],
    );
    await this.queue.health();
    const claimed = await this.store.claim(
      id,
      p.revision,
      stage,
      type,
      type === 'illustrate'
        ? {
            restartIllustration: a.restart,
            illustrationSceneId: a.sceneId,
            ...(['review', 'repair'].includes(a.action)
              ? { reviewMode: a.action as 'review' | 'repair' }
              : {}),
          }
        : undefined,
    );
    try {
      await this.queue.enqueue(claimed.job.id);
    } catch {
      await this.store.failSubmission(id, claimed.job.id);
      throw new DomainError(
        'QUEUE_UNAVAILABLE',
        '任务提交失败，请检查 Redis 后重试',
        503,
      );
    }
    return claimed.production;
  }
  async getCapabilities(): Promise<ProductionCapabilities> {
    return typeof this.capabilities === 'function'
      ? this.capabilities()
      : this.capabilities;
  }
  private async needModel() {
    if (!(await this.getCapabilities()).model.configured)
      throw new DomainError(
        'MODEL_NOT_CONFIGURED',
        '尚未配置导演模型：请前往设置页配置',
        422,
      );
  }
  private async needVoice(p: Production) {
    if (!(await this.getCapabilities()).voices[p.brief.voiceProvider])
      throw new DomainError(
        'VOICE_NOT_CONFIGURED',
        p.brief.voiceProvider === 'volcengine'
          ? '火山 TTS 未配置：请前往设置页配置'
          : '配音服务未配置：请前往设置页配置',
        422,
      );
  }
  private async needRuntime(
    components: ('database' | 'queue' | 'browser' | 'ffmpeg')[],
  ) {
    const runtime = (await this.getCapabilities()).runtime;
    if (!runtime) return;
    const labels = {
      database: '数据库',
      queue: '任务队列',
      browser: 'Chrome 渲染浏览器',
      ffmpeg: 'FFmpeg 媒体处理器',
    };
    for (const component of components) {
      const status = runtime[component];
      if (!status.ready)
        throw new DomainError(
          status.code ?? `RUNTIME_${component.toUpperCase()}_UNAVAILABLE`,
          `${labels[component]}不可用，请修复运行环境后重试`,
          503,
        );
    }
  }
}
