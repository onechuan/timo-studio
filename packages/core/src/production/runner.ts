import type {
  Job,
  Production,
  ProductionFailure,
  ProductionPhase,
} from '@timotv/contracts';
import {
  ProductionFailureError,
  toProductionFailure,
  type ProductionFailureFallback,
} from './failure.js';
export interface ProductionRunStore {
  load(id: string): Promise<{ job: Job; production: Production } | null>;
  start(p: Production, id: string): Promise<void>;
  checkpoint(p: Production, id: string, progress: number): Promise<void>;
  complete(p: Production, id: string): Promise<void>;
  fail(
    p: Production,
    id: string,
    action: Job['type'],
    failure: ProductionFailure,
  ): Promise<void>;
}
export type ProductionOperation = (
  p: Production,
  signal: AbortSignal,
) => Promise<Production>;
export interface ProductionOperations {
  plan: ProductionOperation;
  script: ProductionOperation;
  narrate: ProductionOperation;
  planFilmKit?: ProductionOperation;
  generateFilmKitPart?: (
    p: Production,
    name: string,
    signal: AbortSignal,
  ) => Promise<Production>;
  reviewFilmKit?: (
    p: Production,
    signal: AbortSignal,
    checkpoint?: (p: Production) => Promise<void>,
  ) => Promise<Production>;
  reviewWholeFilm?: (
    p: Production,
    signal: AbortSignal,
    checkpoint?: (p: Production) => Promise<void>,
  ) => Promise<Production>;
  illustrateScene: (
    p: Production,
    index: number,
    signal: AbortSignal,
  ) => Promise<Production>;
  compose: ProductionOperation;
  render: ProductionOperation;
  reviseDuration?: (
    p: Production,
    targetMs: number,
    signal: AbortSignal,
  ) => Promise<Production>;
  reviewScene?: (
    p: Production,
    index: number,
    signal: AbortSignal,
    checkpoint?: (p: Production) => Promise<void>,
  ) => Promise<Production>;
  repairScene?: (
    p: Production,
    index: number,
    signal: AbortSignal,
    feedback?: string,
  ) => Promise<Production>;
}
export function createProductionRunner(
  store: ProductionRunStore,
  createOperations: (
    production: Production,
  ) => Promise<ProductionOperations> | ProductionOperations,
  mapFailure: (
    error: unknown,
    fallback: ProductionFailureFallback,
  ) => ProductionFailure | string,
) {
  return async (id: string) => {
    let run: Awaited<ReturnType<ProductionRunStore['load']>>;
    try {
      run = await store.load(id);
    } catch (error) {
      const fallback = { phase: 'storage' as const };
      const mapped =
        error instanceof ProductionFailureError
          ? error.failure
          : mapFailure(error, fallback);
      const failure =
        typeof mapped === 'string'
          ? toProductionFailure(error, { ...fallback, publicMessage: mapped })
          : mapped;
      throw ProductionFailureError.from(failure, { cause: error });
    }
    if (
      !run ||
      ['succeeded', 'failed', 'cancelled'].includes(run.job.status) ||
      run.production.jobId !== id
    )
      return;
    let p = run.production;
    let checkingIndex: number | undefined;
    let activeSceneId: string | undefined;
    let phase: ProductionPhase =
      run.job.type === 'plan'
        ? 'planning'
        : run.job.type === 'export'
          ? 'rendering'
          : p.scenes.length
            ? 'illustrating'
            : 'scripting';
    try {
      await store.start(p, id);
      const signal = AbortSignal.timeout(20 * 60 * 1000);
      const ops = await createOperations(p);
      const log = async (
        message: string,
        stage: Production['stage'],
        progress: number,
      ) => {
        p = {
          ...p,
          stage,
          events: [
            ...p.events,
            { at: new Date().toISOString(), message },
          ].slice(-150),
        };
        await store.checkpoint(p, id, progress);
      };
      if (run.job.type === 'plan') {
        phase = 'planning';
        await log('导演正在阅读主题和资料，规划分镜', 'planning', 10);
        p = await ops.plan(p, signal);
        await log('分镜已生成，等待你确认后再写口播和配音', 'approval', 95);
      } else if (run.job.type === 'produce' || run.job.type === 'illustrate') {
        if (!p.scenes.length) {
          phase = 'scripting';
          await log('分镜已确认，正在自动撰写口播', 'scripting', 10);
          p = await ops.script(p, signal);
          await log('口播已完成，开始逐句配音', 'narrating', 30);
        }
        if (run.job.type === 'produce' && !p.artifacts.audio) {
          phase = 'narrating';
          p = await ops.narrate(p, signal);
        }
        if (
          run.job.type === 'produce' &&
          p.durationMs !== undefined &&
          p.brief.durationSec >= 120 &&
          !(
            p.durationState?.status === 'accepted' &&
            p.durationState.policy === 'accepted-source' &&
            p.durationState.measuredMs === p.durationMs
          )
        ) {
          const targetMs = p.brief.durationSec * 1000;
          const minMs = Math.round(targetMs * 0.9);
          const maxMs = Math.round(targetMs * 1.1);
          let best = structuredClone(p);
          for (;;) {
            const measuredMs = p.durationMs!;
            const correctionRound = p.durationState?.correctionRound ?? 0;
            if (measuredMs >= minMs && measuredMs <= maxMs) {
              p = {
                ...p,
                durationState: {
                  targetMs,
                  minMs,
                  maxMs,
                  estimatedMs: p.durationState?.estimatedMs,
                  confidence: p.durationState?.confidence,
                  measuredMs,
                  correctionRound,
                  status: 'accepted',
                },
              };
              break;
            }
            if (p.brief.narrationMode === 'verbatim') {
              p = {
                ...p,
                durationState: {
                  targetMs,
                  minMs,
                  maxMs,
                  estimatedMs: p.durationState?.estimatedMs,
                  confidence: p.durationState?.confidence,
                  measuredMs,
                  correctionRound,
                  status: 'needs-input',
                },
              };
              await store.checkpoint(p, id, 38);
              throw new ProductionFailureError({
                code: 'DURATION_VERBATIM_NEEDS_INPUT',
                phase: 'narrating',
                retryable: false,
                publicMessage: `逐字原稿配音时长为 ${Math.round(measuredMs / 1000)} 秒，不在目标 ${Math.round(minMs / 1000)}–${Math.round(maxMs / 1000)} 秒内，请调整原稿或目标时长`,
              });
            }
            if (correctionRound >= 2 || !ops.reviseDuration) {
              p = {
                ...p,
                durationState: {
                  targetMs,
                  minMs,
                  maxMs,
                  estimatedMs: p.durationState?.estimatedMs,
                  confidence: p.durationState?.confidence,
                  measuredMs,
                  correctionRound,
                  status: 'needs-input',
                },
              };
              await store.checkpoint(p, id, 38);
              throw new ProductionFailureError({
                code: 'DURATION_CONTENT_INSUFFICIENT',
                phase: 'narrating',
                retryable: false,
                publicMessage: `自动校正 ${correctionRound} 轮后，真实配音仍为 ${Math.round(measuredMs / 1000)} 秒，目标为 ${Math.round(targetMs / 1000)} 秒。配音已保留，可接受当前时长继续制作，或修改口播、资料及目标时长`,
              });
            }
            p = {
              ...p,
              durationState: {
                targetMs,
                minMs,
                maxMs,
                estimatedMs: p.durationState?.estimatedMs,
                confidence: p.durationState?.confidence,
                measuredMs,
                correctionRound: correctionRound + 1,
                status: 'correcting',
              },
            };
            await store.checkpoint(p, id, 38);
            phase = 'scripting';
            p = await ops.reviseDuration(p, targetMs, signal);
            await store.checkpoint(p, id, 39);
            phase = 'narrating';
            // A rejected rewrite retains the measured audio; don't synthesize it again.
            if (!p.artifacts.audio) p = await ops.narrate(p, signal);
            if (
              Math.abs(p.durationMs! - targetMs) <
              Math.abs(best.durationMs! - targetMs)
            ) {
              best = structuredClone(p);
            } else {
              p = {
                ...best,
                usage: p.usage,
                events: p.events,
                durationState: {
                  ...p.durationState!,
                  estimatedMs: best.durationState?.estimatedMs,
                  measuredMs: best.durationMs,
                  correctionRound: correctionRound + 1,
                },
              };
            }
          }
        }
        if (ops.planFilmKit && !p.visual?.filmKit) {
          phase = 'illustrating';
          await log('正在规划跨页复用的影片组件', 'illustrating', 41);
          p = await ops.planFilmKit(p, signal);
          await store.checkpoint(p, id, 44);
        }
        if (ops.generateFilmKitPart && p.visual?.filmKit) {
          const pending = p.visual.filmKit.components
            .filter((component) =>
              ['planned', 'generating'].includes(component.status),
            )
            .map((component) => component.name);
          for (let index = 0; index < pending.length; index++) {
            const name = pending[index]!;
            phase = 'illustrating';
            await log(
              `正在生成影片复用组件 ${index + 1}/${pending.length}`,
              'illustrating',
              45,
            );
            try {
              p = await ops.generateFilmKitPart(p, name, signal);
            } catch (error) {
              if (signal.aborted) throw error;
              const kit = p.visual?.filmKit;
              if (kit) {
                const components = kit.components.map((component) =>
                  component.name === name
                    ? {
                        ...component,
                        status: 'failed' as const,
                        error: '组件生成失败，已改用逐页绘制',
                      }
                    : component,
                );
                const usable = components.filter(
                  (component) =>
                    component.source && component.status !== 'failed',
                );
                p = {
                  ...p,
                  visual: {
                    ...p.visual!,
                    filmKit: {
                      ...kit,
                      status: usable.length ? 'generating' : 'failed',
                      components,
                      error: '部分影片组件生成失败，已自动降级',
                    },
                  },
                };
              }
            }
            await store.checkpoint(p, id, 46);
          }
        }
        if (
          ops.reviewFilmKit &&
          p.visual?.filmKit?.status === 'checking' &&
          p.visual.filmKit.source
        ) {
          phase = 'reviewing';
          await log('正在独立检查影片复用组件', 'illustrating', 47);
          try {
            p = await ops.reviewFilmKit(p, signal, async (next) => {
              p = next;
              await store.checkpoint(p, id, 48);
            });
          } catch (error) {
            if (signal.aborted) throw error;
            const kit = p.visual?.filmKit;
            if (kit)
              p = {
                ...p,
                visual: {
                  ...p.visual!,
                  filmKit: {
                    ...kit,
                    status: 'failed',
                    source: undefined,
                    sourceHash: undefined,
                    components: kit.components.map((component) => ({
                      ...component,
                      status:
                        component.status === 'passed'
                          ? component.status
                          : ('failed' as const),
                      error:
                        component.status === 'passed'
                          ? component.error
                          : '组件检查失败，已改用逐页绘制',
                    })),
                    error: '影片组件检查失败，已自动降级',
                  },
                },
              };
          }
          await store.checkpoint(p, id, 49);
        }
        phase = 'illustrating';
        await log('真实口播时间已就绪，开始逐页绘图', 'illustrating', 55);
        for (let index = 0; index < p.scenes.length; index++) {
          if (p.reviewTask && p.reviewTask.sceneId !== p.scenes[index].id)
            continue;
          activeSceneId = p.scenes[index].id;
          if (!p.scenes[index].artwork) {
            // The previous page's review leaves phase='reviewing'; drawing
            // failures must resume as illustration, not as another review.
            phase = 'illustrating';
            p = await ops.illustrateScene(p, index, signal);
          }
          await log(
            `第 ${index + 1}/${p.scenes.length} 页绘图已完成`,
            'illustrating',
            55 + Math.round((30 * (index + 1)) / p.scenes.length),
          );
          if (ops.reviewScene) {
            checkingIndex = index;
            const setReview = (
              patch: Partial<
                NonNullable<Production['scenes'][number]['review']>
              >,
            ) => {
              p = {
                ...p,
                scenes: p.scenes.map((s, i) =>
                  i !== index
                    ? s
                    : {
                        ...s,
                        review: {
                          fingerprint: '',
                          status: 'checking',
                          round: 0,
                          mode: 'layout',
                          frames: [],
                          issues: [],
                          omittedCueIds: [],
                          ...s.review,
                          ...patch,
                        },
                      },
                ),
              };
            };
            if (!p.scenes[index].review) setReview({});
            if (p.scenes[index].review?.status === 'failed')
              setReview({
                status: p.scenes[index].review?.resume ?? 'checking',
                error: undefined,
              });
            for (;;) {
              if (p.scenes[index].review?.status === 'repairing') {
                phase = 'illustrating';
                if (!ops.repairScene) throw new Error('画面修正服务不可用');
                // Persist the budget reservation before an external call. Resume this phase after interruption.
                await log(
                  `正在修正第 ${index + 1} 页画面（第 ${p.scenes[index].review!.round} 轮）`,
                  'illustrating',
                  80,
                );
                const oldArtwork = JSON.stringify(p.scenes[index].artwork);
                p = await ops.repairScene(p, index, signal);
                if (JSON.stringify(p.scenes[index].artwork) !== oldArtwork)
                  p = {
                    ...p,
                    artifacts: {
                      audio: p.artifacts.audio,
                      subtitles: p.artifacts.subtitles,
                    },
                  };
                setReview({
                  status: 'checking',
                  fingerprint: '',
                  frames: [],
                  error: undefined,
                  resume: undefined,
                });
                await log(`第 ${index + 1} 页修正已保存`, 'illustrating', 81);
              }
              phase = 'reviewing';
              await log(`正在检查第 ${index + 1} 页关键帧`, 'illustrating', 82);
              p = await ops.reviewScene(p, index, signal, async (next) => {
                p = next;
                await store.checkpoint(p, id, 83);
              });
              await log(`第 ${index + 1} 页检查结果已保存`, 'illustrating', 84);
              const report = p.scenes[index].review;
              if (
                report?.status !== 'needs_attention' ||
                report.round >= 2 ||
                !ops.repairScene ||
                p.reviewTask?.mode === 'review'
              )
                break;
              setReview({ status: 'repairing', round: report.round + 1 });
            }
            if (
              p.scenes[index].review?.issues.some(
                (i) =>
                  ['runtime', 'layout'].includes(i.kind) &&
                  i.severity === 'error',
              )
            )
              throw new Error('画面无法渲染，请重绘问题页');
            checkingIndex = undefined;
          }
        }
        if (ops.reviewWholeFilm && p.visual) {
          for (;;) {
            phase = 'reviewing';
            await log('正在检查整片跨页一致性与节奏', 'illustrating', 86);
            p = await ops.reviewWholeFilm(p, signal, async (next) => {
              p = next;
              await store.checkpoint(p, id, 87);
            });
            const report = p.visual?.wholeFilmReview;
            if (
              !report ||
              ['passed', 'accepted', 'unreviewed'].includes(report.status) ||
              report.status !== 'needs_attention' ||
              report.round >= 2 ||
              !ops.repairScene ||
              !ops.reviewScene
            )
              break;

            p = {
              ...p,
              visual: {
                ...p.visual!,
                wholeFilmReview: {
                  ...report,
                  status: 'repairing',
                  round: report.round + 1,
                },
              },
            };
            await store.checkpoint(p, id, 88);
            const affected = [
              ...new Set(report.issues.flatMap((issue) => issue.sceneIds)),
            ];
            for (const sceneId of affected) {
              const index = p.scenes.findIndex((scene) => scene.id === sceneId);
              if (index < 0) throw new Error('WHOLE_FILM_REPAIR_FAILED');
              activeSceneId = sceneId;
              const feedback = JSON.stringify(
                report.issues.filter((issue) =>
                  issue.sceneIds.includes(sceneId),
                ),
              );
              phase = 'illustrating';
              try {
                p = await ops.repairScene(p, index, signal, feedback);
              } catch (error) {
                if (signal.aborted) throw error;
                throw new Error('WHOLE_FILM_REPAIR_FAILED', { cause: error });
              }
              p = {
                ...p,
                artifacts: {
                  audio: p.artifacts.audio,
                  subtitles: p.artifacts.subtitles,
                },
                scenes: p.scenes.map((scene, sceneIndex) =>
                  sceneIndex === index && scene.review
                    ? {
                        ...scene,
                        review: {
                          ...scene.review,
                          fingerprint: '',
                          status: 'checking',
                          frames: [],
                          issues: [],
                          error: undefined,
                          resume: undefined,
                        },
                      }
                    : scene,
                ),
              };
              await store.checkpoint(p, id, 89);
              phase = 'reviewing';
              p = await ops.reviewScene(p, index, signal, async (next) => {
                p = next;
                await store.checkpoint(p, id, 89);
              });
            }
            activeSceneId = undefined;
            await store.checkpoint(p, id, 90);
          }
        }
        activeSceneId = undefined;
        phase = 'composing';
        await log(
          '配音与真实句级时间已生成，正在制作同步画面',
          'composing',
          88,
        );
        p = await ops.compose(p, signal);
        p = { ...p, reviewTask: undefined };
        await log('画面与口播已就绪，可以预览或导出', 'ready', 95);
      } else if (run.job.type === 'export') {
        phase = 'rendering';
        await log('正在按当前版本逐帧渲染视频', 'rendering', 10);
        p = await ops.render(p, signal);
        await log('视频已导出，可以下载 MP4 和字幕', 'ready', 95);
      } else throw new Error('未知制作任务');
      await store.complete(p, id);
    } catch (error) {
      const fallback: ProductionFailureFallback = {
        phase,
        context: activeSceneId ? { sceneId: activeSceneId } : undefined,
      };
      const mapped =
        error instanceof ProductionFailureError
          ? error.failure
          : mapFailure(error, fallback);
      const failure =
        typeof mapped === 'string'
          ? toProductionFailure(error, { ...fallback, publicMessage: mapped })
          : mapped;
      const message = failure.publicMessage;
      if (checkingIndex !== undefined)
        p = {
          ...p,
          scenes: p.scenes.map((s, i) => {
            if (i !== checkingIndex || !s.review) return s;
            return {
              ...s,
              review: {
                ...s.review,
                status: 'failed',
                error: message,
                resume:
                  s.review.status === 'repairing' ? 'repairing' : 'checking',
              },
            };
          }),
        };
      p = { ...p, failure, error: message };
      try {
        await store.fail(p, id, run.job.type, failure);
      } catch {
        /* Preserve the safe public error if persistence is unavailable. */
      }
      throw ProductionFailureError.from(failure, { cause: error });
    }
  };
}
