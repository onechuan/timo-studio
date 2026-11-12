# TimoTV 主题生成视频 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有工程中实现主题或文本资料 → 分镜审批 → 自动口播 → 真实配音 → 确定性模板画面 → 预览与 MP4 导出。

**Architecture:** 保留现有项目、时间轴、PostgreSQL 和 BullMQ。新增独立 Production 文档（修订号、阶段、场景、口播、时间与产物）及带类型任务。API 只提交，worker 通过导演、语音和渲染适配器执行。前端消费同一份 Production，并保留现有项目管理。

**Tech Stack:** TypeScript、React/Vite、Hono、Prisma/PostgreSQL、BullMQ/Redis、Pi、Playwright、FFmpeg。

## Global Constraints

- 不覆盖工作区已有修改；原项目 API 和诊断保持兼容。
- 不要求用户输入讲稿；主题或文本资料即可发起。
- 分镜批准前不得执行配音；模型和 TTS 缺配置时明确报错。
- 不发起付费模型或 TTS 请求；测试注入只限测试，界面不使用假产物。
- 本机 macOS 可用系统语音逐句合成，通过真实音频时长得到句级时间；其他平台使用已配置 ElevenLabs。
- 时间使用整数毫秒；模型结构校验、修订冲突、任务串行、路径约束必须生效。
- 本轮模板画面支持横竖屏和三种配色，不生成任意可执行代码。资料上传首版支持 UTF-8 文本与 Markdown。

## Task 1: 制作契约与状态规则

Files: packages/contracts/src/production.ts; tests/production.test.ts。
- [x] 先测试非法 cue、重复 ID、超出配音时长和阶段迁移约束，确认失败。
- [x] 定义输入、分镜、场景、cue、配音时间、版本、产物与任务类型；实现校验。

## Task 2: 配音与确定性画面渲染

Files: packages/speech/src/film.ts; packages/renderer/src/film.ts; tests/film.test.ts。
- [x] 测试 SRT、转义、时间定位与缓存键；确认失败。
- [x] 实现 local say / ElevenLabs 适配、逐句合成与 FFmpeg 合并；错误不产生成功状态。
- [x] 同一 HTML 时间函数供预览和截图导出使用；生成真实 MP4 与字幕。

## Task 3: 导演与持久化后台流程

Files: packages/agent/src/director.ts; packages/db/src/production.ts; apps/api/src/routes/production.ts; apps/worker/src/handlers/production.ts。
- [x] 测试审批关卡、无模型配置、revision 冲突、任务互斥和失败重试；确认失败。
- [x] 用 Pi 调模型，结构化分镜与脚本由不同指令约束；模型仅提交 JSON，不开放 shell。
- [x] 新增 Production 数据表与迁移；保留既有 ProjectRepository 接口。
- [x] API 支持创建、更新、规划、审批、继续制作、导出、状态和产物读取；worker 更新阶段并可恢复。

## Task 4: 网站主流程

Files: apps/web/src/features/projects/Projects.tsx; apps/web/src/features/production/ProductionWorkspace.tsx; apps/web/src/styles/production.css。
- [x] 浏览器测试从主题创建、分镜审批、口播显示、缺配置提示和刷新恢复。
- [x] 保留现有风格、项目标题修改与诊断，新增主题/文本资料输入、分镜、稿件、预览、导出。

## Task 5: 集成和交付

- [x] pnpm build、pnpm typecheck、pnpm test。
- [x] 运行数据库/队列集成测试；通过测试注入模型覆盖审批到导出，系统语音和浏览器/FFmpeg 真执行。
- [x] 浏览器检查真实首页、项目制作页面、窄屏与错误状态；启动项目供用户使用。
- [x] 更新开发文档和 .env.example，记录配置与已验证范围。

## 交付说明

实现和验证范围：主题/文本资料输入、分镜审批、自动口播、真实句级配音、三套模板配色、横竖屏预览、MP4/SRT、编辑重配与任务恢复。模型本地兼容端点通过 Pi 实际工具调用验证；端到端测试注入测试模型，仅用于测试，系统语音、数据库、Redis、Worker、Chrome 与 FFmpeg 均真实运行。

程序进行结构、ID、时间连续性与产物检查。独立视觉模型验收、自由插画代码、PDF/PPT 解析和真实素材剪辑未在本轮接入，已在架构与后续路线明确标注。
