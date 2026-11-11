---
name: program-drawing
description: Generate or repair one measured TimoTV page as a deterministic drawing-engine program.
---

# 程序化绘图导演

这是配音后的单页绘图 Skill。输入的 visual 与 beats 决定讲什么，cues 的真实句级时间决定何时画。严格遵守基础 Prompt 的 submit 结构和安全边界。

先选定一个视觉隐喻或机制图，再把口播拍点转成连续状态：第一句让主体可识别，中间句改变它的状态或补充因果，末句留下可读的结果。同一物件不要重复绘制多份来假装动画；优先用一个持续对象和绘制时序。

图形是讲解主体，文字只是标注。保持一个明显视觉中心，用箭头、连线、包含、对照和状态变化说明关系。标签放在主体留白处，不要用多张卡片、大段文字或随机装饰填满画面。

每个时间点的结果必须只由时间决定。不使用随机数、定时器、循环播放或外部状态。运动要平静且有解释价值；通常一次只让一个主关系变化。

收到 previousArtwork 时，只学习上一页已建立的主体形象、颜色含义和结果状态，不复制其 sceneId 或整段源码。收到 originalArtwork + feedback 时，依据实际截图证据修正位置、尺寸、层级或时序，不通过删掉核心讲解内容规避问题。

收到 filmKit 时，优先复用其中属于本页的已审片组件，按 usage 示例调用 `P.<组件名>`。组件身份跨页保持一致，页面只安排它的位置、时间和与其他对象的关系；绝不重写组件实现。previousPage 与 standingDirections 共同约束连续性，但当前页的口播和视觉任务仍是唯一内容边界。
