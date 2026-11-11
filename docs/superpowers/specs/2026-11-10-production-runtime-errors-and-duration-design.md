# TimoTV 统一运行边界、错误诊断与成片时长闭环设计

日期：2026-11-10

## 1. 背景

当前制作链路已经能够完成分镜、口播、火山 TTS、逐页绘图、关键帧审片、预览和导出，但暴露出三类同源问题：

1. Node/TSX 中的函数被直接传入 Playwright 浏览器执行，函数可能隐式依赖 Node 转译辅助变量。开发模式下曾因浏览器缺少 `__name` 而在关键帧审片阶段失败。
2. Worker 将未识别异常统一转换为“制作失败，请检查模型配置、服务连接和本机环境后重试”，用户无法判断失败阶段、对象和可恢复方式。
3. `brief.durationSec` 只是模型提示参数，不是制作不变量。用户选择 300 秒后，模型只生成约 95 秒口播，火山 TTS 测得真实时长后系统仍继续制作。

本设计将三类问题统一收口在明确的运行边界、结构化失败对象和真实时长质量门中。

## 2. 目标与非目标

### 2.1 目标

- 所有生产 Playwright 页面通过统一运行层创建和调用，Node 函数不再裸跨浏览器边界。
- 每次制作失败都具有稳定错误码、阶段、对象、是否可重试和安全的用户提示。
- 内部诊断保留足够技术原因，同时不持久化或返回 API Key、Token、数据库口令和供应商敏感响应。
- 目标时长以 TTS 实测音频为准，普通创作稿最终时长控制在目标值的 ±10%。
- 失败与时长修正均沿用已有任务队列、检查点和断点恢复，不重复完成且仍有效的模型或 TTS 工作。
- 用户提供逐字原稿时保持原文，不为满足时长自动改写。

### 2.2 非目标

- 本期不把 Chrome、FFmpeg 拆成独立微服务或容器。
- 不承诺音频精确到目标秒数，只保证普通创作稿落入 ±10% 接受区间。
- 不通过重复句、空泛过渡和无依据事实凑时长。
- 不在前端暴露底层堆栈、密钥、请求头或供应商原始响应。

## 3. 总体架构

```text
Production Worker
  ├─ Director operations
  │    ├─ plan
  │    ├─ script
  │    ├─ duration estimate gate
  │    └─ TTS measured-duration gate
  ├─ BrowserRuntime
  │    ├─ launch / page bootstrap
  │    ├─ renderAt
  │    ├─ measureReviewFrame
  │    ├─ screenshot
  │    └─ timeout / abort / crash mapping
  └─ ProductionFailure mapper
       ├─ safe public failure
       ├─ sanitized diagnostic
       └─ retry checkpoint

PostgreSQL / Redis
  ├─ Job status + structured error metadata
  └─ Production checkpoint + duration correction state

Web Studio
  ├─ exact failed phase and page
  ├─ contextual retry action
  ├─ target vs measured duration
  └─ accept-shorter / add-material path
```

## 4. BrowserRuntime 统一浏览器边界

### 4.1 责任

新增 renderer 内部的 `BrowserRuntime`，负责：

- 查找并启动 Chrome；
- 创建带固定 viewport、字体就绪等待、网络策略和取消信号的页面；
- 安装版本化的 TimoTV 浏览器运行时；
- 提供 `renderAt`、`measureReviewFrame`、`screenshot` 等稳定方法；
- 将浏览器启动失败、页面崩溃、执行异常、超时和取消转换为类型化内部异常；
- 无论成功失败都关闭 page/browser 并清理监听器。

### 4.2 边界规则

- 禁止生产代码把从 Node 模块导入的复杂函数直接作为 `page.evaluate(fn)` 参数。
- DOM 测量逻辑作为版本化浏览器脚本安装到 `window.TIMO_BROWSER_RUNTIME`，Node 侧只调用短小、无闭包的入口。
- 运行时安装必须幂等，并公开版本号供截图指纹和诊断使用。
- 当前 `__name` 注入保留为迁移期兼容层，所有调用迁入后不再依赖它作为主要方案。
- `film.ts` 与 `review.ts` 的页面创建、就绪等待和执行都迁入同一个运行层。

### 4.3 启动预检

Worker 启动后执行轻量预检：

- PostgreSQL 连接；
- Redis 连接；
- Chrome 可启动并执行 TimoTV 浏览器运行时；
- FFmpeg 路径存在且可执行。

预检失败不伪装为模型问题。Worker 保持可观测状态并按依赖类型重试；API 能返回当前制作能力。

## 5. 结构化错误体系

### 5.1 内部失败对象

统一使用以下语义，不依赖错误字符串正则作为主判断：

```ts
type ProductionPhase =
  | 'planning'
  | 'scripting'
  | 'narrating'
  | 'illustrating'
  | 'reviewing'
  | 'composing'
  | 'rendering'
  | 'storage'
  | 'queue';

interface ProductionFailure {
  code: string;
  phase: ProductionPhase;
  retryable: boolean;
  publicMessage: string;
  sceneId?: string;
  cueId?: string;
  diagnosticId: string;
  causeSummary?: string;
}
```

首批稳定错误码包括：

- `MODEL_NOT_CONFIGURED`、`MODEL_AUTH_FAILED`、`MODEL_TIMEOUT`、`MODEL_OUTPUT_INVALID`；
- `TTS_NOT_CONFIGURED`、`TTS_AUTH_FAILED`、`TTS_VOICE_INVALID`、`TTS_SERVICE_FAILED`；
- `ARTWORK_OUTPUT_INVALID`、`ARTWORK_RUNTIME_FAILED`；
- `REVIEW_BROWSER_MISSING`、`REVIEW_BROWSER_START_FAILED`、`REVIEW_BROWSER_RUNTIME_FAILED`、`REVIEW_TIMEOUT`；
- `FFMPEG_MISSING`、`FFMPEG_FAILED`、`DISK_WRITE_FAILED`；
- `DATABASE_UNAVAILABLE`、`QUEUE_UNAVAILABLE`；
- `DURATION_TOO_SHORT`、`DURATION_TOO_LONG`、`DURATION_CONTENT_INSUFFICIENT`。

### 5.2 安全诊断

- `publicMessage` 可持久化并返回前端，例如“第 2 页关键帧检查失败，可从本页重试”。
- `causeSummary` 仅保留经过清理的错误类型、短消息和本地组件，不包含 URL 凭据、Authorization、Cookie、API Key、Token 或完整供应商响应。
- 原始错误只写入本机受控日志，并关联随机 `diagnosticId`；日志输出经过统一脱敏函数。
- Job 保存稳定 `errorCode`、`errorMessage` 和结构化上下文；Production 保存用户需要的失败上下文与恢复点。

### 5.3 前端呈现

失败卡片展示：

- 失败阶段；
- 具体页或句子；
- 可读原因；
- 是否自动保留了已有产物；
- 唯一的推荐动作，例如“重试本页审片”“重新配音”“检查 Chrome”“打开服务配置”。

前端不再把所有未知异常显示为模型、服务连接和本机环境的组合提示。

## 6. 成片时长闭环

### 6.1 时长语义

- `durationSec` 是普通创作稿的目标时长。
- 接受区间为目标时长的 90%～110%。300 秒项目的接受区间是 270～330 秒。
- 真实判断依据是合并后的 TTS 音频时长，不使用固定字数冒充最终时长。
- UI 同时展示目标时长、预计口播时长和真实配音时长。

### 6.2 分镜预算

分镜输出增加每页目标预算，所有页预算之和接近 `durationSec`：

```ts
interface PlannedScene {
  // existing fields
  targetDurationSec: number;
}
```

约束：

- 每页预算与内容复杂度相关，不机械平均；
- 总预算落入目标时长 ±5%，给 TTS 语速误差预留空间；
- 5 分钟项目不能仅因模型倾向简洁而退化成 1～2 分钟；
- 分镜页数仍由内容节拍决定，页内可以有多句口播和连续动画。

### 6.3 口播预估门

口播生成后、调用 TTS 前进行低成本估算：

- 中文以可读字符、标点停顿和当前音色历史速率估算；
- 英文以词数、标点停顿和当前音色历史速率估算；
- 没有历史速率时使用保守默认值；
- 估算明显低于 85% 或高于 115% 时，先让编剧模型按各页预算修订，避免无效 TTS 调用；
- 模型修订必须基于已批准分镜、用户主题和资料，不能添加无依据事实。

### 6.4 TTS 实测门

火山 TTS 完成后计算真实总时长：

- 90%～110%：通过并进入绘图；
- 低于 90%：进入 `duration-correcting` 检查点，按缺口扩写解释、例子或必要过渡；
- 高于 110%：压缩重复与次要解释；
- 最多自动修订两轮；
- 修订后只重新合成发生变化的 cue，稳定 cue 继续复用缓存；
- 每轮保存脚本、音频指纹、真实时长和剩余差值，进程中断后从该轮恢复。

### 6.5 内容不足与逐字原稿

- 普通创作稿两轮后仍不达标：停止在可恢复状态，提示用户补充资料、缩短目标时长或接受当前时长。
- `ProductionBrief` 增加显式 `narrationMode: 'ai' | 'verbatim'` 和可选 `sourceNarration`。新项目默认 `ai`；只有用户选择“逐字原稿”时才显示并要求填写 `sourceNarration`，不依赖模型猜测 topic 或 materials 是否属于口播。
- `verbatim` 模式禁止自动改写、扩写或压缩；`ai` 模式才允许在已批准事实范围内进行时长修正。
- 逐字原稿完成 TTS 后显示真实时长与目标差异，用户可以主动选择“接受实际时长”或取消逐字约束后让 AI 调整。
- “接受实际时长”是显式操作，并记录 `durationPolicy: 'accepted-source'`，避免后续任务再次自动修正。

## 7. 数据与状态迁移

Production 增加可选字段，确保旧项目可读取：

```ts
interface DurationState {
  targetMs: number;
  minMs: number;
  maxMs: number;
  measuredMs?: number;
  estimatedMs?: number;
  correctionRound: number;
  policy: 'target-band' | 'verbatim' | 'accepted-source';
  status: 'pending' | 'estimating' | 'measuring' | 'correcting' | 'accepted' | 'needs-input';
}
```

- 旧项目没有 `durationState` 时按 brief 惰性推导；旧项目没有 `narrationMode` 时保持已有成片不变，重新制作前要求用户确认 AI 创作或逐字原稿模式。
- 已完成项目不自动重写；用户重新制作时才启用新时长门。
- 现有 `durationMs` 继续表示真实成片/音频时长，避免破坏播放器和导出逻辑。

## 8. 恢复与幂等

- BrowserRuntime 失败从当前页的 `checking` 或 `repairing` 状态恢复。
- 时长修正从当前 `correctionRound` 恢复，不重复已经缓存的 TTS cue。
- Job claim 继续使用 revision 乐观锁；同一 revision 不允许两个修正任务并行。
- 用户修改目标时长、口播或分镜时，相关时长估计和后续绘图/预览失效，但未改变且指纹一致的单句音频可以复用。

## 9. 测试策略

### 9.1 单元测试

- `ProductionFailure` 从各类内部错误映射为稳定错误码和安全提示；
- 脱敏器覆盖 URL 密码、Authorization、Token、API Key 和供应商响应；
- 中英文时长估算、接受区间边界和逐字策略；
- 分镜预算总和与每页预算约束；
- 时长修正轮次、缓存复用和中断恢复。

### 9.2 集成测试

- 使用真实 `tsx` 开发加载器和真实 Chrome 执行 BrowserRuntime，防止 `__name` 等转译依赖再次遗漏；
- Chrome 缺失、启动失败、页面崩溃、evaluate 异常和超时分别得到不同错误码；
- 生成短稿后通过模拟 TTS 时长触发扩写，并在第二轮进入 ±10%；
- 两轮仍不足时进入 `needs-input`，而不是继续绘图；
- 逐字原稿不被修改，只生成差异提示。

### 9.3 端到端测试

- 选择 5 分钟后，页面展示 300 秒目标；
- 真实音频在 270～330 秒才自动进入绘图；
- 制作失败页面显示具体阶段、页面和可用重试动作；
- 断点重试不重复口播、TTS 或已完成页面；
- 待审片页面处理完成后允许导出 MP4。

## 10. 验收标准

1. 生产 renderer 中不存在复杂 Node 函数裸传 `page.evaluate` 的调用。
2. 开发模式和构建模式都能完成真实 Chrome 关键帧审片。
3. 未知错误仍有安全兜底，但已知失败均返回稳定错误码和准确阶段。
4. 页面能够区分模型、TTS、绘图、审片浏览器、FFmpeg、数据库和 Redis 问题。
5. 普通 5 分钟项目只有在真实 TTS 时长为 270～330 秒时才自动进入绘图。
6. 时长修正最多两轮，并复用未改变 cue 的音频。
7. 逐字原稿永不被自动扩写或压缩。
8. 自动修正无法达标时，用户可以补资料、改目标或明确接受实际时长。
9. 所有新错误和时长状态均支持任务中断后的幂等恢复。

## 11. 实施顺序

1. 引入结构化失败类型、脱敏器和错误持久化字段。
2. 建立 BrowserRuntime 并迁移审片与视频渲染调用。
3. 增加真实 TSX + Chrome 回归测试。
4. 增加分镜时长预算与口播估算门。
5. 增加 TTS 实测门、两轮修正与 cue 缓存复用。
6. 更新前端失败卡片、时长状态和用户决策入口。
7. 完成断点恢复、端到端验证与旧项目兼容验证。
