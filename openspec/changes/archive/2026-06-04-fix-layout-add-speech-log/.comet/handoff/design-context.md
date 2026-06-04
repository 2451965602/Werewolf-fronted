# Comet Design Handoff

- Change: fix-layout-add-speech-log
- Phase: design
- Mode: compact
- Context hash: a56fed8d6091b10325b3059e43e3996b12f004ac42cd1e2d97c256f950f66591

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/fix-layout-add-speech-log/proposal.md

- Source: openspec/changes/fix-layout-add-speech-log/proposal.md
- Lines: 1-26
- SHA256: 2945393464199b8bca0c678c5a1db020ea88606b4629ac806bac49fceb0f6cb9

```md
## Why

当前观战控制台在桌面端存在结构性布局问题：`GameShell` 把顶部 banner、中段双列区和下方局势区同时塞进固定 `lg:h-screen` 容器，导致中段网格在大屏下被压成 `height: 0`，滚动和点击区域都不稳定。与此同时，玩家发言虽然已经混在叙事实录时间线中，但缺少单独的发言记录视图，用户无法快速回看整轮白天发言。

## What Changes

- 重构观战控制台桌面端布局骨架，确保主舞台、导演席和局势区在桌面宽屏下具有稳定高度与清晰滚动边界。
- 保留现有叙事实录时间线，并新增一块专门的发言记录视图，用于聚合展示玩家发言内容、最近发言者和记录数量。
- 复用现有服务端 `/api/game/messages` 数据，不新增后端接口；前端在 view model 层派生发言记录并驱动新的 shadcn 组件展示。
- 补充与布局、view model 和发言记录展示相关的测试，避免桌面布局回归。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `werewolf-web-frontend`: 调整观战控制台的桌面布局行为，并增强消息展示，使用户既能看到混合叙事时间线，也能快速浏览聚合后的玩家发言记录。

## Impact

- 受影响代码主要位于 `src/App.tsx`、`src/features/game/view-model.ts`、`src/features/game/types.ts` 和 `src/features/game/components/*`。
- 不修改后端 API、消息协议和游戏推进逻辑。
- 需要更新组件级和 view-model 级测试，覆盖桌面布局约束与发言记录派生逻辑。
```

## openspec/changes/fix-layout-add-speech-log/design.md

- Source: openspec/changes/fix-layout-add-speech-log/design.md
- Lines: 1-47
- SHA256: 2cff05a37abbdcb2e535e3f0ba54942733127a05eb1c15a179102bf40a41ab10

```md
## Context

当前控制台由 `GameShell` 统一承载 banner、主舞台、导演席和局势区。问题不在单个卡片，而在壳层约束：`main` 使用固定屏高，内部又将中段双列区和下段局势区拆成两个独立区块，导致中段区块在桌面端失去有效高度。消息链路方面，前端已经从 `/api/game/messages` 拉取系统消息、投票消息和玩家发言，并统一映射为 `timeline`；新增能力不应改动接口，而应在现有消息集上派生更适合回看发言的视图模型。

## Goals

- 桌面端控制台恢复稳定布局，避免零高度网格、错位滚动和不可点击区域。
- 在不破坏现有叙事实录时间线的前提下，新增清晰的发言记录区域。
- 尽量复用现有 shadcn 基础件与语义样式，不引入新的 UI 依赖。

## Non-Goals

- 不改动后端消息生成逻辑。
- 不新增本地状态机或前端私有发言缓存。
- 不重做整体视觉主题，只解决当前布局与信息可读性问题。

## Proposed Approach

### 1. 重组控制台壳层

- 将控制台调整为更明确的响应式两段布局：顶部 banner 独立占位；下方内容区在桌面端使用稳定的 grid/flex 组合分配主舞台、导演席和局势区。
- 保证真正滚动的只有内部内容面板，而不是让父级通过 `height: 0` + `overflow` 勉强撑开。
- 保留移动端当前纵向堆叠模式，只修正桌面端约束冲突。

### 2. 从消息流派生发言记录

- 在 view model 中从现有 `timeline` 或原始 `messages` 派生仅包含玩家发言的记录列表。
- 每条发言记录至少保留：说话人、轮次、阶段、正文内容，以及便于 React 渲染的稳定 id。
- 同步提供记录总数、最近发言者等轻量摘要，供新增卡片使用。

### 3. 使用 shadcn 组合展示新视图

- 新增发言记录组件，优先用现有 `Card`、`Badge`、`ScrollArea` 组合实现。
- 让发言记录区与现有时间线区职责分离：时间线保留系统/投票/发言的完整叙事混流；发言记录专注于玩家逐条发言回看。
- 如果空间允许，将发言记录与局势区组合到同一稳定内容区，避免继续增加独立滚动上下文。

## Risks And Tradeoffs

- 如果壳层布局改动过大，可能影响移动端现有视觉节奏，因此需要以桌面端修复为主、移动端回归验证为辅。
- 发言记录与时间线都展示发言内容，存在信息重复；但两者关注点不同，前者服务快速检索，后者服务完整叙事。
- 若后端某些阶段没有玩家发言，发言记录组件需要提供空状态，不能制造“有记录”的错觉。

## Validation Strategy

- 组件测试覆盖 `GameShell` 的桌面布局类约束变化。
- view-model 测试覆盖玩家发言记录的派生与摘要。
- 浏览器实测桌面端与移动端，确认布局稳定、按钮可交互、滚动区域正常。
```

## openspec/changes/fix-layout-add-speech-log/tasks.md

- Source: openspec/changes/fix-layout-add-speech-log/tasks.md
- Lines: 1-5
- SHA256: 1f60bf632c528d84aad7956ab04197fe282a63cc39403893473ae95c623997f4

```md
- [ ] 调整控制台壳层布局，修复桌面端 `GameShell` 高度与滚动约束冲突。
- [ ] 在 view model 和类型定义中派生玩家发言记录与摘要数据。
- [ ] 使用 shadcn 组件新增发言记录视图，并接入现有控制台页面。
- [ ] 更新组件测试与 view-model 测试，覆盖布局和发言记录行为。
- [ ] 用浏览器验证桌面端与移动端布局、推进阶段后的消息显示和交互状态。
```

## openspec/changes/fix-layout-add-speech-log/specs/werewolf-web-frontend/spec.md

- Source: openspec/changes/fix-layout-add-speech-log/specs/werewolf-web-frontend/spec.md
- Lines: 1-50
- SHA256: 4a764159058fdb1bb3a0f44ab27398d9fcbec993a915933fed9235228cf58311

```md
## MODIFIED Requirements

### Requirement: Dual-mode werewolf web experience

The web frontend SHALL render a lobby-first entry and, once the user enters the control console, SHALL keep the desktop spectator layout readable without collapsing its primary stage regions.

#### Scenario: Desktop control console keeps stable stage regions

- **GIVEN** the user has entered the in-game control console on a desktop-width viewport
- **WHEN** the frontend renders synchronized game state and messages
- **THEN** the primary narrative stage remains visible and scrollable
- **AND** supporting regions for compact stage status, seat overview, and detailed player context do not collapse to zero height

### Requirement: Readable spectator timeline

The web frontend SHALL present spectator-visible message flow as a structured timeline that distinguishes AI/player speech, system announcements, and vote-related events, and SHALL expose a separate current-round speech record view for player speech.

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

#### Scenario: Current-round speech record stays synchronized with timeline

- **GIVEN** synchronized game messages include player speech for the active round
- **WHEN** the control console renders the desktop spectator view
- **THEN** the frontend shows a dedicated speech record region for player speech from the current round
- **AND** each speech record identifies the speaker and preserves message order
- **AND** the dedicated speech record updates when new synchronized player speech arrives for that round

### Requirement: Spectator seat awareness on desktop

The desktop spectator console SHALL provide a compact seat overview around the main stage that identifies seat number, role, and living status without requiring the detailed player card grid to remain in the primary focus area.

#### Scenario: Compact desktop seat overview weakens eliminated players

- **GIVEN** the user is viewing the desktop spectator console
- **AND** synchronized player state includes both living and eliminated players
- **WHEN** the compact seat overview renders around the main narrative stage
- **THEN** each seat overview node identifies seat number and role
- **AND** eliminated players are visually weakened compared to living players
```

