# Agent 视频生产架构笔记

这里保存分享稿背后的技术笔记：系统分层、Director 状态机、Agent Runtime、工具护栏、多模型路由、逐页验收与修订流程。

- [整体架构说明](timotv-architecture.zh-CN.md)
- [架构与 Workflow 图解](agent-harness-and-workflows.zh-CN.md)

笔记沿用参考实现的模块名称，方便和原始实现对照。用于 Timo TV 时，重点关注可迁移的 Harness、状态机、会话边界和 Review 机制，不应把包路径直接当作 Timo TV 当前代码结构。
