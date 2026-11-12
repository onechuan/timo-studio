# TimoTV Agent Harness 架构与 Workflow 图解

> 配合 [整体架构说明](timotv-architecture.zh-CN.md) 阅读。本文用图说明整体分层、Agent 内部设计与关键流程。

## 1. 全局架构：从用户到模型的一条竖直调用链

```mermaid
flowchart TB
    user([用户<br/>浏览器里的工作台：拖素材 / 审批分镜 / 看过程 / 导出])

    subgraph apps["apps/"]
        cli["cli<br/>本地服务器 Hono（REST + SSE）<br/>只监听 127.0.0.1 · 随机 token 鉴权"]
        desktop["desktop<br/>Electron 壳（复用同一套 server + ui）"]
    end

    subgraph packages["packages/"]
        ui["ui<br/>React 19 工作台<br/>左：对话与过程流 · 右：播放器与页面时间线"]
        core["core · Studio 门面<br/>项目库 · 配置/密钥(0600) · 材料解析(pdf/docx/pptx→md) · 事件日志"]
        agent["agent · 导演 Agent ★<br/>（本系统核心，详见图 2）"]
        engine["engine · 视频引擎（无 LLM）<br/>页面运行时 · 风格包 · 组件库<br/>lint / snap / render（Playwright + ffmpeg）"]
        models["models · 模型目录<br/>基于 pi-ai"]
        voice["voice · 配音<br/>火山 TTS / ElevenLabs（字级时间戳）"]
    end

    providers{{"模型服务商<br/>Anthropic · OpenAI · Google · DeepSeek<br/>OpenRouter · 火山方舟 · 任意兼容端点"}}

    user <-->|"HTTP + SSE"| cli
    desktop -.复用.-> cli
    cli --> core
    core -->|创建并驱动| agent
    agent -->|lint / 截图 / 渲染| engine
    agent -->|开会话调模型| models
    agent -->|配音| voice
    models --> providers
    cli --> ui

    style agent fill:#E0B88A,stroke:#9C6A3A,color:#1C1917
    style engine fill:#EFECE4,stroke:#7A736C,color:#1C1917
```

**要点**：`engine` 里没有任何 AI——它是一套成熟的"绘图 + 检查 + 渲染"工具箱。Agent 不凭空生成视频，而是写 JS 页面代码驱动 engine，再由 engine 的工具验收。

---

## 2. Agent 内部四层（packages/agent）

```mermaid
flowchart TB
    subgraph L3["L3 编排层 · director.ts（Director 状态机）"]
        l3["决定：现在到哪一步 · 找哪个模型 · 检查过没过 · 失败怎么办<br/>每步自动 git commit · 状态落盘可断点续跑 · 成本实时累计"]
    end

    subgraph L2["L2 提示词层 · prompts/*.md"]
        l2["PLANNER（分镜/脚本）· PAGE（画页面）· REVIEW（验收）· RESEARCH（调研）<br/>+ 所选风格的 GRAMMAR.md（风格语法卡）<br/>稳定内容放 system、变化内容放 user 末尾 → 提示词缓存友好"]
    end

    subgraph L1["L1 运行时抽象 · runtime/"]
        iface["统一接口<br/>AgentRuntime → open() → AgentSession.send()"]
        pi["pi.ts（主力）<br/>pi-agent-core，接任意厂商"]
        parked["claude.ts / codex.ts<br/>（备用，未随包加载）"]
        iface --- pi
        iface --- parked
    end

    subgraph L0["L0 工具与护栏 · tools/ + projectfs.ts"]
        l0["read / write / edit / bash：全限制在项目目录，engine/ 只读<br/>shell 进沙箱（Seatbelt / bubblewrap），环境变量白名单防泄密<br/>已有页面只许 edit 局部修改，禁止整页重写<br/>answer tools：模型用工具调用交结构化结论（VERDICT / FLAG）"]
    end

    L3 -->|每个阶段组装提示词| L2
    L2 -->|通过统一接口开会话| L1
    L1 -->|给会话装上工具| L0
```

一句话记住四层：

| 层 | 角色 | 职责 |
|---|---|---|
| L3 编排层 | 大脑 | 什么时候做什么 |
| L2 提示词层 | 话术 | 对模型说什么 |
| L1 运行时抽象 | 嘴巴和耳朵 | 跟哪个模型说 |
| L0 工具与护栏 | 手和镣铐 | 能做什么、不许做什么 |

---

## 3. 制作流水线：Director 状态机的一次完整运行

```mermaid
flowchart TB
    start([一句话 / 素材]) --> research["⓪ research（可选）<br/>先调研：读链接 / 搜网页<br/>失败不阻塞主线"]
    research --> storyboard["① storyboard<br/>planner 会话写 storyboard.json<br/>编排器自己跑分镜 lint，红了打回改（≤2 轮）"]
    storyboard --> approval{"◆ 用户审批 ◆<br/>唯一的真人关卡<br/>在对话里批准或提意见"}
    approval --> script["② script<br/>同一 planner 会话续写 script.js（口播）<br/>编排器校验：每页分镜都要有口播，缺了补"]
    script --> narrate["③a narrate<br/>TTS 配音，出真实字级时间戳"]
    script --> kit["③b kit（长片并行）<br/>先写本片组件库并验收<br/>通过的组件冻结，供所有页面复用"]
    narrate --> pages["④ pages<br/>每页一个 agent 会话，最多 10 页并行<br/>（详见图 4）"]
    kit --> pages
    pages --> review["⑤ review<br/>全片 lint + 全片截图<br/>review 会话只修跨页问题"]
    review --> render["⑥ render<br/>engine 渲染 1080p MP4<br/>+ SRT 字幕 + 发布文案"]
    render --> done([完成 · 可预览可导出])

    style approval fill:#E0B88A,stroke:#9C6A3A,color:#1C1917
```

**断点续跑**：每个阶段是独立 agent 会话，状态存在 `.studio/state.json`，会话记录存在 `.studio/sessions/`。中途停止或服务重启后，`run()` 从断掉的阶段继续，不重复花钱。

---

## 4. 核心闭环：一页纸的"画 → 检 → 修"（第 ④ 步内部）

```mermaid
flowchart TB
    draft["页面 agent 画初稿<br/>（写 pages/pNN.js）"] --> check

    subgraph check["编排器强制检查（不靠模型自觉）"]
        direction TB
        crash{"页面跑不起来<br/>（crash）？"}
        lint["engine lint<br/>布局 / 越界 / 字数 / 确定性…"]
        snap["Playwright 截 6 个关键时刻<br/>拼成 contact sheet（拼贴图）"]
        crash -->|不 crash| lint --> snap
    end

    crash -->|crash| crashfix["把报错直接还给页面 agent 修"] --> check

    snap --> reviewer["reviewer 会话（独立会话，不是画页面那位）<br/>看拼贴图 + lint 报告<br/>用 VERDICT 工具交结构化结论<br/>pass: true / false + problems[]"]

    reviewer --> verdict{"通过？"}
    verdict -->|是| ok["截缩略图 · git commit<br/>状态 ok → 下一页"]
    verdict -->|否| fix["拼贴图 + 问题清单还给页面 agent<br/>修改后再检（最多 3 轮）"]
    fix --> check
    verdict -->|3 轮仍不过| flagged["标记「需关注」<br/>不阻塞整部片"]

    style reviewer fill:#E0B88A,stroke:#9C6A3A,color:#1C1917
```

---

## 5. 多模型路由：一次运行最多四个模型分工

```mermaid
flowchart LR
    director["Director 编排器"] --> route{"model(name)<br/>按会话名路由"}

    route -->|"planner / reviser"| strong["主模型（最强）<br/>分镜 · 脚本 · 修改规划"]
    route -->|"page-* / review / kit"| cheap["pages 模型（快/便宜）<br/>画页面 + 全片检查<br/>占全片 ~90% token"]
    route -->|"check-*（reviewer）"| eyes["reviewer 模型<br/>看截图验收页面<br/>独立会话：自己画的不能自己验收"]
    route -->|"research"| small["research 模型（便宜）<br/>分镜前的资料调研"]

    cheap -.->|"某页反复失败时<br/>换回主模型重画（redraw）"| strong
```

**Anthropic 缓存预热**：10 页并行时，第一页先单独跑——等它把超长共享 system prompt 写进 prompt cache，其余 9 页才放行，省下 9 次缓存写入费。（Gemini / OpenAI 缓存免费，直接全并行。）

---

## 6. 事件流：Director 的一举一动如何出现在 UI 上

```mermaid
sequenceDiagram
    participant D as Director（编排器）
    participant S as 各阶段 agent 会话
    participant E as engine 工具
    participant SV as apps/cli 服务器
    participant U as UI 工作台

    D->>S: 开会话（system prompt + 工具）
    S-->>D: RuntimeEvent（text / thinking / tool_start / turn…）
    D->>SV: StudioEvent（stage / agent / page / cost / commit / approval…）
    SV-->>U: SSE 推送
    U->>U: 左侧过程流滚动 · 右侧时间线页面变色 · 花费实时跳动

    D->>E: lint / snap（截图）
    E-->>D: 问题清单 + contact sheet
    D->>S: 把检查结果还给会话修改

    D->>SV: approval 事件（分镜就绪）
    SV-->>U: 审批卡片
    U->>SV: 用户批准 / 提意见
    SV->>D: 继续流水线
```

UI 上看到的每一条消息、每一个工具步骤、每一分花费，都是 `StudioEvent` 的投影——事件流是编排器与界面之间唯一的通道。

---

## 7. 修订流程：片子完成后用户说"改一下第 3 页"

```mermaid
flowchart TB
    req([用户的修改要求]) --> direct{"直接点名了 ≤2 页<br/>且不涉及口播/字幕/时长？"}
    direct -->|是| skip["跳过规划，直达页面 agent"]
    direct -->|否| plan["planner 出修改计划<br/>.studio/revision.json<br/>（改哪几页、每页怎么改）"]
    skip --> redraw["只重画受影响的页<br/>（带着现有代码 + 修改说明）"]
    plan --> words{"动了 script.js？"}
    words -->|是| revoice["重新配音<br/>（按 voice 缓存，不重复花钱）"]
    words -->|否| redraw
    revoice --> redraw
    redraw --> review["全片复查（图 3 第 ⑤ 步）"]
    review --> done([预览更新 · mp4 等下次导出])

    redraw -.->|"代码 diff 为空（改了等于没改）"| tell["明确告诉用户：这页没改上，为什么"]
```

其余一切原样保留：其它页面、分镜、时间线、已渲染的片段。

---

## 设计哲学

**用工程护栏替代模型纪律**：模型只负责写；正确性由编排器通过 lint、确定性检查、截图验收、独立 reviewer、git 快照来保证。再弱一些的模型也能可靠出片。

- **runtime 抽象（L1）** 让"任何模型"成为可能；
- **Director 状态机（L3）** 让流水线可恢复、可观测、多模型各用其长；
- **每一步都是 git commit**，撤销就是 `git revert`；
- **事件流（StudioEvent → SSE）** 让 agent 的每一步对用户透明。
