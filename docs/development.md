# 开发与验证

## 环境

Node.js 22.19+（建议 24 LTS），pnpm 10.33.2，Docker Desktop / Compose v2。FFmpeg 由依赖自动安装，Chrome 用于画面渲染。配置模型和配音服务后，制作任务会调用用户选定的服务；macOS 本地语音无需外部 Key。

`pnpm install` 自动生成 Prisma Client。版本由 `pnpm-lock.yaml` 固定；使用 `pnpm install --frozen-lockfile` 重现。msgpackr-extract 可选原生加速的安装脚本未放行，BullMQ 使用 JS 实现。

## 启动

1. `cp .env.example .env`（已有配置不要覆盖）。`.env` 用于数据库、Redis 等基础设施；模型和配音 Key 在网站「服务配置」填写，不使用 `VITE_` 前缀。
2. 启动 Docker Desktop，再 `pnpm infra:up`。PostgreSQL 16 映射 127.0.0.1:55439，Redis 7 映射 127.0.0.1:56379，命名卷持久化。
3. `pnpm db:migrate` 应用已提交的初始迁移。
4. `pnpm dev` 编译共享包并并发启动 web、api、worker。
5. 打开 http://127.0.0.1:5173 。服务仅绑定 loopback，不部署公网。

可分别运行 `pnpm --filter @timotv/web dev`、`pnpm --filter @timotv/api dev`、`pnpm --filter @timotv/worker dev`；首次运行先 `pnpm build:packages`。共享包修改后重新执行 build:packages，API/Worker 会监测 dist 变化重启。前端源文件由 Vite 热更新。

构建后的服务可用 `pnpm --filter @timotv/api start` 和 `pnpm --filter @timotv/worker start` 验证。Vite 的 `/api` 开发代理指向 3001；更改 API PORT 时同步修改 vite.config.ts。生产环境需要同源反向代理，当前没有生产部署脚本。

## 测试

```sh
pnpm build
pnpm typecheck
pnpm test
pnpm test:integration
pnpm exec playwright install chromium
pnpm test:e2e
```

单元测试不依赖基础设施。集成测试需要先迁移，启动真实独立 Worker 子进程，使用 PostgreSQL 和 Redis，不用内存模拟。浏览器测试自动启动开发服务（已有服务则复用），分别测试桌面 1440px 和窄屏 390px。测试创建的数据使用唯一 ID，结束后清理自己的项目；请使用开发数据库。截图与失败 trace 位于 test-results/。

`pnpm infra:down` 停止容器，保留数据卷。不要使用 `down -v`，除非确实需要清空全部开发数据。

## 常见问题

- Docker daemon 无法连接：先启动 Docker Desktop，等待启动完成。
- 端口被占用：用 `lsof -nP -iTCP:55439 -sTCP:LISTEN` 排查；不要停止未知服务。修改 Compose 端口及 `.env` 中 DATABASE_URL。初始化时 55432 被占用，所以选择 55439。
- `CONFIG_MISSING`：补齐 `.env` 的 DATABASE_URL 和 REDIS_URL；服务启动拒绝缺失配置。
- API 503：检查 `docker compose -f infra/compose.yaml ps`、数据库迁移、连接 URL。健康检查同时访问数据库与 Redis，不返回模拟健康状态。
- 诊断一直 queued：Worker 未启动或无法连接 Redis；检查 worker 日志。只有 Worker 实际完成后才变 succeeded。
- 409 REVISION_CONFLICT：重新 GET 时间轴并合并编辑，再用最新 revision 保存；禁止盲目覆盖。
- 浏览器下载慢：可用已安装的 Chrome 执行 `PLAYWRIGHT_CHANNEL=chrome pnpm test:e2e`；或重新执行 Playwright install；不要将未执行的浏览器测试标记为通过。
- 依赖驱动报错：API 对外仅提供安全错误码与提示，不输出连接密码。Worker 启动连接失败会退出。

## 官方依据与版本选择

保留经过本工程验证的兼容稳定大版本，不追逐预发布版本。实际解析版本以锁文件为准。

- [Vite 环境要求](https://vite.dev/guide/)：Node 20.19+ / 22.12+。
- [Prisma 6 环境要求](https://www.prisma.io/docs/orm/v6/reference/system-requirements)：本项目使用 Prisma / Client 6.19 同版本线。
- [Hono Node.js](https://hono.dev/docs/getting-started/nodejs)：Node server adapter。
- [BullMQ 连接设置](https://docs.bullmq.io/guide/connections)：API 提交端快速失败、Worker 持久连接；Redis noeviction。

初始化解析：React 19.3.1、Vite 7.3.7、Hono 4.13.17、Prisma 6.19.3、BullMQ 5.81.5、Zod 3.25.76、TypeScript 5.9.3、Vitest 3.2.7、Playwright 1.65.0。

## 主题生成视频

网站现在支持输入主题或 UTF-8 `.txt` / `.md` 资料，生成分镜并等待用户确认；批准后自动写口播、逐句配音、按内容逐页绘图并合成同步画面。口播可编辑后重新配音，预览就绪后独立导出 MP4。页面编辑会使旧产物过期。

### 模型配置

在首页或工作台的「创作设置 → 创作方向」选择通用讲解、科普口播或产品介绍。产品介绍可附上产品资料，以便模型使用有依据的功能信息。修改后保存主题与资料，再规划分镜。

内置写作规则位于 `packages/agent/skills/`。每个方向目录包含 `SKILL.md`、`references/planning.md` 和 `references/script.md`；`shared/planning.md` 与 `shared/script.md` 保存跨方向的导演与口播方法，`README.md` 说明参考帧言时的取舍。代码按创作方向和当前阶段加载，不需要用户手动调用 Skill。修改规则文件对下一次生成生效；进行中的生成使用已加载内容。新增方向需要同步更新 contracts 枚举与标签、agent 目录映射、对应文件和测试，UI 会根据共享选项展示。

验证规则接入：`pnpm build:packages && pnpm exec vitest run tests/director.test.ts tests/production.test.ts tests/production-service.test.ts`。这些测试验证加载与流程约束，使用测试模型返回值；真实模型的内容质量需要单独人工评估。

优先打开 [服务配置](http://127.0.0.1:5173/#settings)，填写服务商、模型 ID、API 地址和 Key。保存后新任务读取新配置，已经运行的任务继续使用启动时的快照。

无界面初始化时仍可在已有 `.env` 中提供默认值，不覆盖数据库和 Redis 设置：

```dotenv
TIMO_PROVIDER=openai
TIMO_MODEL=填写服务商可用的模型ID
TIMO_API_KEY=填写对应服务商的APIKey
```

Pi 适配器支持内置 provider；也兼容 `OPENAI_API_KEY`、`ANTHROPIC_API_KEY`、`GEMINI_API_KEY`、`DEEPSEEK_API_KEY`。使用 OpenAI 兼容中转、自建模型或未列入目录的模型时，指定 `TIMO_BASE_URL` 为完整 API 根地址，并设置 `TIMO_PROTOCOL=openai`；Anthropic 兼容地址使用 `TIMO_PROTOCOL=anthropic`。模型必须支持工具调用。模型内容通过独立的结构校验进入后续阶段，未配置时明确报错。

设置页保存无需重启；仅手工修改 `.env` 后需要重启 API 与 Worker。私有设置存于 `.data/config/settings.json`（0600），浏览器只能读取是否已配置 Key，不能读回密钥。空 Key 输入保留原值，明确勾选清除才删除。系统不会读取其他应用的密钥，也不会在启动时自动调用模型。

### 配音、画面与导出

- macOS 可选择系统 `say`，中文默认 Tingting，英文默认 Samantha。可填写 `say -v '?'` 中已安装的声音名称，无外部费用。
- 可选 ElevenLabs：配置 `ELEVENLABS_API_KEY`，并在界面填写声音 ID 或设置 `ELEVENLABS_VOICE_ID`。也可在设置页配置；用户批准制作或重新配音时发起请求，按服务商账户计费。
- 每句独立合成，读取真实 PCM 音频长度，得到句级字幕时间；不提供词级对齐。原文不变时复用项目级配音缓存。
- 三种模板配色为 warm/chalk/tech，画面当前为受控的 SVG 关系图与拍点动画，并非帧言的完整插画组件库。
- 预览和导出共享 `renderAt(t)`；导出使用 Chrome 截图和 FFmpeg，横屏 1920×1080、竖屏 1080×1920，当前动画采样为 12 fps。
- 浏览器可通过 `CHROME_PATH` 配置；FFmpeg 由 `ffmpeg-static` 提供，安装脚本在 workspace 中明确放行。
- 原始帧只在导出期间暂存，结束后清理。API 和 Worker 将 STORAGE_ROOT 相对仓库根目录解析，读取同一个产物目录。

执行 `pnpm db:migrate` 应用新增 Production 表。生产内容与原编辑时间轴分开存储，旧项目、标题与诊断接口保持可用。网站是本机单用户开发版，账号系统和公网部署不在本轮范围。

```sh
# 不调用付费服务，使用系统语音与浏览器实际编码
FILM_INTEGRATION=1 pnpm exec vitest run tests/film.test.ts
# 测试模型注入仅存在于测试；数据库、独立队列、Worker、系统语音与编码器均真实执行
pnpm test:integration
```

### 火山 TTS 默认配音

新项目默认使用火山 TTS（豆包语音）。在「服务配置 → 配音服务」填写火山 Key，搜索、选择默认音色；创作表单可为单个项目覆盖音色。提供 27 个官方预置音色，支持按名称 / ID 搜索、性别筛选、自定义 ID 和点击试听。目录不是当前账号的授权列表，具体权限以火山账号为准；试听会调用语音合成服务。

无界面初始化仍可填写服务端 `.env`：

```dotenv
VOLCENGINE_TTS_API_KEY=你的火山语音APIKey
VOLCENGINE_TTS_VOICE_ID=zh_male_yuanboxiaoshu_uranus_bigtts
```

默认音色为“渊博小叔 2.0”，可在选择器切换音色或输入自定义 ID。设置页保存后新任务立即使用；仅修改 `.env` 需要重启。该 Key 是火山语音服务的 Key，与导演模型 Key 分开配置；也支持旧控制台 AppID + Access Token，使用 `VOLCENGINE_TTS_APP_ID` / `VOLCENGINE_TTS_ACCESS_TOKEN` 或 `VOLCENGINE_TTS_API_KEY=AppID:AccessToken`。

适配器按音色选择 `seed-tts-2.0`、`seed-tts-1.0` 或复刻资源；也可显式指定 `VOLCENGINE_TTS_RESOURCE_ID`。HTTP 单向流式返回的音频分段合并后，进入现有 PCM 转换、音频缓存、真实句级时间与字幕流程。只切换音色或配音服务会保留已确认的分镜与口播，使音频及画面产物过期后重做。

接口依据：[火山官方 HTTP 单向流式合成文档](https://docs.volcengine.com/docs/doubao-voice/unidirectional-streaming-text-to-speech-http?lang=zh)。缺少有效配置时明确报错，不自动替换成其他配音服务。

### DeepSeek 导演模型

当前 `.env.example` 预置 DeepSeek：`TIMO_PROVIDER=deepseek`、`TIMO_MODEL=deepseek-flash`、`TIMO_BASE_URL=https://api.deepseek.com`、`TIMO_PROTOCOL=openai`。推荐在服务配置页选择 DeepSeek 并填写模型 ID、API 地址和 Key。也兼容 `.env` 的 `TIMO_API_KEY`（或 `DEEPSEEK_API_KEY`）作为初始默认值。模型名与兼容接口依据：[DeepSeek 官方接入文档](https://api-docs.deepseek.com/)。该密钥用于分镜、写稿和逐页绘图，火山语音 Key 用于配音。

逐页绘图：分镜可选择主体特写、过程演示、左右对照、系统关系、时间推进。每页使用真实句级时间安排图形出现；横竖版分别布局。已有作品可点击“绘制画面”或“重新绘制画面”，沿用原音频与字幕；完成后的分镜可选择“重绘本页”，只使选中页的画面失效；中断后重试跳过已完成页，也可选择“重新绘制全部”放弃已有画面。绘图会请求当前配置的模型，按页产生模型用量。入口在配音完成且无运行任务时可用，未保存编辑需先保存。

DeepSeek 结构化生成会显式发送 `thinking: { type: "disabled" }`。仅在本地 Model 对象上设置 `reasoning: false` 会让 Pi 省略该参数，而 DeepSeek 新模型未指定开关时默认思考，可能在提交 JSON 前用完输出额度。本实现通过 Pi 的 DeepSeek 兼容能力与 off 设置发出明确开关；其他提供商不追加该参数。依据：[DeepSeek 思考模式文档](https://api-docs.deepseek.com/guides/thinking_mode/)。

### 连续动画与审片

新生成/重绘页使用 artwork version 2；旧页 version 1 仍可预览和导出。连续动作的时间锚点来自真实配音句 ID 与句内比例，目前不是词级对齐。现有项目可“重绘本页”，仅重新生成该页，复用配音与字幕。

在服务配置的“视觉审片模型”页填写独立服务商、模型、协议、API 地址与 Key，并启用。点击“检查图片输入”会进行一次实际模型请求；保存配置本身不调用模型。环境变量备用入口：TIMO_REVIEW_ENABLED、TIMO_REVIEW_PROVIDER、TIMO_REVIEW_MODEL、TIMO_REVIEW_PROTOCOL、TIMO_REVIEW_BASE_URL、TIMO_REVIEW_API_KEY。浏览器不回显 Key。

工作台“审片”页可以查看每页状态、关键帧和问题，点击截图/时间跳到暂停的预览。重试本页审片会复用服务失败前保存的证据；仅修复本页按问题生成新候选，最多两轮自动修正。仍有视觉问题时需明确“接受当前页”或继续修复；无法渲染的页面不能接受。未配置识图服务时仍允许制作，但显示“未视觉审片”，只能依赖布局测量与人工检查。

相关验证：`pnpm exec vitest run`；`RUN_INTEGRATION=1 pnpm exec vitest run tests/integration/review-capture.test.ts tests/integration/visual-review-workflow.test.ts`；`PLAYWRIGHT_CHANNEL=chrome pnpm exec playwright test tests/e2e/studio-workbench.spec.ts tests/e2e/vision-settings.spec.ts`。真实外部识图模型的准确性需配置后另行验收，测试替身只能验证调用、修正和恢复流程。

## 制作运行时、失败诊断与时长策略

Worker 启动前分别检查 PostgreSQL、Redis、Chrome 和 FFmpeg。数据库与 Redis 的已知连接型启动错误最多重试 5 次，退避为 500ms、1s、2s、4s（上限 5s）；配置错误和代码错误立即失败。`GET /api/production/capabilities` 只返回各组件的 `ready` 与稳定错误码，不返回可执行文件路径、连接串或密钥。Chrome 的发现、启动、字体就绪、逐帧跳转、DOM 测量、截图、取消与清理由 `packages/renderer/src/browser-runtime.ts` 统一负责；Node 不再把复杂 TypeScript 函数序列化进页面。

制作失败同时保留兼容字段 `error` 和结构化 `failure`。结构化信息包含 `code`、`phase`、`retryable`、可选 `sceneId/cueId` 及 `diagnosticId`。内部原因在落库前会脱敏 Bearer、URL 密码和 Key/Token 赋值；浏览器只显示安全文案、错误码、阶段和诊断 ID，不显示 `causeSummary`。排查时用诊断 ID 对照 Worker 日志和 Job 记录，不要把用户密钥复制到工单。常见稳定码包括 `TTS_PROVIDER_FAILED`、`ARTWORK_VALIDATION_FAILED`、`REVIEW_BROWSER_RUNTIME_FAILED`、`RENDER_BROWSER_RUNTIME_FAILED`、`FFMPEG_PROCESS_FAILED`、`DATABASE_OPERATION_FAILED`、`QUEUE_OPERATION_FAILED` 和兜底 `PRODUCTION_UNKNOWN_FAILED`。

AI 口播的长视频以真实 TTS 音频为准：目标区间为选择时长的 90%–110%，例如 5 分钟必须落在 4:30–5:30。分镜先获得逐页 `targetDurationSec`，写稿后做文本估算；真实配音超出区间时最多自动校正两轮。句子缓存键包含服务商、音色、规范化文本、影响语速的资源/模型版本和合成版本，校正时只重新合成变化的句子，并重新构建拼接顺序和字幕时间。两轮后仍不合格会返回 `DURATION_CONTENT_INSUFFICIENT`，不会带着 1:35 的音频继续绘图。

“逐字原稿”模式只在原有标点和换行处分句，重建文本必须逐码点等于 `sourceNarration`，不会调用模型扩写或改写。真实时长不在目标区间时状态变为 `needs-input`；用户可修改原稿/目标，或明确执行 `accept-duration`，把真实时长记录为 `accepted-source` 后复用现有音频继续绘图。

聚焦验证命令：

```sh
pnpm exec vitest run tests/production-failure.test.ts tests/production-errors.test.ts tests/duration-policy.test.ts tests/production-runner.test.ts
RUN_INTEGRATION=1 pnpm exec vitest run tests/integration/browser-runtime.test.ts tests/integration/duration-correction.test.ts tests/integration/production.test.ts
PLAYWRIGHT_CHANNEL=chrome pnpm exec playwright test tests/e2e/production.spec.ts
```
