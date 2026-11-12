# Structured Artwork Output Implementation Plan

## Goal

让逐页绘图从“模型提交任意 JSON 字符串、失败后整页重画”升级为：

1. Pi Agent 的 `submit` 工具直接暴露绘图结构 Schema；
2. DeepSeek 在工具调用阶段受到必填字段、枚举和数值范围约束；
3. 应用层继续使用 Zod 作为最终可信边界；
4. 对字号等无歧义数值做确定性归一化；
5. 校验失败时保留经过白名单过滤的结构草稿，辅助下一次局部修复；
6. 不把模型返回的任意字符串或未知字段再次拼入提示词。

## Scope

- `packages/agent/src/runtime/pi.ts`
  - 保留现有通用 JSON 字符串提交方式。
  - 新增结构化生成入口，允许调用方传入 TypeBox Schema。
  - 结构化模式下，工具参数本身就是结果对象，避免二次 JSON 字符串解析。
- `packages/agent/src/director/artwork-output.ts`
  - 定义适合模型工具调用的扁平绘图 Schema。
  - 定义确定性归一化与安全修复草稿过滤逻辑。
- `packages/agent/src/director/index.ts`
  - 绘图阶段优先调用结构化生成入口。
  - 在 Zod 校验之前归一化候选结果。
  - 首次失败后把安全结构草稿和校验问题交给下一轮修复。
- Tests
  - 验证 Pi 发送的是嵌套结构 Schema，而不是只有 `json: string`。
  - 验证坐标必填与 `fontSize <= 100` 约束存在。
  - 验证字号会被安全归一化。
  - 验证非法候选只保留安全结构信息，不回显任意模型内容。

## Design

### 1. Optional structured generation capability

`JsonGenerator` 新增可选方法：

```ts
generateStructured?(
  system: string,
  user: string,
  schema: TSchema,
  signal?: AbortSignal,
): Promise<GeneratedJson>;
```

测试替身和其他生成器不必立即实现；绘图导演在不存在该方法时继续使用原有 `generate`。

### 2. Tool-level schema

绘图元素统一要求：

- `id`
- `type`
- `x`, `y`, `width`, `height`
- `cueIndex`
- `layer`

特有字段（如 `text`、`fontSize`、`d`、`name`）保持可选，由现有 Zod 判别联合进一步校验。这样既能避免 DeepSeek 对复杂 `oneOf` 支持差异，又能在工具调用阶段挡住当前两类错误。

### 3. Trust boundary

处理顺序固定为：

```text
Pi 工具参数校验
  -> 安全数值归一化
  -> Zod 基础结构校验
  -> 画布适配
  -> Zod 完整语义校验
```

TypeBox 是模型输出约束，Zod 仍是服务端最终事实来源。

### 4. Repair draft

候选结果未通过基础 Zod 时，仅保留：

- 已知对象层级；
- 合法元素类型和受控枚举；
- 有限范围内的数字；
- 满足安全格式的 ID；
- 不包含未知字段、自由文本、SVG 路径或任意字符串值。

这既能让模型看到“哪个元素缺少坐标”，又不会把潜在提示注入内容回灌给下一轮。

## Verification

1. 先添加失败测试并确认失败原因对应新能力缺失。
2. 实现后运行 agent 定向测试。
3. 运行相关 contracts/API 测试与类型检查。
4. 在 `http://127.0.0.1:5173/#2792cedd-b31f-4b6a-a01b-6f8d426e1f9a` 点击重试制作。
5. 观察 API/worker 日志和项目状态，直到逐页绘图完成并出现预览；如出现新的真实错误，继续按相同证据链修复。
