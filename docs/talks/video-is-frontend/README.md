# 视频这活儿越来越像前端了

这组资料用于围绕 Timo TV 分享“视频制作越来越像前端工程”这一主题。内容覆盖导演分镜、口播与配音、剪辑、Agent 提示词、Director Harness、多 Agent 协作，以及逐页检查和全片 Review。

## 交付入口

- [完整讲稿](视频这活儿越来越像前端了-完整讲稿.md)：适合继续修改内容、提取文章或准备现场讲述。
- [分享讲稿 Word 版](deliverables/视频这活儿越来越像前端了-分享讲稿.docx)：包含配图和 Agent Harness 架构图，可直接阅读或分发。
- [演讲结构笔记](演讲结构笔记.md)：较短的选题拆解、时间安排与现场演示建议。

## 架构与 Workflow

- [Director Harness 与多 Agent 协作架构](diagrams/agent-harness.html)
- [第一层 Workflow：从想法到可预览成片](diagrams/whole-film-workflow.html)
- [第二层 Workflow：单页生成、检查与返工闭环](diagrams/single-page-workflow.html)
- [图表索引与可编辑源文件](diagrams/README.md)

## 研究笔记

- [架构笔记](notes/architecture/README.md)：系统分层、Harness、状态机、多 Agent 路由与质量闭环。
- [提示词中文笔记](notes/prompts/README.md)：Planner、Page Agent、Reviewer 和 Research Agent 的完整角色约束。

## 目录说明

```text
video-is-frontend/
├── README.md
├── 视频这活儿越来越像前端了-完整讲稿.md
├── 演讲结构笔记.md
├── deliverables/        # 可分发的 DOCX
├── assets/              # 讲稿配图与架构截图
├── diagrams/            # 可交互 HTML 图和候选源文件
├── notes/               # 架构与提示词研究笔记
└── build/               # DOCX 构建脚本
```

## 来源说明

这些资料基于参考实现的源码与文档整理，并归档到 Timo TV 仓库，作为产品设计和技术分享材料。架构图对应的参考实现源码快照 revision 为 `6145f7e3482628543bd6f2d68fe3b618d366213a`。它们用于解释设计思想，不替代 Timo TV 当前的产品架构文档。
