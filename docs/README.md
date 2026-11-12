# TimoTV 项目知识库

`docs/` 是项目文档的唯一入口。本页说明该读什么、哪些是持续维护的现行文档。

## 推荐阅读路径

| 目标               | 阅读顺序                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| 第一次了解项目     | [根 README](../README.md) → [架构说明](architecture.md) → [开发指南](development.md)                     |
| 了解当前进度与证据 | [验证记录](verification.md) → [路线图](roadmap.md)                                                       |
| 理解绘图引擎       | [V3 集成说明](verification/drawing-engine-v3-integration.md) → [引擎修改清单](DRAWING_ENGINE_CHANGES.md) |
| 确认许可与来源     | [开源说明](OPEN_SOURCE.md) → [第三方声明](../THIRD_PARTY_NOTICES.md)                                     |

## 现行文档

现行文档随代码更新，内容应始终与仓库当前状态一致。

| 文档                                                         | 内容                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| [根 README](../README.md)                                    | 产品概览、运行方式、常用命令、目录结构、开源许可        |
| [架构说明](architecture.md)                                  | 分层、数据流、包边界、当前能力边界与扩展顺序            |
| [开发指南](development.md)                                   | 本地环境、数据库与 Redis、模型/配音配置、测试与触发方式 |
| [验证记录](verification.md)                                  | 按时间追加的验证结果、已覆盖范围和证据边界              |
| [V3 集成说明](verification/drawing-engine-v3-integration.md) | 内置绘图引擎的链路、兼容性和集成验证范围                |
| [路线图](roadmap.md)                                         | 发布状态、受控开关和后续工作                            |
| [引擎修改清单](DRAWING_ENGINE_CHANGES.md)                    | 内置引擎的已审阅修改；来源与许可条款见第三方声明        |
| [开源说明](OPEN_SOURCE.md)                                   | AGPL-3.0 源码提供义务与构建方式                         |
| [第三方声明](../THIRD_PARTY_NOTICES.md)                      | 引擎来源及其依赖的版权与许可声明                        |

> 许可证要求保留的归属声明集中在 [第三方声明](../THIRD_PARTY_NOTICES.md)、[开源说明](OPEN_SOURCE.md)、根 `LICENSE` 和各 style 包的 `NOTICE.md` 中，修订文档时不要删除或合并这些文件。

## 术语与改名记录

| 旧名称             | 当前名称                                               | 说明                                                                  |
| ------------------ | ------------------------------------------------------ | --------------------------------------------------------------------- |
| 旧受控管线枚举值   | `drawing-engine-v3`                                    | 读取旧持久化值时归一化为 `legacy-v3`                                  |
| 旧管线环境变量     | `TIMOTV_VIDEO_PIPELINE`                                | 不再接受 `1`/`0`，改为具体管线值                                      |
| 上游同步与审计脚本 | 无                                                     | 引擎源码内置于 `packages/drawing-engine`，不再同步或审计上游          |
| 视频效果基准脚本   | 无                                                     | 工具已移除；发布前改为真实素材人工验收                                |
| 旧引擎补丁记录     | [DRAWING_ENGINE_CHANGES.md](DRAWING_ENGINE_CHANGES.md) | 改为本地修改清单                                                      |
| 旧基线验证文档     | 已删除                                                 | 内容并入 [V3 集成说明](verification/drawing-engine-v3-integration.md) |

## 维护约定

1. 现行文档直接修改；本仓库不保存历史设计与计划，需要追溯背景时使用 Git 历史。
2. 新设计或计划按 `YYYY-MM-DD-topic` 命名，放入 `docs/` 并在本页索引。
3. 验证结果追加到 `verification.md`，注明日期、命令、结果和未覆盖范围；不要覆盖旧条目。
4. 文档中的命令、环境变量和配置默认值必须与 `package.json`、`.env.example` 和代码保持一致。
5. 发布状态或默认值变化时，同步更新 `README.md`、`roadmap.md`、`verification.md` 和本索引。
6. `docs/talks/` 是本地演讲物料，已在 `.gitignore` 中排除，不属于仓库知识库。
7. 新增、移动或删除文档后，更新本页的索引和术语表。
