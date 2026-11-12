# 后续实施顺序

已实现主题/文本资料 → Pi 分镜 → 用户确认 → 自动口播 → 配音 → 模板预览 → MP4/SRT 导出，以及对已生成成片的裁剪、删除、重排、字幕跟随和逐段音量/静音。以下为外部真实素材剪辑与质量扩展。

1. **素材上传**：新增受限分片/流式上传 API，校验文件大小和允许类型；服务端生成 storageKey，写入 ObjectStorage、创建 Asset；鉴权、项目权限和失败清理先于开放公网。
2. **媒体探测**：上传后提交持久化 probe Job，Worker 用 FFprobe 安全参数数组读取格式、时长和尺寸，更新 Asset；隔离进程、限制资源和超时，拒绝损坏媒体。数据库毫秒精度转换统一向下/就近取整策略。
3. **外部素材剪辑**：在成片剪辑已验证的 sourceIn/sourceOut/timelineStart/duration 语义上接入上传素材与图片轨，补素材归属、revision 冲突和合并冲突 UI；音频轨与字幕编辑复用同一派生时间线。
4. **外部素材导出**：Renderer 将合法外部素材 Timeline 转为 FFmpeg filter graph，由 Worker 运行；统一分辨率/fps、音频混音与字幕渲染，输出到 storage；真实进度、错误、重试、下载与播放器验证。测试真实小型媒体 fixture，不生成假文件。

继续扩展 Pi 工具以选择真实素材、编辑剪辑时间轴；新增 ASR，完善视觉验收和字幕编辑。再增加桌面壳与本地服务适配层，复用业务核心。开始重型任务前优先补 transactional outbox、取消、资源限额和恢复机制。

## 绘图引擎 V3 品质管线发布状态

绘图引擎源码已内置于 `packages/drawing-engine`，不再依赖外部仓库、同步脚本或上游审计。Film Kit、页级/全片审片、统一预览/导出运行时和受控开关均已完成；本机通过 `TIMOTV_VIDEO_PIPELINE=drawing-engine-v3` 显式启用。全局默认切换前仍需使用固定模型和音色完成真实人工验收，再由维护者把持久化默认从 `legacy-v3` 改为 `drawing-engine-v3`。
