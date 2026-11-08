# TimoTV

中文优先的 AI 视频工作室。当前版本完成项目管理、时间轴契约与真实后台诊断闭环，尚未实现媒体编辑器。

```sh
cp .env.example .env
pnpm install --frozen-lockfile
pnpm infra:up
pnpm db:migrate
pnpm dev
```

网站 http://127.0.0.1:5173 ，API http://127.0.0.1:3001/api/health 。

详见 [开发指南](docs/development.md)、[架构](docs/architecture.md)、[路线图](docs/roadmap.md)。
