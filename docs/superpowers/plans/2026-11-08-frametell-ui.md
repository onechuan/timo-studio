# Frametell-inspired TimoTV UI Implementation Plan

> **For agentic workers:** Use subagent-driven-development with bounded file ownership; primary agent integrates workbench and tests.

**Goal:** 将帧言的创作入口与导演 / 画面双栏布局接入已有 TimoTV 制作功能。

**Architecture:** 保留 API、Production 数据模型及状态操作。首页及通用外壳独立于 ProductionWorkspace；工作台提取分镜与口播编辑器、预览舞台等显示组件。

**Tech Stack:** React, TypeScript, Vite, Lucide, CSS, Playwright.

## Global Constraints
- 保留 TimoTV 品牌，沿用原来的深灰蓝底色与青柠绿强调色。
- 默认火山 TTS；不发起付费模型或语音调用验证。
- 保留任务锁、审批、修订号、失败重试和瞬断轮询恢复。
- 桌面双栏，390px 手机无横向溢出且所有操作可访问。
- 不提交现有未提交变更，不公开部署。

### Task 1: 首页与应用外壳
- [x] 在 tests/e2e/studio-ui.spec.ts 覆盖设置折叠、示例主题填入、页面布局，不新增主题切换。
- [x] App.tsx 换成紧凑顶栏；Projects.tsx 换成居中主题 composer + 最近项目；BriefFields.tsx 收起资料与高级设置；main.css 改成通用 design tokens。保持旧表单标签和功能，调整旧浏览器测试以展开设置。
- [x] Chrome 浏览器验证与 TypeScript 检查。

### Task 2: 导演与画面工作台
- [x] 浏览器测试先覆盖选择分镜、切换口播、审批脏数据保护、竖屏预览和移动切换。
- [x] ProductionWorkspace.tsx 保留数据逻辑，改成左侧导演过程与右侧画面舞台。新建 SceneEditor.tsx、FilmStage.tsx，production.css 只负责工作台。
- [x] Workspace.tsx 缩小项目标题栏并保留设置诊断。
- [x] 回归既有 production-recovery 测试。

### Task 3: 验证与交付
- [x] pnpm typecheck && pnpm build；Chrome 全部 e2e，必要时修复。
- [x] 桌面 / 手机截图并目检；检查已生成和空状态、画幅、焦点、无横向溢出。
- [x] 独立代码评审并修复阻塞问题；更新验证文档，保持服务运行。
