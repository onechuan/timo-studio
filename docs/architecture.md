# 架构与约束

## 模块边界

- apps/web：React/Vite，HTTP API 唯一业务入口；仅 type import 共享 contracts。
- apps/api：Hono 请求校验、调用 core 用例、响应。bootstrap 组装 Prisma Repository / BullMQ Queue。
- apps/worker：独立 Node 进程，bootstrap 创建消费者，handlers 执行诊断并写回 Job。
- packages/contracts：纯 TypeScript / Zod，共享 Project、Asset、Timeline、Storyboard、Job、事件。无 Node、数据库、UI 依赖。
- packages/core：项目用例、素材归属与范围校验、ports；不依赖基础设施。
- packages/db：Prisma Repository，显式映射日期、枚举和 JSON 到 API 类型，不直接返回 ORM 对象。
- packages/storage：本地 ObjectStorage 适配器，服务端生成 storageKey，拒绝越界路径；尚未暴露上传路由。存储目录须由服务独占，禁止放入外部符号链接。
- packages/queue：BullMQ 提交与消费适配器。API 只提交，Worker 只执行。
- packages/media / renderer：MediaProcessor / Renderer 接口，尚未调用 FFmpeg。
- packages/agent：AgentRuntime / BusinessTool 接口，后续 Pi 仅能使用受控项目工具，禁止任意访问数据库。
- packages/speech：独立 TTSProvider / ASRProvider，服务端凭据，不打包到浏览器。

尚未实现的 features/creation、assets、editor、narration、subtitles、exports，以及 agent director/tools/prompts，不制造空文件；实现时再建立目录。桌面 App 将复用 contracts/core，通过本地 API 或适配器承载业务，不复用网页服务端实现到浏览器。

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
