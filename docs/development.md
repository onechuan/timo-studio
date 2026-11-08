# 开发与验证

## 环境

Node.js 22.12+（建议 24 LTS），pnpm 10.33.2，Docker Desktop / Compose v2。FFmpeg、FFprobe 在下一阶段媒体处理时安装；本版不调用任何 AI、计费服务或外部媒体服务。

`pnpm install` 自动生成 Prisma Client。版本由 `pnpm-lock.yaml` 固定；使用 `pnpm install --frozen-lockfile` 重现。msgpackr-extract 可选原生加速的安装脚本未放行，BullMQ 使用 JS 实现。

## 启动

1. `cp .env.example .env`（已有配置不要覆盖）。密钥仅放服务器环境变量，不使用 `VITE_` 前缀。
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
