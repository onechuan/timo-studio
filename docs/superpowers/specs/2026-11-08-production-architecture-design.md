# TimoTV 制作编排架构优化

用户要求参考帧言架构，优化当前项目。沿用当前模块化单体与独立 Worker，优先落地可复用业务边界。

## 对照与选择

帧言将 Studio、Director、Pi、Voice、Engine 分离。TimoTV 已有 contracts/core/agent/speech/renderer，但生产流程、模型创建、数据库事务集中在 Worker handler。

选用端口与适配器：core 中的 ProductionRunner 决定阶段顺序，ProductionRunStore 负责任务状态与检查点，ProductionOperations 负责规划/写稿/配音/合成/导出。Worker 是组装入口，数据库事务进入 db 包。

仅整理目录不能解决依赖耦合；拆微服务增加部署与一致性成本；本次采用保留部署、重构内部边界方案。

## 必须保持

- 保留现有 HTTP、数据库 schema、Production、Job、审批/重试语义及 UI 配色。
- core 仅依赖 contracts，不依赖 Prisma/Pi/BullMQ/文件系统/环境变量。
- 每任务一次设置快照；密钥不持久化进 Production/Job 或返回浏览器。
- 编排异常仅存安全错误；配置加载失败也必须进入失败处理。
- 检查点、完成和失败必须按 projectId + revision + jobId 校验所有权；进度与数据更新事务一致。旧任务不能覆盖新任务或把新状态改为失败。
- plan 到 approval 停止；produce 有已有 scenes 则不重新写稿；export 仅渲染，不调用模型或 TTS。
- 完成/失败事务由 db 负责；Worker 不含 Prisma 事务或阶段条件分支。
- 不提交用户现有脏工作区，不读取私有配置内容，不发付费调用。

## 验收

纯内存编排测试验证审批、恢复、终止/过期任务、异常释放、检查点失败后停止副作用；真实 PostgreSQL/Redis/系统语音/Chrome/FFmpeg 集成验证原链路及旧任务不能覆盖新 owner。类型检查、构建与现有单元测试通过。

## 后续能力（本次不声称实现）

桌面入口可复用 core 与适配器；视觉模型验收、自由页面代码生成、多模型角色配置、实时 SSE、多人鉴权与配额另行迭代。当前确定性时间轴校验继续由 renderer 保证。
