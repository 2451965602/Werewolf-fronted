# Comet Design Handoff

- Change: fix-ui-overlap
- Phase: design
- Mode: compact
- Context hash: ebd5540f3adb41ec57eec3702df2d004fc16aa1989c9f8f3e57d50fa1c2784c0

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/fix-ui-overlap/proposal.md

- Source: openspec/changes/fix-ui-overlap/proposal.md
- Lines: 1-27
- SHA256: a8877ba13e5840f1dd31641d3dd8fdd180fab03708346341ddbf795230ad8484

```md
## Why

当前观战控制台在桌面端出现明显的 UI 重叠：`GameShell` 在大屏下把顶部状态条、中部主副双列区和底部席位总览同时塞进固定 `lg:h-screen` 容器，而主舞台中的 `NarrativeLog` 又保留较高的最小高度。视口高度不足时，中下两段会互相挤压，造成时间线、席位区和导演席视觉重叠，直接影响阅读与操作。与此同时，当前发言账册在本轮没有玩家发言时会直接进入空状态，不利于观战连续性，也不利于后续把 AI 发言与思考展示稳定挂在主舞台周边的信息区。

## What Changes

- 调整观战控制台桌面端布局骨架，移除导致重叠的固定视口高度约束，改为更稳定的区域分配与滚动边界。
- 重新约束主舞台、导演席与席位总览的高度关系，保留“主舞台优先”的视觉焦点，并把 `SeatRing` 改为更稳定的弱环绕/分组布局。
- 为 `SpeechLedger` 增加“仅当前轮无发言时回退到最近可用轮次”的展示逻辑，并在 UI 中明确标注来源轮次，保持观战连续性。
- 保持现有接口与交互流程不变，但允许 view-model 为回退展示补充必要元数据，方便后续扩展 AI 发言与思考展示。
- 补充布局、view-model 与浏览器回归测试，避免布局重叠与发言展示回退逻辑回归。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `werewolf-web-frontend`: 调整桌面端观战控制台的布局要求，确保主舞台、控制侧栏与席位总览在有限视口高度下保持可读、可滚动且不发生区域重叠，并让发言账册在当前轮缺失发言时回退展示最近可用发言。

## Impact

- 受影响代码主要位于 `src/features/game/components/*`、`src/features/game/view-model.ts` 与相关测试。
- 不修改后端 API、游戏推进逻辑或消息协议。
- 需要更新组件测试、view-model 测试与桌面端浏览器验证用例，覆盖不同视口高度下的布局表现和发言回退行为。
```

## openspec/changes/fix-ui-overlap/design.md

- Source: openspec/changes/fix-ui-overlap/design.md
- Lines: 1-81
- SHA256: a4bd31bcb2b4c8730983d273e7c64ce618c15a6c1dfedabd4f42946d2357f951

[TRUNCATED]

```md
## Context

当前问题的根源在控制台壳层，而不是单个卡片组件。`GameShell` 在桌面端使用固定 `lg:h-screen` 与 `lg:overflow-hidden`，同时把 banner、中部双列区和底部席位总览并列塞进同一个视口高度预算里。另一方面，`NarrativeLog` 作为主舞台卡片保留较高的最小高度与内部滚动容器。当视口高度不足时，父级无法为三个区域同时提供足够空间，最终表现为主舞台与底部席位区相互覆盖、滚动边界错乱。除此之外，发言账册当前严格依赖“本轮玩家发言”，在夜晚或本轮尚无人发言时容易立即掉到空状态，不利于连续观战，也不利于后续在主舞台附近扩展 AI 发言与思考展示。

## Goals

- 修复桌面端观战控制台的区域重叠问题。
- 让主舞台、导演席和席位总览在较矮桌面视口下仍保持稳定边界与可读滚动。
- 保留“主舞台优先”的页面结构，为后续 AI 发言与思考展示预留自然扩展位。
- 在不改后端接口的前提下，让发言账册支持最近可用发言回退展示。

## Non-Goals

- 不改动后端接口或消息同步逻辑。
- 不新增前端私有状态机或额外缓存。
- 不把 `SeatRing` 彻底重做成纯信息网格页，也不在本次直接实现 AI 思考展示。

## Proposed Approach

### 1. 重组桌面端壳层高度策略

- 去掉导致整体内容被硬裁剪的固定 `h-screen` 约束，改为允许页面自然撑高，或仅把滚动责任收敛到真正需要滚动的内部区域。
- 在桌面端明确区分“页面级流式布局”和“卡片内部滚动布局”，避免父容器与子容器同时争抢高度。
- 保持移动端现有纵向堆叠逻辑，只修正 `lg` 断点上的布局策略。

### 2. 保留主舞台焦点，弱化高风险环绕布局

- `NarrativeLog` 继续作为主舞台核心承载区，后续 AI 发言与思考展示也优先围绕该区域扩展。
- `SeatRing` 不再依赖绝对定位椭圆环绕；改为更稳定的弱环绕/分组布局，既保留“围绕主舞台观察牌局”的语义，也避免再次引入高度挤压风险。
- 纯网格信息板虽然稳定，但会削弱叙事焦点，因此本次不采用。

### 3. 收紧区域间的最小高度与溢出边界

- 让主舞台容器的最小高度约束与父级可用高度一致，避免 `NarrativeLog` 或其他卡片以固定最小高度压穿相邻区域。
- 根据页面层级重新分配 `overflow`，确保底部席位总览与主舞台不会因为内部滚动容器叠加而产生视觉覆盖。
- 如有必要，降低某些桌面端卡片的最小高度或把它们改为自适应高度，而不是依赖视口强制挤压。

### 4. 为发言账册增加最近可用轮次回退

- 在 view-model 中从现有玩家发言消息里先取当前轮；若当前轮为空，则回退到最近一个存在玩家发言的轮次。
- `SpeechLedger` 需要接收最小必要元数据，例如 `sourceRound` 与 `isFallback`，用于标明当前展示的是本轮还是最近可用轮次。
- 不改变后端返回结构，也不引入额外缓存；仅在前端派生展示状态。

### 5. 维持现有数据流，仅修正展示容器

- 继续沿用 `App -> GameShell -> NarrativeLog / ControlPanel / PlayerGrid / SpeechLedger` 的数据流。
- 本次变更只调整容器结构、样式约束与少量 view-model 派生字段，不改变消息、玩家状态和控制面板事件传递方式。

## Data Flow

```text
App
  -> GameShell
      -> banner
      -> mainLog (NarrativeLog)
      -> sideRail (ControlPanel / SpeechLedger 等)
      -> situation (PlayerGrid / SeatRing 辅助信息)

messages
  -> buildSpeechLedger()
      -> current round speeches
      -> fallback to latest available round when current round is empty
      -> SpeechLedger UI label / description

服务端同步链路保持不变；
前端新增的只是对展示状态的派生。
```

## Risks And Tradeoffs

- 如果把页面改为自然增高，页面级滚动会变多，但能换来稳定且不重叠的布局；这是可接受的取舍。
- 弱环绕布局需要在“舞台感”和“实现稳定性”之间折中，避免退回到纯网格，也避免重走绝对定位老路。
- 发言账册回退展示如果文案不清晰，可能让用户误以为当前轮已有发言，因此必须明确来源轮次。

## Validation Strategy

- 组件测试覆盖 `GameShell` 在桌面端不再依赖固定视口高度裁剪内容。
- 组件测试覆盖 `SeatRing` 的弱环绕/分组布局语义仍保留主舞台焦点。
- view-model 测试覆盖“当前轮有发言”和“当前轮无发言时回退到最近可用轮次”两类情况。
- 浏览器实测桌面端不同高度视口，确认时间线、导演席和席位总览不重叠。
```

Full source: openspec/changes/fix-ui-overlap/design.md

## openspec/changes/fix-ui-overlap/tasks.md

- Source: openspec/changes/fix-ui-overlap/tasks.md
- Lines: 1-5
- SHA256: 8aa7b8e8567c310546dc08af07293a1b702f1758c753333c22049ced26f191b6

```md
- [ ] 调整 `GameShell` 的桌面端布局约束，移除或替换导致区域重叠的固定视口高度与溢出策略。
- [ ] 将 `SeatRing` 调整为保留主舞台焦点的稳定弱环绕/分组布局，避免绝对定位环绕导致的挤压与覆盖。
- [ ] 为 `SpeechLedger` 增加最近可用发言回退逻辑与来源轮次标识。
- [ ] 更新组件测试、view-model 测试或页面级测试，覆盖桌面端布局不重叠与发言回退行为。
- [ ] 用浏览器验证桌面端至少两档视口高度与移动端回归表现，确认主舞台、导演席与席位区可读且可交互。
```

## openspec/changes/fix-ui-overlap/specs/werewolf-web-frontend/spec.md

- Source: openspec/changes/fix-ui-overlap/specs/werewolf-web-frontend/spec.md
- Lines: 1-52
- SHA256: ed97a95b6a55792be89d081cabc6cb8584f4b6e947f85ee0f9636ad700282c17

```md
## MODIFIED Requirements

### Requirement: Dual-mode werewolf web experience

The web frontend SHALL render a lobby-first entry and, once the user enters the control console, SHALL keep the desktop spectator layout readable without collapsing its primary stage regions.

#### Scenario: Desktop control console keeps stable stage regions

- **GIVEN** the user has entered the in-game control console on a desktop-width viewport
- **WHEN** the frontend renders synchronized game state and messages
- **THEN** the primary narrative stage remains visible and scrollable
- **AND** supporting regions for compact stage status, seat overview, and detailed player context do not collapse to zero height

#### Scenario: Desktop seat overview preserves stage-first focus

- **GIVEN** the user is viewing the desktop spectator console
- **WHEN** the seat overview renders beside or around the primary narrative stage
- **THEN** the layout preserves a clear primary focus on the main narrative stage
- **AND** the seat overview remains readable without relying on absolute-positioned ring geometry that can overlap adjacent regions

### Requirement: Readable spectator timeline

The web frontend SHALL present spectator-visible message flow as a structured timeline that distinguishes AI/player speech, system announcements, and vote-related events, and SHALL expose a separate speech ledger view for player speech.

#### Scenario: Timeline distinguishes message categories

- **GIVEN** synchronized game messages are available
- **WHEN** the control console renders the narrative timeline
- **THEN** the frontend visually distinguishes speech, system, and vote-related entries
- **AND** each timeline item shows enough context to identify its round and phase

#### Scenario: Latest timeline item is emphasized

- **GIVEN** synchronized game messages are available
- **WHEN** the control console renders the narrative timeline
- **THEN** the frontend highlights the latest relevant item as the current focal point
- **AND** keeps earlier entries browsable in the historical timeline

#### Scenario: Current-round speech ledger stays synchronized when current-round speech exists

- **GIVEN** synchronized game messages include player speech for the active round
- **WHEN** the frontend renders the speech ledger
- **THEN** the speech ledger shows the active round's player speech in order
- **AND** each speech record identifies the speaker and round context

#### Scenario: Speech ledger falls back to the latest available round

- **GIVEN** the active round currently has no player speech
- **AND** earlier rounds contain player speech records
- **WHEN** the frontend renders the speech ledger
- **THEN** the speech ledger shows the most recent round that has player speech
- **AND** the UI indicates that the displayed records are a fallback from that earlier round
```

