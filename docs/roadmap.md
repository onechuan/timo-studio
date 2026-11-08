# 下一阶段实施顺序

1. **素材上传**：新增受限分片/流式上传 API，校验文件大小和允许类型；服务端生成 storageKey，写入 ObjectStorage、创建 Asset；鉴权、项目权限和失败清理先于开放公网。
2. **媒体探测**：上传后提交持久化 probe Job，Worker 用 FFprobe 安全参数数组读取格式、时长和尺寸，更新 Asset；隔离进程、限制资源和超时，拒绝损坏媒体。数据库毫秒精度转换统一向下/就近取整策略。
3. **基础剪辑**：先实现视频/图片顺序轨裁剪、排序与拼接，再音频轨和字幕编辑；复用当前 sourceIn/sourceOut/timelineStart/duration 语义，素材归属与 revision 冲突保留在 core；前端补预览及合并冲突 UI。
4. **MP4 导出**：Renderer 将合法 Timeline 转为 FFmpeg filter graph，由 Worker 运行；统一分辨率/fps、音频混音与字幕渲染，输出到 storage；真实进度、错误、重试、下载与播放器验证。测试真实小型媒体 fixture，不生成假文件。

其后接入 Pi AgentRuntime，通过受控业务工具产生分镜/素材/时间轴；TTS、ASR 独立 Provider，服务端持有凭据。再增加桌面壳与本地服务适配层，复用业务核心。开始重型任务前优先补 transactional outbox、取消、资源限额和恢复机制。
