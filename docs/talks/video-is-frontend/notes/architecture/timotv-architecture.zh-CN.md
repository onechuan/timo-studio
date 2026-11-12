[English](ARCHITECTURE.md) · **简体中文**

# TimoTV 架构

TimoTV 是一个本地运行的开源产品：一条命令启动，在浏览器里打开一个完整的面板。用户上传资料、选时长和风格，导演 Agent 先出分镜给用户确认，再写口播、配音、逐页画面并自检，最后渲染成 1080p 视频，附带 SRT 字幕和发布信息。用户全程不接触代码。

```bash
node apps/cli/dist/cli.js serve    # 启动本地服务并打开面板（安装步骤见 README）
```

## 设计原则

- **成品级面板，不是开发者工具。** 安装、模型配置、环境检查、出错恢复都在面板里完成。
- **任何模型都能用。** 模型层基于 Pi（`@earendil-works/pi-ai`），支持 OpenAI、Anthropic、Google、DeepSeek、OpenRouter、Vercel AI Gateway、火山方舟以及任意 OpenAI 兼容接口；默认推荐 Claude Opus 5.5。
- **工程兜底，不靠模型自觉。** 布局检查、截图自检、全片检查由编排器强制执行并把结果交给 Agent；弱一些的模型也能稳定出片。
- **本地优先。** 素材、项目、密钥都留在用户电脑上；密钥只发给用户选择的 provider。
- **每一步可回退。** 每个项目是一个 git 仓库，每次 Agent 改动都是一次提交，撤销就是 `git revert`。

## 仓库结构

```
timotv/
├── packages/
│   ├── engine/    @timotv/engine   视频引擎（源自 kit）：页面运行时、风格包、组件库、
│   │                                         渲染（Playwright + ffmpeg）、lint / snap / pages 工具
│   ├── agent/     @timotv/agent    导演 Agent：基于 pi-agent-core，分阶段编排、工具、提示词
│   ├── models/    @timotv/models   模型目录与 provider：pi-ai 内置 + 火山方舟
│   └── voice/     @timotv/voice    配音：火山 TTS 2.0、ElevenLabs；用户录音对齐
└── apps/
    └── studio/    timotv           本地服务（HTTP + SSE）+ Web 面板 + CLI 入口
```

## 运行时

| 部分 | 选择 | 说明 |
|---|---|---|
| 运行环境 | Node ≥ 22.19 | 与 Pi 要求一致 |
| 本地服务 | Hono + `@hono/node-server` | REST + SSE，单进程 |
| 面板 | React 19 + Vite + Tailwind | 沿用 Ink & Paper 设计语言，默认深色 |
| 浏览器 | `playwright-core` + 系统 Chrome / Edge | 找不到时在面板里一键安装 Chromium |
| 视频编码 | `ffmpeg-static` | 不要求用户自己装 ffmpeg |
| 数据目录 | `~/.timotv/` | `config.json`（0600，含密钥）、`projects/<id>/`（每个是 git 仓库） |

## 制作流程

```
新建项目（素材 + 时长 + 风格 + 音色 + 模型 + 字幕开关）
  → 解析素材（md / txt / pdf / docx / pptx / 图片）
  → ① 分镜 Agent        → storyboard.json            ◆ 用户确认 / 修改（面板内就地完成）
  → ② 口播 Agent        → script.js（同一会话续写）
  → ③ 配音               → voice.js + audio/（真实时间戳，或用户逐页录音）
  → ④ 画面 Agent × 页数  → pages/pNN.js（并发，每页独立会话）
        编排器每轮强制：lint → 截图拼图 → 交给 Agent 看图修改（最多 3 轮）
        仍有问题：标记为「需要关注」，不阻塞
  → ⑤ 全片检查           → 编排器跑全片 lint + 拼图，Agent 只修跨页问题
  → ⑥ 渲染               → MP4 1080p（可选烧录字幕）+ SRT + 发布信息
```

每个阶段是一次独立的 Agent 运行：上下文短、缓存命中高、失败只重跑这一段。

## 导演 Agent（packages/agent）

- 基于 `pi-agent-core` 的 `Agent`：事件流（`message_update` / `tool_execution_*`）直接转成面板的 SSE 事件。
- 工具只开放当前阶段需要的：`read`（含图片）、`write`、`edit`、`bash`（限项目目录）、`lint`、`snap`（返回拼图图片）、`timeline`、`use_component`、`logos`。
- `beforeToolCall` 守住边界：不能写项目目录以外的路径，不能改引擎，不能联网，不能运行渲染。
- 每轮工具调用后自动 git 提交；会话消息持久化到 `projects/<id>/.studio/sessions/`，中断后可续跑。
- 画面阶段要求模型支持图片输入；面板里不支持看图的模型会提示「无法自检画面」。

## 模型（packages/models）

- `pi-ai` 内置 provider 全部可用，用户在设置页填 key。
- **火山方舟**：OpenAI 兼容，`createProvider` 接入。
- **自定义**：任意 OpenAI / Anthropic 兼容地址。
- 用量与费用：每次请求的 token 用量按模型价格表累计，面板实时显示本项目已花费。

## 配音（packages/voice）

- 火山 TTS 2.0（seed-tts-2.0，预置音色），一页一次请求，拿真实字级时间戳。
- ElevenLabs（with-timestamps 接口），同样输出字幕时间。
- 用户录音：逐页提词器录音 → 语音识别对齐出时间戳 → 合并音轨。

## 面板（packages/ui）

- 首页：一句话说清能做什么 + 新建框（拖入素材、选时长 / 风格 / 音色 / 模型）+ 最近项目。
- 工作台：左侧对话与 Agent 过程（思考摘要、工具步骤、阶段节点、分镜确认卡片），右侧工作台（播放器、分页时间轴与每页状态、分镜 / 口播 / 素材 / 导出）。
- 设置：模型与密钥、配音、环境检查（浏览器、ffmpeg、磁盘）。
- 预览：项目页面在独立源的沙箱 iframe 中播放（`allow-scripts`，postMessage 控制 seek / play / pause）。

## 安全

- 本地服务只监听 `127.0.0.1`，每次启动生成随机令牌，面板通过令牌访问 API。
- 密钥只存本机 `config.json`（权限 0600），日志与事件里一律打码。
- Agent 生成的页面代码只在沙箱 iframe 与无头浏览器中运行。
