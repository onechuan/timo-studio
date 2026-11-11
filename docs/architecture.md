# 架构与约束

本文说明当前主题到视频链路的模块边界、运行职责与安全约束。实现以 `contracts → core → adapters` 的依赖方向组织，API 负责受理，Worker 负责执行，PostgreSQL 与 Redis/BullMQ 分别承担持久化和异步投递。

## 模块边界

- apps/web：React/Vite，HTTP API 唯一业务入口；共享 contracts 类型与配置 schema，不导入服务器实现。
- apps/api：Hono 请求校验、调用 core 用例、响应。bootstrap 组装 Prisma Repository / BullMQ Queue。
- apps/worker：独立 Node 进程，bootstrap 创建消费者；制作 handler 组装运行存储、设置快照、Agent / Speech / Renderer，交由 core 编排。
- packages/contracts：纯 TypeScript / Zod，共享 Project、Asset、Timeline、Production、Storyboard、Job、事件。无 Node、数据库、UI 依赖。
- packages/core：项目用例、素材归属与范围校验、ProductionService、制作编排器和 ports；仅依赖 contracts，不依赖基础设施。
- packages/db：Prisma Repository、ProductionStore 与运行存储适配器；负责任务检查点、完成与失败事务，显式映射日期、枚举和 JSON 到 API 类型，不直接返回 ORM 对象。
- packages/storage：本地 ObjectStorage 适配器，服务端生成 storageKey，拒绝越界路径；尚未暴露上传路由。存储目录须由服务独占，禁止放入外部符号链接。
- packages/queue：BullMQ 提交与消费适配器。API 只提交，Worker 只执行。
- packages/media：保留媒体探测接口；packages/renderer：确定性 HTML/SVG 预览、真实时间校验、Chrome 截图与 FFmpeg 编码。
- packages/agent：Pi 驱动结构化分镜与脚本生成，只提供 submit 工具，不开放文件系统、shell 或数据库。
- packages/speech：火山 TTS、macOS 系统语音与 ElevenLabs 合成、项目级音频缓存、句级时间与 SRT；ASR 仍为接口。凭据不打包到浏览器。

当前 UI 按 projects / production / settings 组织；素材剪辑、独立字幕编辑等尚未实现的能力在落地时再增加目录。桌面 App 将复用 contracts/core，通过本地 API 或适配器承载业务，不复用网页服务端实现到浏览器。

## 时间轴

schemaVersion=1；所有编辑时间是非负安全整数毫秒，区间采用左闭右开 `[start,end)`。第一版为一个顺序视频轨（视频和图片片段可混合）、独立音频轨（允许重叠混音）及单一顺序字幕轨（不重叠）。视频轨可有空隙。

视频/音频片段：assetId、sourceInMs、sourceOutMs、timelineStartMs、volume（0–2）。图片片段：assetId、timelineStartMs、durationMs，拒绝伪造 sourceIn/Out。视频出点必须大于入点且不超过素材 durationMs，素材必须属于当前项目、类型匹配。字幕 endMs > startMs。片段 ID 全局唯一。fps 为 1–120 整数。

创建项目和合法空时间轴在同一 PostgreSQL 事务内完成。保存时间轴请求携带当前 revision，数据库 updateMany 条件包含 revision，并在事务内递增及更新项目修改时间；并发编辑只有一个能成功，其余返回 409。画幅由项目决定，本版不提供画幅变更。数据库 Asset durationMs 使用 Int，首版支持约 24 天以内素材；更长素材将迁移为 BigInt 并显式转换。

## HTTP API

| 方法  | 路径                          | 行为                                 |
| ----- | ----------------------------- | ------------------------------------ |
| GET   | /api/health                   | 检查 PostgreSQL 和 Redis，失败 503   |
| POST  | /api/projects                 | title/kind/aspectRatio，201 返回项目 |
| GET   | /api/projects                 | 按更新时间倒序，最多 200 项          |
| GET   | /api/projects/:id             | 获取项目，缺失 404                   |
| PATCH | /api/projects/:id             | 修改 title                           |
| GET   | /api/projects/:id/timeline    | 获取时间轴                           |
| PUT   | /api/projects/:id/timeline    | 完整提交及 revision CAS              |
| POST  | /api/projects/:id/diagnostics | 202 返回持久化 Job                   |
| GET   | /api/jobs/:id                 | 查询后台状态                         |

错误结构 `{error:{code,message,details?}}`。请求最大 1 MiB；Zod 校验 400，revision 冲突 409，依赖不可用 503。不回传驱动内部异常与凭据。API loopback-only，无身份认证，仅供本机开发；多人/公网使用前需要身份、项目授权、配额与限流。

## 后台任务

诊断仅验证项目与时间轴存在，不访问 AI、文件输出或第三方服务；唯一写操作是 Job 状态。状态 queued → running → succeeded / failed，progress 只记录真实开始（0）和完成（100），时间戳存 PostgreSQL。

先检查 Redis，再创建数据库 Job，随后以 Job UUID 作为 BullMQ jobId 提交。提交失败将 Job 标 failed 并返回 503。Worker 重复处理已成功/取消任务时直接返回。Redis AOF 持久化；BullMQ 保留最近各 100 个成功/失败队列记录，数据库记录保留。

限制：数据库与 Redis 提交不是跨系统事务，进程在写 Job 后、入队前崩溃可能留下 queued 记录；生产化前实现 transactional outbox、补偿扫描、持久化 stalled 最终失败事件及取消流程。本版没有自动伪造超时成功，也不提供取消 API。

## 主题生成制作链路

创作方向通过 `Production.brief.contentType` 保存：`general`（通用讲解）、`explainer`（科普口播）、`product`（产品介绍）。旧记录没有该字段时按 general 处理，无需数据库迁移。更换方向会清空旧分镜、口播和产物；旧记录补上 general 不会误判为内容变更。

Skill 采用代码指定方式：`contracts` 校验类型 → `agent/src/skills/index.ts` 从固定映射选择包内目录 → 加载当前阶段的 `skills/shared/` 方法、所选方向的 `SKILL.md` 和 `references/planning.md` 或 `references/script.md` → 追加到 PLANNER / SCRIPT 基础提示词 → Pi Agent 调用 submit → Zod 校验结构。基础提示词保留阶段职责和输出约束，Skill 补充写作方法与示例；写稿阶段同时接收原始 topic 和 materials，保留用户对句数、语气与原稿的要求。

这不是 Pi Coding Agent 的自动发现机制。Pi core 仍只暴露 submit；Skill 加载由宿主代码完成，不扫描用户全局目录、不接受外部路径、不提供 read/bash 工具。发布或复制 agent 包时须保留根目录的 `prompts/`、`skills/` 与 `dist/`，文件路径按模块位置解析，不依赖进程工作目录。

Production 与原剪辑 Timeline 独立，保存在带 revision 和 jobId 锁的数据库记录中。主题、文本资料、目标时长、风格、场景、口播句子、真实配音时间、产物引用和阶段事件均持久化。

流程为 draft → planning → approval；用户批准后 scripting → narrating → illustrating → composing → ready。导出是独立 rendering 任务，返回 ready 后提供 MP4。失败记录 failedAction，支持按原阶段重试。绘图逐页检查点持久化，重试保留已完成的页，`restart: true` 可放弃已有画面重新绘制；illustrate 独立任务复用已测量音频与字幕，不再次调用 TTS。

网站通过 GET/POST/PUT `/api/projects/:id/production` 读取、建立和编辑内容，POST `/api/projects/:id/production/actions` 发起 plan/approve/produce/export。`/api/production/capabilities` 返回不含密钥的配置状态。产物路由只读取该项目当前登记的文件，验证真实路径位于存储根目录内，并支持音视频 Range 请求。

播放器模板通过 `@timotv/renderer/preview` 纯子入口复用，API 不加载编码器或启动浏览器。读取当前预览 HTML 时，在产物归属、真实路径与文件存在检查之后，以当前制作稿生成最新播放器界面，使已有项目无需重做即可获得 UI 更新。音频文件及 Range 路由保持不变。导出模板显式关闭控件和音频元素，以 renderAt(t) 驱动画面，避免把播放按钮或控制条录入视频。

修改主题会使分镜与后续产物过期；修改口播会清除旧时间与产物，并让语义变化的页面画面失效；只改音色可以复用画面结构。配音按文本、实际音色、服务商与合成模型缓存，未变化的句子不重复合成。导出固定读取已有制作版本，临时编码成功后原子替换 MP4。

制作任务使用独立 `timotv-production` 队列。Worker 启动和定时扫描有持久化锁的 queued 任务，补交丢失的队列记录，并处理终止失败；运行中的任务由 BullMQ 锁与文档所有权约束，避免旧任务覆盖新编辑。现有诊断队列保持原行为。

本轮画面为受控 SVG 关系图动画，配音为真实句级时间；尚未接入自由生成页面代码、独立视觉模型验收、ASR 或真实视频素材剪辑。

## 本轮优化：借鉴帧言的职责分离

帧言参考图把 Studio、Director、Pi、Voice、Engine 分开。TimoTV 保留 API / Worker / PostgreSQL / Redis 的部署方式，将 Worker 中的阶段流程抽到 core，将事务抽到 db。包的拆分是依赖边界，不代表需要分别部署为微服务。

| 层                      | 职责                                                             | 明确不承担                               |
| ----------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| Web                     | 主题输入、分镜确认、编辑、预览、配置                             | 执行付费模型请求、持有可读回的服务端 Key |
| API + ProductionService | 请求校验、版本冲突、审批规则、申领任务和提交队列                 | 在 HTTP 请求里渲染视频                   |
| core 制作编排器         | 规划 / 写稿 / 配音 / 合成 / 导出的阶段顺序、检查点和安全失败路径 | 直接创建 Pi、访问 Prisma 或读取环境变量  |
| Worker 组装层           | 注入本机服务、一次设置快照、消费任务、队列恢复                   | 定义业务阶段分支、编写 Prisma 事务       |
| agent                   | 提示词、结构化输出校验、Pi 模型与工具循环                        | 决定数据库事务或直接写项目文件           |
| speech / renderer       | 真实音频和句级时间、受控画面、Chrome / FFmpeg 编码               | 拥有项目审批权                           |
| db / storage / queue    | 持久化、原子状态更新、私有配置与文件、异步投递                   | 生成业务内容                             |

### 核心目录

```text
apps/
├── web/src/features/
│   ├── projects/                  项目入口
│   ├── production/                导演工作台、预览、分镜与口播
│   └── settings/                  模型 / 配音配置、音色选择
├── api/src/
│   ├── bootstrap/                 组装业务服务与适配器
│   └── routes/                    HTTP 校验、产物访问
└── worker/src/
    ├── bootstrap/                 消费队列、启动恢复扫描
    └── handlers/production.ts     注入设置快照和执行能力
packages/
├── contracts/src/                 跨端数据契约与 schema
├── core/src/production/
│   ├── service.ts                 审批规则、版本校验、提交任务
│   └── runner.ts                  执行端口与制作阶段编排
├── agent/
│   ├── prompts/                   PLANNER / SCRIPT 提示词
│   └── src/                       结构校验、Pi 运行时适配
├── speech/src/                    火山等 TTS、缓存、句级时间与 SRT
├── renderer/src/                  SVG 预览、时间校验、视频编码
├── db/src/
│   ├── production.ts              内容仓库、任务申领与队列恢复
│   └── production-run.ts          运行检查点与终态事务
├── storage/src/                   私有配置与文件适配
└── queue/src/                     BullMQ 提交 / 消费适配
```

### 依赖与执行

`core → contracts`；`db → core 的存储端口`；Worker 将具体能力注入 core，运行时 core 调用这些端口。这里的“调用方向”和“源码依赖方向”不同：业务核心可以调用数据库能力而不导入 Prisma。

`ProductionService` 负责开始任务前的校验与锁；制作编排器负责已经领取任务的执行。规划任务在 `approval` 停止。用户批准后，制作任务自动写稿、配音和合成；已有口播时重做配音不再写稿。导出只渲染已有内容，不调用模型或 TTS。

运行存储通过 `projectId + revision + jobId` 校验所有权，将检查点和 Job 进度放入同一事务；完成时释放锁并更新 Job / Project。旧任务即使晚返回也不能覆盖新版本。失败保留已获得的制作内容，供现有重试流程使用；这不是任意步骤都可跳过的通用工作流引擎。配音仍依靠句级缓存复用未变化内容。

### 设置与音色

`GET /api/settings`、`PUT /api/settings` 提供公开配置与保存入口。私有 Key 只在 `.data/config/settings.json` 保存，文件权限 0600，原子替换；API 是唯一写入进程，Worker 每任务读取一次，运行中的任务保留原配置快照。浏览器只得到 `apiKeyConfigured`。手工 `.env` 是初始默认值，网页保存的设置优先。

`GET /api/settings/voices` 返回 27 个官方预置音色，`POST /api/settings/voices/preview` 由服务端使用保存的凭据试听。目录不是账号授权列表；用户仍可输入自定义音色 ID。设置读取和试听接口保留本机来源校验。

### 与帧言的差异和扩展顺序

1. 当前已实现：分镜审批、自动写稿、Pi 工具提交结果、火山配音、真实句级时间、确定性画面、预览与 MP4、后台恢复、设置页。
2. 下一步产品能力：丰富画面模板、素材接入与剪辑；保持结构化场景契约，避免一开始就让模型执行任意代码。
3. 连续动画与审片：version 2 场景对象支持分组、关键帧、组件状态和兼容路径形变；逐页截图、布局测量和独立图片模型组成有限修正闭环。未配置图片模型时明确标记未视觉审片。
4. App：增加桌面宿主，通过本地 API 复用当前服务；若需要嵌入式执行，可复用 core 并注入本地适配器。当前没有实现桌面应用。
5. 多人云端：先做身份、项目授权、密钥隔离、配额及取消语义，再评估分布式任务与存储；当前为单机单用户，文件设置不能作为多实例配置中心。

## 工作台界面清理

项目页面已移除旧「项目设置与诊断」面板，项目重命名放在顶部标题旁。前端不再读取或保存旧 Timeline，也不提交诊断任务；相关数据库记录和后台接口保留，供后续剪辑能力和开发排查使用。服务配置页继续提供模型与配音设置。素材剪辑类型当前显示未开放说明。

### 逐页画面

分镜选择 layout 并描述主体、关系、位置与变化。配音后 PAGE 提示词加载对应 visual-styles 风格语法，将 visual / beats 和真实 cues 转换为 scene.artwork。对象协议只允许插画组件、矩形、椭圆、路径、箭头、文字以及受控配色和转场；经过结构、边界、口播索引和文字空间校验，不执行任意模型脚本。绘图校验失败可修复一次。

Renderer 将 artwork 编译为 SVG 图层，renderAt(t) 根据真实句起点决定显示状态；预览和导出使用同一确定性画面。旧作品无 artwork 时使用兼容示意；用户可主动选择“绘制画面”升级。跨修订复用音频只允许同项目已存在修订的 audio.wav，预览使用相对路径引用该修订。结构校验不替代视觉审片，当前没有自动截图审片 Agent。

单页重绘通过 `illustrate` 动作的 `sceneId` 选择场景，服务验证场景存在，原子 claim 只清除该页 artwork；其他页面、音频和字幕保留。`sceneId` 与 `restart: true` 互斥。绘图额外校验文字与主体/文字的明显重叠，修复请求携带经过基础 schema 校验的草稿和具体对象问题，禁止将未经校验的原始输出反馈给模型。渲染器将文字置于注释层，并保证相对于画布背景的基本文字对比度。

## 连续动画与视觉审片

`contracts/artwork.ts` 定义兼容 v1 的 v2 场景：分组、层级、cueId 时间锚点和有限关键帧轨道。`renderer/motion.ts` 纯函数求值位置、缩放、旋转、颜色、透明度、组件状态/参数和同拓扑路径；`preview.ts` 将相同函数嵌入预览与导出，倒退 seek 不依赖播放历史。液位、节点和流动是可组合组件，不限定题材模板。

`renderer/review.ts` 对实际 HTML 在 Chrome 中截图，最多每页 24 张；`browser-measure.ts` 测量变换后的边界、文字裁切与标题/字幕安全区，并额外采样动作内部时刻。有意叠放仅作为建议；离散采样不能证明逐帧安全。报告记录未覆盖口播。

Worker 的 `sceneReviewer` 先保存截图检查点，再由独立 `VisionGenerator` 携带实际图片调用审片模型。报告绑定内容/时间/画幅/风格/引擎/模型配置指纹。导演负责修正，审片员只给问题；每页最多自动修正两轮。core runner 在修正前预约轮次，修正后保存候选，检查后保存结论；中断继续当前阶段，已经持久化的否定结论也复用。

页级 review / repair 复用 illustrate 队列类型，通过任务范围锁定目标页；无需新增数据库枚举。review-only 保留既有预览与 MP4，画面实际变化后才使旧产物失效。failed 重试保留截图、指纹、轮次和恢复阶段。接受可渲染但存在问题的页面后可继续导出；没有配置识图服务时为 unreviewed，不能显示视觉通过。所有保存仍受 revision / jobId 事务保护。

审片 PNG 通过项目当前登记文件白名单访问。设置的 reviewer 部分使用独立凭据与任务快照，不回退到导演 Key；手动图片探测只验证图片请求可被接收，不代表判断准确。
