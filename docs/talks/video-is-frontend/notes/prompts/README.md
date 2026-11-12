# 视频 Agent 提示词中文笔记

这四份笔记展示不同 Agent 如何通过任务边界、输入范围、工具权限、结构化交付和停止条件协作。它们是阅读材料，不是 Timo TV 当前运行时会直接加载的模板。

| 文件 | 角色 | 核心职责 |
|---|---|---|
| [PLANNER.md](PLANNER.md) | Planner / Director Agent | 规划分镜并编写口播 |
| [PAGE.md](PAGE.md) | Page Agent | 将单页分镜转换成可播放画面 |
| [REVIEW.md](REVIEW.md) | Reviewer Agent | 查看实际画面并提交结构化 verdict |
| [RESEARCH.md](RESEARCH.md) | Research Agent | 收集真实、具体、可视化且有来源的资料 |

阅读时重点观察五类约束：

1. 每个 Agent 只完成当前阶段，不自行推进整条流水线。
2. 每次只读取完成任务所需的最小上下文。
3. Page Agent 可以修改页面，Reviewer 没有文件修改能力。
4. 确定性检查由普通程序执行，不依赖模型自觉。
5. verdict、problems 和 sources 使用结构化结果交回 Harness。
