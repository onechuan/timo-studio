# TimoTV

中文优先的本地 AI 视频工作室。输入一个主题或一份文本资料，TimoTV 会完成分镜规划、口播写作、配音、逐页画面、视觉审片、预览与 MP4/SRT 导出，同时保留人工审批和失败恢复入口。

> 当前定位是本机单用户创作与质量验证，不是可直接暴露到公网的多租户服务。

## 核心能力

- **从主题到视频**：主题/资料 → 分镜审批 → 口播 → TTS → 逐页绘图 → 审片 → 预览 → MP4/SRT。
- **结构化 AI 导演**：通过 Pi Agent 和 Zod 契约生成分镜、脚本及受控画面，不执行模型返回的任意代码。
- **真实音频时间线**：支持火山 TTS、macOS 系统语音和 ElevenLabs；以真实 PCM 时长生成句级字幕与画面拍点。
- **Film Kit 与连续视觉**：先建立跨页复用的角色、道具和视觉组件，再生成每一页，减少角色与风格漂移。
- **视觉质量闭环**：浏览器关键帧截图、布局测量、页级审片与最多两轮自动修复，并执行全片一致性检查。
- **所见即所得**：预览、审片和导出读取同一份视觉文档，并共享确定性的 `renderAt(t)` 时间线。
- **后台恢复**：PostgreSQL 保存制作检查点，Redis/BullMQ 执行耗时任务；中断后可从已完成阶段继续。
- **时长控制**：AI 口播会按目标区间自动校正；逐字原稿不会被改写，超时后由用户决定修改或接受真实时长。

## 绘图引擎 V3 品质管线

绘图引擎源码直接维护在 `packages/drawing-engine`，构建、测试和运行都不需要外部仓库或上游包。该管线包含：

- Film Kit、页级审片/修复与全片一致性审查；
- 预览、审片、导出三条链路的视觉载荷统一；
- 受控开关与持久化的管线选择。

V3 品质管线仍处于受控发布阶段。新环境默认使用 `legacy-v3`；可在服务设置中选择 `drawing-engine-v3`，或在服务端 `.env` 中临时强制启用：

```dotenv
TIMOTV_VIDEO_PIPELINE=drawing-engine-v3
```

默认切换前仍需使用真实生成结果完成人工验收。

## 环境要求

- Node.js 22.19+（建议使用 Node.js 24 LTS）
- pnpm 10.33.2
- Docker Desktop / Docker Compose v2
- Chrome 或 Chromium（画面审片与视频渲染）

FFmpeg 由 `ffmpeg-static` 安装，无需单独配置。macOS 可直接使用系统语音；其他模型与配音服务可能产生第三方费用。

## 快速开始

```sh
git clone git@github.com:onechuan/timo-studio.git
cd timo-studio
cp .env.example .env
pnpm install --frozen-lockfile
pnpm infra:up
pnpm db:migrate
pnpm dev
```

启动后访问：

- 工作室：http://127.0.0.1:5173
- 服务配置：http://127.0.0.1:5173/#settings
- API 健康检查：http://127.0.0.1:3001/api/health

首次制作前，在“服务配置”填写导演模型和配音服务。模型必须支持工具调用；未配置外部 TTS 时，macOS 可选择本地系统语音。

## 配置与密钥

`.env` 负责 PostgreSQL、Redis、端口和服务端默认配置；网页保存的模型与配音设置优先于环境变量。

- 私有配置保存在 `.data/config/settings.json`，权限为 `0600`。
- 浏览器只能读取“是否已配置”，不能读回 API Key。
- 密钥不得使用 `VITE_` 前缀，也不要提交 `.env`、`.data` 或生成产物。
- `STORAGE_ROOT` 默认为 `.data/assets`，API 与 Worker 必须指向同一目录。

完整变量说明见 [`.env.example`](.env.example) 和 [开发指南](docs/development.md)。

## 常用命令

| 命令                    | 用途                                                           |
| ----------------------- | -------------------------------------------------------------- |
| `pnpm dev`              | 并发启动 Web、API 和 Worker                                    |
| `pnpm build`            | 构建全部 workspace 包                                          |
| `pnpm typecheck`        | 执行全仓库 TypeScript 检查                                     |
| `pnpm test`             | 运行单元测试                                                   |
| `pnpm test:integration` | 使用真实 PostgreSQL、Redis、Worker、浏览器与编码器运行集成测试 |
| `pnpm test:e2e`         | 运行 Playwright 端到端测试                                     |
| `pnpm infra:down`       | 停止本地基础设施并保留数据卷                                   |

集成测试前需启动基础设施并应用迁移；首次运行浏览器测试可执行 `pnpm exec playwright install chromium`。

## 架构

```text
apps/web  ──HTTP──> apps/api ──enqueue──> Redis / BullMQ
                       │                       │
                       │                       v
                  PostgreSQL <────────── apps/worker
                                               │
                         agent + speech + renderer + Chrome/FFmpeg
```

- `apps/web`：React/Vite 工作室、分镜审批、审片和设置界面。
- `apps/api`：Hono API、输入校验、项目与产物访问；不在 HTTP 请求内渲染视频。
- `apps/worker`：消费制作队列，组装 Agent、TTS、审片、渲染与恢复流程。
- `packages/contracts`：跨端 TypeScript/Zod 数据契约。
- `packages/core`：与基础设施无关的制作编排和业务规则。
- `packages/agent`：导演提示词、内置创作 Skill 与结构化模型适配。
- `packages/speech`：TTS、音频缓存、真实时长与 SRT。
- `packages/renderer` / `packages/drawing-engine`：确定性画面、浏览器审片与 MP4 编码。
- `packages/db` / `packages/queue` / `packages/storage`：持久化、异步任务和本地私有配置。

更多设计细节见 [架构说明](docs/architecture.md)。

## 验证与文档

- [项目知识库](docs/README.md)：全部文档的索引、现行/历史划分与维护约定
- [开发与验证](docs/development.md)
- [架构与约束](docs/architecture.md)
- [验证记录](docs/verification.md)
- [后续路线图](docs/roadmap.md)
- [绘图引擎 V3 集成说明](docs/verification/drawing-engine-v3-integration.md)

## 开源许可

TimoTV 使用 [GNU AGPL-3.0-only](LICENSE) 许可。绘图引擎包含第三方 AGPL-3.0 源码；来源与许可声明见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) 和 [`docs/OPEN_SOURCE.md`](docs/OPEN_SOURCE.md)，本地修改说明见 [`docs/DRAWING_ENGINE_CHANGES.md`](docs/DRAWING_ENGINE_CHANGES.md)。
