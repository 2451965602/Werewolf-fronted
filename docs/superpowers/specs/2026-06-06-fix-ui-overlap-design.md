---
comet_change: fix-ui-overlap
role: technical-design
canonical_spec: openspec
archived-with: 2026-06-06-fix-ui-overlap
status: final
---

## Summary

本次变更采用“主舞台优先”的修复路径：修复桌面端控制台的高度与滚动冲突，保留 `NarrativeLog` 作为中心叙事舞台，把 `SeatRing` 从高风险的绝对定位环绕调整为更稳定的弱环绕/分组布局，同时为 `SpeechLedger` 增加“当前轮无发言时回退到最近可用轮次”的展示逻辑。这样既能解决当前 UI 重叠，也能为后续 AI 发言与思考展示保留自然的扩展位置。

## Architecture Decisions

### 1. 页面层与卡片层分别承担滚动责任

`GameShell` 不再依赖固定 `h-screen` 加全局 `overflow-hidden` 来强行把三个区域压进同一视口。页面层负责稳定分区，真正需要滚动的区域由卡片内部承担。这样可以消除“父容器压缩、子容器最小高度反撑”的冲突。

### 2. 主舞台继续作为内容焦点

`NarrativeLog` 仍是页面第一视觉焦点。未来若要增加 AI 发言详情、思考摘要、可展开推理链，都优先挂在主舞台附近，而不是把这些高语义内容塞进均质网格信息板中。

### 3. SeatRing 采用弱环绕/分组布局

`SeatRing` 不再使用绝对定位的椭圆环绕。新的实现应保留“围绕主舞台观察席位”的语义，但通过响应式分组、栅格或侧翼分布来获得稳定高度边界。设计目标不是彻底改成纯信息表，而是在稳定性与舞台感之间取平衡。

### 4. SpeechLedger 使用前端派生回退

`SpeechLedger` 继续完全基于现有消息流派生，不新增接口。派生逻辑先取当前轮玩家发言；如果当前轮为空，则回退到最近一个存在玩家发言的轮次，并通过 `sourceRound`、`isFallback` 之类的最小元数据让 UI 明确标识“最近可用发言”。

## Data Flow

```text
messages
  -> buildSpeechLedger()
      -> current round player speeches
      -> fallback latest round with speeches (if current is empty)
      -> ledger meta { count, latestSpeaker, sourceRound, isFallback }
      -> SpeechLedger UI

App
  -> GameShell
      -> NarrativeLog (primary stage)
      -> ControlPanel / SpeechLedger (supporting info)
      -> SeatRing / PlayerGrid (seat awareness)
```

## Component Changes

### GameShell

- 放松桌面端固定视口高度约束。
- 明确中部主舞台区和底部席位区的边界。
- 避免用父级裁切掩盖真实的高度冲突。

### SeatRing

- 移除绝对定位环绕几何。
- 改为更稳定的弱环绕/分组布局。
- 保持“主舞台优先、席位辅助观察”的视觉层次。

### SpeechLedger

- 支持 fallback 标题与说明文案。
- 当展示的是最近可用轮次时，必须明确来源轮次，避免误导用户认为当前轮已有发言。

## Risks

- 如果 `SeatRing` 过度网格化，会丢掉叙事氛围；如果保留太多旧环绕做法，又可能重新引入布局风险。
- 如果 fallback 文案不清楚，会造成“当前轮是否有人发言”的认知混乱。
- 如果页面层与卡片层滚动边界划分不清，仍可能在较矮桌面端产生双重滚动或裁切问题。

## Testing Strategy

1. 组件测试：验证 `GameShell` 桌面布局约束不再依赖固定屏高裁切。
2. 组件测试：验证 `SeatRing` 仍保留主舞台优先语义，而不是退化成无焦点的信息板。
3. View-model 测试：覆盖当前轮有发言、当前轮无发言但历史有发言、完全无发言三类情况。
4. 浏览器验证：检查至少两档桌面高度与移动端回归，确认无重叠、滚动正常、fallback 文案正确。

## Out of Scope

- 本次不直接实现 AI 思考展示。
- 不改后端消息协议或游戏推进逻辑。
- 不做新的状态管理体系。
