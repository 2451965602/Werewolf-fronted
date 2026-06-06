---
comet_change: fit-game-screen
role: technical-design
canonical_spec: openspec
---

## Context

本设计基于 `openspec/changes/fit-game-screen/.comet/handoff/design-context.md`。OpenSpec delta spec 是本次能力事实源；本文只记录实现设计、技术边界和验证策略。

当前对局页由 `App.tsx` 组合 `GameShell`、`StageStatusStrip`、`SeatRing`、`NarrativeLog`、`SpeechLedger`、`GameSummary`、`StatusStrip`、`RoleSpotlight` 和 `PlayerGrid`。右侧栏仍包含 `ControlPanel`，它提供开始、推进和刷新操作，并占用 1920x1080 桌面屏的关键高度。消息顺序方面，`view-model.ts` 当前直接按服务端消息顺序派生 `timeline`，`SpeechLedger` 也按筛选后的自然顺序输出发言记录，导致列表中最新信息出现在底部。

## Technical Approach

采用三个边界清晰的改动：

1. 数据顺序边界放在 `view-model.ts`
   - `timeline` 在派生阶段输出最新优先。
   - `buildSpeechLedger` 在确定当前轮或 fallback 轮次后输出最新优先。
   - `latestSpeaker` 继续表示最新发言者，但应基于倒序列表第一项读取，避免和列表顺序冲突。

2. 对局页组合边界放在 `App.tsx`
   - 从 `sideRail` 移除 `ControlPanel`。
   - 移除 `ControlPanel` import，并在无剩余引用后删除 `control-panel.tsx` 和测试。
   - `sideRail` 保留最近发言、局势摘要和状态提示，右侧空间不再用于导演操作。

3. 桌面布局边界放在 `GameShell` 和卡片高度
   - 大屏断点使用 `lg:h-screen` 或等价 100vh 预算，把页面高度控制在视口内。
   - `main` 使用明确的 grid/flex 行分配：顶部状态条、主内容区、底部局势区。
   - 主内容区和底部区使用 `min-h-0`，具体长内容交给 `NarrativeLog`、`SpeechLedger` 等局部滚动容器。
   - 小屏和移动端继续使用自然文档流，不强行套用桌面高度。

## Data Flow

```text
API messages
  -> buildGameViewModel
     -> timeline: map message -> newest first
     -> speechLedger:
        -> player messages only
        -> current round if present
        -> otherwise latest available round
        -> newest first
  -> App
     -> NarrativeLog renders current focus from first item
     -> SpeechLedger renders records in supplied order
```

这个方向让顺序语义只存在于 view-model 层。组件不再隐式反转数组，测试也能直接断言页面消费的数据契约。

## Layout Plan

桌面端目标是 1920x1080 的默认画面能看见主要区域：

```text
┌────────────────────────────────────────────┐
│ compact stage status                       │
├──────────────────────────────┬─────────────┤
│ main narrative + seat view    │ speech      │
│ local scroll if history long  │ summary     │
│                               │ status      │
├──────────────────────────────┴─────────────┤
│ role spotlight + player grid                │
└────────────────────────────────────────────┘
```

实现时优先控制高度预算和间距，而不是重写全部视觉组件。`NarrativeLog` 与 `SpeechLedger` 可以降低桌面端固定高度和卡片头部占比；超长历史只在列表内部滚动。`PlayerGrid` 和 `RoleSpotlight` 保持次级区域，但需要有稳定高度上限，避免把主区域推出视口。

## Risks And Mitigations

- `lg:h-screen` 可能重新引入旧的高度挤压问题。缓解方式是所有 grid/flex 子区域配套使用 `min-h-0`，并让列表组件承担局部滚动。
- 删除 `ControlPanel` 会让对局页没有推进按钮。该行为符合 OpenSpec 范围；后续若需要操作入口，应单独设计，不在本次补回。
- 倒序展示会改变现有断言。缓解方式是先更新 view-model 测试，把最新优先明确为契约，再改组件。
- 浏览器视口与系统缩放可能影响“无需页面滚动”的视觉判断。验证以 1920x1080 CSS viewport 为准，同时检查 `document.documentElement.scrollHeight <= window.innerHeight` 或主区域是否无需页面级滚动。

## Testing Strategy

- `view-model.test.ts`
  - 验证 `timeline` 最新消息排在第一位。
  - 验证当前轮发言账册最新发言排在第一位。
  - 验证 fallback 发言账册仍选择最近可用轮次，并按最新优先展示。

- `App.test.tsx`
  - 移除 `ControlPanel` mock 和相关期望。
  - 新增断言：进入对局后不包含导演控制台内容。

- `game-shell.test.tsx`
  - 更新桌面布局类断言，确认存在视口预算、局部布局和区域标识。
  - 避免只断言旧的“没有 `lg:h-screen`”，因为新设计会恢复受控的视口预算。

- `narrative-log.test.tsx` 与 `speech-ledger.test.tsx`
  - 组件只验证按输入顺序渲染、最新焦点使用第一项。
  - 不在组件内部测试数据反转。

- 浏览器验证
  - 以 1920x1080 打开对局页。
  - 确认导演控制台不可见。
  - 确认顶部状态、主舞台、最近发言、摘要、状态、玩家态势默认可见。
  - 确认时间线和发言账册最新记录在列表顶部。

## Implementation Order

1. 先改测试，固定最新优先和移除导演控制台的新契约。
2. 改 `view-model.ts`，让排序契约集中在数据层。
3. 改 `App.tsx`，移除 `ControlPanel` 组合和 import。
4. 删除无引用的 `ControlPanel` 文件和测试。
5. 调整 `GameShell`、`NarrativeLog` 和 `SpeechLedger` 的桌面高度预算。
6. 运行单元测试、类型检查、lint 和 1920x1080 浏览器验证。
