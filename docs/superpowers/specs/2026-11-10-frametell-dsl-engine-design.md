# TimoTV 可编程绘画 DSL 与视频引擎设计

## 目标

在保留 TimoTV 现有项目管理、服务配置、DeepSeek 导演、火山 TTS、PostgreSQL、BullMQ、任务恢复和网页工作台的前提下，参考并移植帧言成熟的页面绘图能力，替换当前以 `artwork.elements` 为中心的受限 SVG 图表生成链路。

完成状态不是“能够渲染一个 DSL 示例”，而是：用户输入主题后，TimoTV 能生成页面绘图程序，按真实口播时序预览，通过布局与视觉审片回修，并导出带声音和字幕的 MP4。当前“马斯克的第一性原理”项目必须作为端到端验收样本。

## 许可与来源

帧言仓库及 `@frametell/engine` 使用 `AGPL-3.0-only`。TimoTV 接受 AGPL 路线，移植文件保留原作者、版权和许可证声明，并在仓库中加入完整 AGPL 文本、第三方声明和源码获取入口。

TimoTV 不复制帧言的产品名称、图标、网页 UI、项目管理、模型配置、TTS 或品牌文案。移植范围是绘画运行时、风格包、通用组件、页面检查工具及与绘图直接相关的 Agent 方法。后续 TimoTV 自己新增的 DSL 和适配层也按仓库统一许可证发布。

## 现状与根因

当前画面由 DeepSeek 输出严格 JSON：对象类型限于插画、矩形、椭圆、路径、箭头、文字和三个状态组件。渲染器将它们确定性编译为 SVG。该设计便于 Zod 校验和恢复，但模型无法表达动态几何、逐笔书写、镜头、实时图形、素材、复杂组件或页面级代码，因此倾向选择矩形、标签和箭头。

帧言的页面 Agent 输出 `pages/pNN.js`，页面是时间的纯函数。Agent 可以调用 Rough.js 图元、逐字文字、相机、组件、动态几何、Canvas、3D 和媒体 API；服务器对实际页面运行 lint、截取关键帧，并把截图交给独立审片 Agent，最多回修两轮。决定画面上限的是这个运行时和闭环，而不只是提示词。

## 总体架构

新增 `packages/drawing-engine`，作为浏览器端确定性绘画运行时。第一步从帧言 `packages/engine` 移植基线，保持行为和示例通过；之后在独立提交中完成 TimoTV 命名、TypeScript 边界、CSP 和存储适配。不得在移植同时大规模改写算法，以免无法判断视觉或渲染差异来自哪里。

```text
Storyboard + Script + measured cues
                 │
                 ▼
        Page Agent (Pi / DeepSeek)
                 │  SceneProgramV3
                 ▼
  @timotv/drawing-engine sandbox runtime
       │         │             │
       │         │             └─ style packs / components / media
       │         └─ renderAt(localMs)
       └─ lint + deterministic snapshots
                 │
                 ▼
       layout report + contact sheet
                 │
                 ▼
          independent reviewer
                 │ fail, max 2 fixes
                 └──────────────► Page Agent
                 │ pass / accepted
                 ▼
      preview HTML ──► Chrome frames ──► FFmpeg MP4
```

TimoTV 的 `core` 继续拥有阶段状态和检查点；`worker` 继续组装 Agent、TTS、存储和渲染端口；绘画引擎不访问数据库、Redis、模型密钥或外部网络。

## 数据契约

`SceneArtwork` 增加 V3 分支，不删除 V1/V2：

```ts
type SceneProgramV3 = {
  version: 3;
  runtime: 'timotv-dsl-1';
  intent: string;
  source: string;
  sourceHash: string;
  style: string;
  extras: string[];
};
```

- `source` 是一个页面注册程序，只允许调用沙箱注入的 `TIMO.visual(sceneId, draw)` 和绘画 API。
- `sourceHash` 由服务端根据 UTF-8 源码计算，模型不能指定最终值；用于缓存、审片指纹和恢复。
- `extras` 只能引用绘画引擎发布清单中的组件 ID，不能是任意文件路径或 URL。
- V1/V2 项目继续使用现有 SVG 渲染器；新绘图任务默认生成 V3。用户可逐页重绘旧项目完成迁移。
- 数据库存储 V3 源码和元数据，生成的预览、截图、音频和 MP4 仍保存在项目对象存储中。

## DSL 能力

页面程序必须是局部时间 `t` 的纯函数。第一版完整接入帧言绘画 API 的可移植能力，而不是只实现几个示例方法：

- 时序：`P.c`、`P.cw`、`P.ce`、`P.endT`，与真实句级时间和可用的字词时间对齐。
- 文字：标题、逐字书写、短标签、代码、公式、圈画、下划线和标记。
- 图形：Rough.js 矩形、圆、椭圆、路径、曲线、箭头和固定种子动态图形。
- 动画：出现、隐藏、移动、缩放、旋转、颜色和状态随时间变化。
- 镜头：push、pan、slam、shake、back，并保持标题和字幕安全区。
- 数据图形：柱图、滑杆、计数器、网格、流程、状态机、序列图和已有通用组件。
- 场景：分组、背景、层级、跨 cue 连续状态和页面末态保持。
- 媒体：受控本地图片、帧序列和浏览器截图；不允许页面自行联网。
- 可选能力：Canvas、KaTeX 和 Three.js，由风格清单显式启用。

运行时采用 1920×1080 横版和 1080×1920 竖版标准画布。预览和导出调用同一个 `renderAt`，不依赖播放历史；随机性必须使用固定种子。

## 风格和组件

首先原样移植帧言已有风格包、语法卡、示例页和组件库，建立视觉回归基线。移植范围是 `_fonts` 共享字体资源，以及当前仓库中的全部 42 个风格目录：blueprint、broadsheet、chalkboard、chat、clay、collage、cosmos、crayon、diorama、engraving、exploded、free、globe、ink-wash、inked、instrument、isometric、isotype、manga、mascot、math、metro、midcentury、molecule、neon、old-map、one-line、papercut、pixel、pop、rubberhose、screencast、shadow-puppet、study、swiss、tech-dark、tutorial、ukiyoe、vector、warm-story、watercolor、whiteboard；同时移植 `engine/lib` 的全部通用组件。以后帧言新增的风格不在本次验收范围内。

每个风格由以下部分组成：

- `GRAMMAR.md`：导演和页面 Agent 的视觉语法。
- `style.css` / `style.js`：颜色、纹理、笔触和背景运行时。
- `kit.js`：风格专有角色、道具和场景组件。
- `example/`：可运行基准项目和页面代码。

TimoTV 后续优化采用新增风格或新增 TimoTV 组件，不直接破坏已通过的迁移基线。跨页复用的主体进入 Film Kit，只绘制一次并由各页面调用，避免同一火箭在不同页形态和颜色漂移。

## Agent 生成方式

分镜和口播阶段继续使用现有 Pi submit 工具和结构化数据。页面阶段改为返回一个结构化包装，其中 `source` 是完整 DSL 程序；模型不获得 Node 文件系统、shell、数据库或网络工具。

页面系统提示词由以下内容组合：

1. 页面职责与安全规则。
2. 当前风格 `GRAMMAR.md`。
3. DSL API 说明。
4. 可用组件签名。
5. 当前风格的已通过示例页。
6. 本页分镜、beats、真实 cues、上一页末态和 Film Kit。
7. 审片回修时的当前源码、问题时刻和关键帧。

模型第一次必须提交完整页面；回修只修改问题涉及的源码。源码长度、语法和注册场景 ID 在进入运行时前校验。结构化输出只包装代码和摘要，不再把画面拆成几十个 JSON 坐标对象。

## 沙箱与安全

生成源码属于不可信输入：

- 在无 Node API 的浏览器 iframe 和无外部网络的 Playwright 页面中执行。
- 预览 HTML 使用严格 CSP：默认拒绝，脚本只允许内联构建产物，`connect-src 'none'`，媒体只允许登记的本地产物。
- iframe 使用 `sandbox="allow-scripts"`，不启用 same-origin、表单、弹窗、下载或顶层导航权限。
- 源码禁止动态 `import`、`fetch`、XHR、WebSocket、Worker、storage、父窗口访问、`eval` 和 `Function`；运行时冻结暴露的 API。
- 页面执行设置时间、DOM 节点和内存预算；异常转成可恢复的页级失败。
- extras、图片和视频仅能通过服务端登记的逻辑 ID 解析，真实路径仍由对象存储白名单校验。

## 检查与视觉审片

每个 V3 页面最多执行三次检查：初稿一次，失败后最多两轮回修。

每轮流程固定为：

1. 语法和 API 白名单检查。
2. 在 Chrome 中按首帧、cue 边界、动作中点和末帧运行页面。
3. 检测运行异常、非确定性、空首帧/末帧、越界、字幕区、文字过小、文本裁切和明显遮挡。
4. 生成带时间标签的关键帧联系表。
5. 独立视觉模型检查主体、构图、视觉层级、风格、口播对应关系和跨帧连续性。
6. 将必须修复的问题和联系表交回原页面 Agent。

视觉审片未配置时，页面只能标记为 `layout_checked`，不能显示“视觉通过”。存在 must-fix 运行或布局错误时不得导出；只有视觉建议仍可由用户明确接受后导出。全片合成前再生成跨页联系表，检查重复构图、主体漂移、色义不一致和页面切换。

## 预览与视频导出

`@timotv/renderer` 保留现有播放器和 FFmpeg 接口，但画面源增加 V3 适配器：

- V1/V2：继续调用 `renderArtworkFrame`。
- V3：加载 drawing-engine、风格包、extras 和页面源码，调用 `renderAt(globalMs)`。
- 播放、seek、暂停和导出均使用同一全局时间函数。
- 音频仍由火山 TTS 合并，字幕仍来自真实 cue 时间。
- 导出使用 Playwright 逐帧截图和 FFmpeg 编码；播放器控件、审片标记和调试 UI 不进入视频帧。
- 渲染任务从持久化 production revision 读取固定快照，旧任务不能覆盖新版本。

## 迁移步骤

### 阶段一：引擎基线

- 新增许可证与第三方声明。
- 移植绘画 runtime、tools、styles、lib、vendor 和示例。
- 建立独立包构建和测试。
- 运行帧言示例并对关键帧做像素级或感知级回归，确认迁移前后视觉一致。

### 阶段二：TimoTV V3 集成

- 增加 V3 contract、存储和旧版本兼容。
- 将 drawing-engine 接入预览、seek、截图和 MP4 导出。
- 建立 CSP、资源清单和沙箱执行边界。

### 阶段三：页面 Agent 与回修

- 迁移并适配 PAGE、API、LIB、风格语法和示例注入。
- 让 Pi 页面 Agent 输出完整 DSL 源码。
- 接入 lint、关键帧联系表、独立视觉审片和两轮回修。
- 建立跨页 Film Kit 与全片检查。

### 阶段四：当前项目验收

- 以“马斯克的第一性原理”重新规划或沿用已批准口播，生成全部 V3 页面。
- 浏览器检查播放、暂停、seek、逐页审片和断点恢复。
- 导出 MP4，确认时长、音频、字幕、画幅和关键画面。
- 将结果与帧言 DeepSeek 黑板示例进行人工对照；主体大小、粉笔质感、书写过程、构图变化和镜头必须达到同一设计语言，而不是方框流程图。

## 测试策略

- 单元测试：时间函数、固定随机、图元输出、相机矩阵、V3 schema、源码限制和资源解析。
- 兼容测试：现有 V1/V2 fixtures、旧项目预览和导出保持工作。
- 视觉回归：每个迁移风格至少一个官方示例，在固定 Chromium、字体和时间点比较关键帧。
- 集成测试：Agent 输出源码→检查→回修→检查点恢复→预览。
- 安全测试：网络、父窗口、存储、动态代码、任意路径和未登记 extras 均不可访问。
- E2E：当前第一性原理项目从重绘到 MP4；播放器暂停、seek 和导出文件均在浏览器中验证。

所有新增行为遵循测试先行：先写失败测试并观察预期失败，再实现最小代码使其通过。移植的原始基线先以帧言示例作为黑盒行为测试，完成等价后再重构。

## 不做的事情

- 不以增加更多 JSON 图元或提示词作为 V3 主方案。
- 不删除 V1/V2，避免现有项目无法打开。
- 不让模型获得任意 shell、文件系统、数据库或网络权限。
- 不把帧言 UI、品牌、项目存储或 TTS 覆盖到 TimoTV。
- 不在完成视觉等价之前同时重写所有引擎内部实现。

## 验收标准

1. 帧言迁移示例在 TimoTV drawing-engine 中可构建、预览和截图，关键帧视觉等价。
2. V1/V2 项目继续可预览和导出。
3. V3 页面能够使用真实 cue 时序、Rough.js 图形、组件和镜头，并可任意 seek 得到一致画面。
4. 生成源码无法访问网络、Node、父窗口、任意本地路径或未登记资源。
5. 每页实际执行 lint、关键帧截图和最多两轮视觉回修，状态可持久化恢复。
6. 当前第一性原理项目全部页面使用 V3，不再以矩形和标签作为主要画面。
7. 浏览器中播放、暂停和 seek 正常；导出的 MP4 含正确音频、字幕和 16:9 画面。
8. 仓库包含 AGPL、版权、第三方声明和源码获取说明。
