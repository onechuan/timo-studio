# 初始化验证记录

验证日期：2026-11-08（Asia/Shanghai）。本机 Node 24.19.0、pnpm 10.33.2、Docker Desktop。

| 检查                                    | 实际结果                                                              |
| --------------------------------------- | --------------------------------------------------------------------- |
| pnpm install / --frozen-lockfile        | 成功；Prisma Client 自动生成                                          |
| pnpm infra:up                           | PostgreSQL 16 与 Redis 7 均 healthy                                   |
| pnpm db:migrate                         | 初始迁移成功                                                          |
| pnpm build                              | 12 个 workspace 全部构建成功                                          |
| pnpm typecheck                          | 全 workspace 及测试配置通过                                           |
| pnpm test                               | 12 项通过（时间轴 10、API 错误 2）                                    |
| pnpm test:integration                   | 5 项通过，使用真实 PostgreSQL、Redis 和独立 Worker 进程               |
| PLAYWRIGHT_CHANNEL=chrome pnpm test:e2e | 桌面与 390px 窄屏共 2 项通过                                          |
| API health                              | 200，真实检查数据库与 Redis                                           |
| 故障注入                                | 分别停止本项目 Redis、PostgreSQL：health 均返回 503；恢复后均返回 200 |
| 缺失配置                                | 空 DATABASE_URL / REDIS_URL 启动被拒绝，CONFIG_MISSING                |

浏览器覆盖创建项目、打开详情、修改标题、保存时间轴、后台诊断成功、刷新持久化、返回列表再打开，并检查没有横向溢出。已人工检查桌面和窄屏截图。测试项目已清理，没有预置虚构项目。

环境处理：启动原本未运行的 Docker Desktop；55432 已被其他服务占用，因此使用 55439。Playwright Chromium 下载较慢，本轮明确使用本机已安装的 Chrome 完成测试。

没有部署公网，没有请求付费 AI。上传、媒体预览/剪辑、配音、字幕编辑和视频导出均未实现；界面明确标注，未用模拟产物替代。
