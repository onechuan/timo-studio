# 连续动画与视觉审片实施计划

> 执行：使用测试先行与独立领域并行工作，主代理负责接口集成和最终验收。用户已批准设计与实现，不再次请求执行许可。

**Goal:** 在现有制作流水线接入连续动画和可恢复的关键帧审片修正。

**Architecture:** contracts 定义可版本化画面和页级审片；renderer 执行纯时间求值和真实浏览器采样；agent 分别创作和读图；core 编排检查点，worker 注入能力。服务配置、报告和操作接入现有页面。

**Tech Stack:** TypeScript、Zod、Pi、SVG、Playwright、Hono、React、Prisma、BullMQ。

## 约束

- 保留已有未提交修改，不提交、不重置、不迁移原作品。
- 兼容 version 1；仅主动重绘生成 version 2。
- 每页最多 24 张关键帧，最多两次自动修正；无识图服务时明确未审片。
- 不改变口播和音频；同一时间求值一致；所有检查点受 revision/jobId 所有权保护。
- 模型错误不当成通过；真实识图验证需要用户配置可用服务。

## Task 1: 动画协议和绘图库

Files: contracts/src/artwork.ts、renderer/src/artwork.ts、新增 motion.ts；agent/src/director/index.ts、layout.ts、prompts/PAGE.md；tests/artwork-motion.test.ts。

接口：保留 sceneArtworkSchema / compileArtwork / renderArtworkFrame；增加 version 2、父子分组、显式层级与关键帧，cueId 时间锚点；illustrateFilmScene 增加可选 feedback 参数用于修正原页。

- [x] 先写移动/状态/形变/倒退求值/非法轨道测试，运行 `pnpm exec vitest run tests/artwork-motion.test.ts` 观察失败。
- [x] 实现 schema、时间编译、图元及纯函数求值，保持 v1 测试。
- [x] 更新绘图规则与校验，修正保留已有候选并接收问题反馈。
- [x] 运行动画与现有绘图测试、包类型检查，记录结果。

## Task 2: 独立图片模型配置与接口

Files: contracts/src/settings.ts、storage/src/settings.ts、agent/src/runtime/pi.ts、新增 vision.ts、web/features/settings、api/routes/settings.ts；tests/vision-runtime.test.ts、settings.test.ts。

接口：export reviewModelConfig(env) 返回 enabled/configured/model/provider 等；export piVisionGenerator(env) 返回 generate(system,user,images,signal)，images 为 {mimeType,data} 的 base64 数组，结果结构与 JsonGenerator 相同；凭据使用 TIMO_REVIEW_* 独立环境键。

- [x] 写凭据隔离/保留/清除与实际图片请求测试，先观察缺失能力失败。
- [x] 扩展设置持久化、页面和 Pi 图片输入，旧 JSON 设置兼容。
- [x] 接入图片探测接口；失败脱敏，不能退回文本模式假装成功。
- [x] 运行设置及模型请求测试，记录结果。

## Task 3: 关键帧测量与页级审片循环

Files: 新增 contracts/src/review.ts、renderer/src/review.ts、agent/src/review.ts；core/production/runner.ts、worker/handlers/production.ts、tests/visual-review.test.ts、tests/review-runner.test.ts。

接口：SceneReview 含 fingerprint/status/round/frames/issues；captureSceneReview(p,index,root,signal) 返回帧及硬检查结果；reviewFilmScene 接收截图+口播并返回结构化问题；runner 的 reviewScene/repairScene 可选操作保持老测试注入兼容。

- [x] 写采样上限/超量覆盖、候选 hash 绑定、失败服务、两轮上限和中断恢复测试，先运行失败。
- [x] 实现真实浏览器截图、字体等待、变换后边界与文本测量，生成本项目登记资产。
- [x] 实现纯内容指纹，检查和修正后各自 checkpoint，持久化报告；新配置使旧报告失效。
- [x] 运行单元和真实浏览器截图检查。

## Task 4: 操作、失效规则与报告 UI

Files: contracts/production.ts、core/production/service.ts、db/production.ts、api/routes/production.ts、web/features/production；tests/production-service.test.ts、production-files.test.ts、e2e/studio-workbench.spec.ts。

- [x] 写重试审片/只修本页/接受本页与文件白名单测试，先运行失败。
- [x] 用现有 illustrate 队列承载检查/修正模式，新增页级操作参数，避免数据库 Job 枚举迁移。
- [x] 让换画幅/风格/声音使相应审片失效；已生成音频和未修改页继续复用。
- [x] 显示页级状态、截图、时间跳转和问题；待人工确认需明确接受才能导出。
- [x] 运行 API、恢复和桌面/手机测试。

## Task 5: 整体验证与代码审查

- [x] 构建全部包、类型检查、单元测试与相关集成测试。
- [x] 使用独立副本验证横竖版动画、seek、截图、MP4 一致；验证原作品与音频哈希未变。
- [x] 独立代码审查覆盖新接口、版本兼容、权限边界和检查点恢复；修复实质性问题。
- [x] 更新开发/验证记录；说明真实识图服务是否已配置及真实验证范围。
