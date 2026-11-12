# TimoTV 项目知识库

`docs/` 是项目文档的唯一入口。本页说明该读什么、哪些是持续维护的现行文档、哪些是只读的历史记录。

## 推荐阅读路径

| 目标               | 阅读顺序                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 第一次了解项目     | [根 README](../README.md) → [架构说明](architecture.md) → [开发指南](development.md)                                                  |
| 了解当前进度与证据 | [验证记录](verification.md) → [路线图](roadmap.md)                                                                                    |
| 理解绘图引擎       | [V3 集成说明](verification/drawing-engine-v3-integration.md) → [引擎修改清单](DRAWING_ENGINE_CHANGES.md)                              |
| 接手后续开发       | [Agent 交接计划](superpowers/plans/2026-11-12-topic-to-video-agent-handoff.md)：第 8 节仍是待办任务，其余章节按文首状态说明保留为历史 |
| 确认许可与来源     | [开源说明](OPEN_SOURCE.md) → [第三方声明](../THIRD_PARTY_NOTICES.md)                                                                  |

## 现行文档

现行文档随代码更新，内容应始终与仓库当前状态一致。

| 文档                                                         | 内容                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| [根 README](../README.md)                                    | 产品概览、运行方式、常用命令、目录结构、开源许可        |
| [架构说明](architecture.md)                                  | 分层、数据流、包边界、当前能力边界与扩展顺序            |
| [开发指南](development.md)                                   | 本地环境、数据库与 Redis、模型/配音配置、测试与触发方式 |
| [验证记录](verification.md)                                  | 按时间追加的验证结果、已覆盖范围和证据边界              |
| [V3 集成说明](verification/drawing-engine-v3-integration.md) | 内置绘图引擎的链路、兼容性和集成验证范围                |
| [路线图](roadmap.md)                                         | 发布状态、受控开关和后续工作                            |
| [引擎修改清单](DRAWING_ENGINE_CHANGES.md)                    | 内置引擎相对 Frametell 0.8.0 基线的已审阅修改           |
| [开源说明](OPEN_SOURCE.md)                                   | AGPL-3.0 溯源、源码获取义务、构建不依赖上游 checkout    |
| [第三方声明](../THIRD_PARTY_NOTICES.md)                      | Frametell 及其依赖的版权与许可声明                      |

## 术语与改名记录

| 旧名称                                         | 当前名称                                               | 说明                                                                  |
| ---------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| `frametell-parity`                             | `drawing-engine-v3`                                    | 旧版本持久化的值在读取时归一化为 `legacy-v3`                          |
| `TIMOTV_FRAMETELL_PARITY=1\|0`                 | `TIMOTV_VIDEO_PIPELINE=drawing-engine-v3\|legacy-v3`   | 不再接受 `1`/`0`                                                      |
| `pnpm engine:audit`、`pnpm engine:sync`        | 无                                                     | 引擎源码内置于 `packages/drawing-engine`，不再同步上游                |
| `pnpm benchmark:video-parity`                  | 无                                                     | 基准工具已移除；发布前改为真实素材人工验收                            |
| `docs/UPSTREAM_PATCHES.md`                     | [DRAWING_ENGINE_CHANGES.md](DRAWING_ENGINE_CHANGES.md) | 上游补丁记录改为本地修改清单                                          |
| `docs/verification/drawing-engine-baseline.md` | 已删除                                                 | 内容并入 [V3 集成说明](verification/drawing-engine-v3-integration.md) |

## 历史设计与计划（只读）

`docs/superpowers/` 下的文档是带日期的设计与实施快照，用于回溯决策过程，不随代码更新。

- 历史文档可能提到已移除的同步/审计脚本、基准工具、旧管线名 `frametell-parity` 或旧的“帧言”品牌文案，这些内容不代表当前状态。
- 当前行为以“现行文档”和代码为准；除修正笔误外，不要回写历史文档。
- 需要更正过时内容时，在文档顶部补充状态说明，而不是改写正文。

### 设计稿 `superpowers/specs/`

| 日期       | 文档                                                                                                                           | 主题                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| 2026-11-08 | [animation-visual-review-design](superpowers/specs/2026-11-08-animation-visual-review-design.md)                               | 连续动画与视觉审片                     |
| 2026-11-08 | [frametell-skills-design](superpowers/specs/2026-11-08-frametell-skills-design.md)                                             | 内置创作 Skills 的组织方式             |
| 2026-11-08 | [frametell-skills-evaluation](superpowers/specs/2026-11-08-frametell-skills-evaluation.md)                                     | Skills 规则的离线验证                  |
| 2026-11-08 | [frametell-ui-design](superpowers/specs/2026-11-08-frametell-ui-design.md)                                                     | Studio UI 设计                         |
| 2026-11-08 | [page-artwork-design](superpowers/specs/2026-11-08-page-artwork-design.md)                                                     | 逐页绘图升级                           |
| 2026-11-08 | [player-ui-design](superpowers/specs/2026-11-08-player-ui-design.md)                                                           | 视频预览播放器                         |
| 2026-11-08 | [production-architecture-design](superpowers/specs/2026-11-08-production-architecture-design.md)                               | 制作编排架构                           |
| 2026-11-08 | [prompt-adaptation-design](superpowers/specs/2026-11-08-prompt-adaptation-design.md)                                           | 创作方法适配记录                       |
| 2026-11-08 | [settings-voices-design](superpowers/specs/2026-11-08-settings-voices-design.md)                                               | 设置页与火山音色                       |
| 2026-11-10 | [frametell-dsl-engine-design](superpowers/specs/2026-11-10-frametell-dsl-engine-design.md)                                     | 可编程绘画 DSL 与视频引擎              |
| 2026-11-10 | [production-runtime-errors-and-duration-design](superpowers/specs/2026-11-10-production-runtime-errors-and-duration-design.md) | 统一运行边界、错误诊断与成片时长闭环   |
| 2026-11-11 | [frametell-video-effect-parity-design](superpowers/specs/2026-11-11-frametell-video-effect-parity-design.md)                   | 与帧言视频效果对齐（后续改为内置引擎） |

### 实施计划 `superpowers/plans/`

| 日期       | 文档                                                                                               | 主题                                 |
| ---------- | -------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 2026-11-08 | [animation-visual-review](superpowers/plans/2026-11-08-animation-visual-review.md)                 | 连续动画与视觉审片                   |
| 2026-11-08 | [frametell-ui](superpowers/plans/2026-11-08-frametell-ui.md)                                       | Studio UI                            |
| 2026-11-08 | [production-architecture](superpowers/plans/2026-11-08-production-architecture.md)                 | 制作架构                             |
| 2026-11-08 | [prompt-adaptation](superpowers/plans/2026-11-08-prompt-adaptation.md)                             | 创作提示词优化                       |
| 2026-11-08 | [settings-voices](superpowers/plans/2026-11-08-settings-voices.md)                                 | 设置与音色                           |
| 2026-11-08 | [topic-to-video](superpowers/plans/2026-11-08-topic-to-video.md)                                   | 主题生成视频                         |
| 2026-11-09 | [brand-visuals](superpowers/plans/2026-11-09-brand-visuals.md)                                     | 品牌手绘画面重做                     |
| 2026-11-09 | [structured-artwork-output](superpowers/plans/2026-11-09-structured-artwork-output.md)             | 结构化绘图输出                       |
| 2026-11-10 | [drawing-engine-baseline](superpowers/plans/2026-11-10-drawing-engine-baseline.md)                 | 绘图引擎基线                         |
| 2026-11-10 | [drawing-engine-v3-integration](superpowers/plans/2026-11-10-drawing-engine-v3-integration.md)     | 绘图引擎 V3 集成                     |
| 2026-11-10 | [production-reliability-duration](superpowers/plans/2026-11-10-production-reliability-duration.md) | 生产可靠性与时长闭环                 |
| 2026-11-11 | [duration-recovery](superpowers/plans/2026-11-11-duration-recovery.md)                             | 配音时长校正与恢复                   |
| 2026-11-11 | [frametell-video-effect-parity](superpowers/plans/2026-11-11-frametell-video-effect-parity.md)     | 视频效果对齐（上游同步与基准已移除） |
| 2026-11-12 | [topic-to-video-agent-handoff](superpowers/plans/2026-11-12-topic-to-video-agent-handoff.md)       | Agent 交接（第 8 节仍待实现）        |

## 维护约定

1. 现行文档直接修改；历史文档只追加状态说明，不改写正文。
2. 新设计放入 `superpowers/specs/YYYY-MM-DD-topic-design.md`，新计划放入 `superpowers/plans/YYYY-MM-DD-topic.md`。
3. 验证结果追加到 `verification.md`，注明日期、命令、结果和未覆盖范围；不要覆盖旧条目。
4. 文档中的命令、环境变量和配置默认值必须与 `package.json`、`.env.example` 和代码保持一致。
5. 发布状态或默认值变化时，同步更新 `README.md`、`roadmap.md`、`verification.md` 和本索引。
6. `docs/talks/` 是本地演讲物料，已在 `.gitignore` 中排除，不属于仓库知识库。
7. 新增、移动或删除文档后，更新本页的索引和术语表。
