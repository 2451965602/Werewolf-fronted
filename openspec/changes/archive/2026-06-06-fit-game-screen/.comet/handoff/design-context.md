# Comet Design Handoff

- Change: fit-game-screen
- Phase: design
- Mode: compact
- Context hash: c2101455d3593cb5d539f60eea07dc4dea473edc51e2a81e1b81891fe2a3a6d5

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/fit-game-screen/proposal.md

- Source: openspec/changes/fit-game-screen/proposal.md
- Lines: 1-27
- SHA256: 82295893d55eb593fc606f70be94b9d8f2ded37f1f585ecb0b8bbab09a18d243

```md
## Why

当前对局界面在 1920x1080 桌面屏上仍需要浏览整页滚动才能看完主要内容，右侧“导演控制台”也占用了观战信息的关键空间。与此同时，最近发言和叙事实录时间线按旧到新展示，用户需要向下寻找最新信息，不利于快速跟进当前局势。

## What Changes

- 优化观战对局界面的桌面端布局，使 1920x1080 目标视口尽量在一个窗口内展示顶部状态、主舞台、最近发言、局势摘要和玩家态势，避免页面级滚动条成为默认路径。
- 从对局界面移除“导演控制台”操作面板，不再在观战主界面展示开始、推进、刷新等导演操作卡片。
- 将“最近发言账册”和“叙事实录时间线”的列表展示改为倒序，最新记录优先出现在列表顶部。
- 保持现有后端 API、消息协议和 Lobby 入口流程不变。
- 更新组件、视图模型和浏览器验证，覆盖 1920x1080 桌面布局、移除导演控制台以及倒序日志展示。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `werewolf-web-frontend`: 调整桌面端观战对局布局、移除导演操作面板，并要求最近发言与叙事实录时间线按最新优先展示。

## Impact

- 受影响代码主要位于 `src/App.tsx`、`src/features/game/view-model.ts`、`src/features/game/components/game-shell.tsx`、`src/features/game/components/narrative-log.tsx`、`src/features/game/components/speech-ledger.tsx` 和相关测试。
- `ControlPanel` 及其测试在不再被使用后应移除，避免保留无效 UI 代码。
- 不修改后端 API、游戏状态推进逻辑、消息数据结构或路由结构。
```

## openspec/changes/fit-game-screen/design.md

- Source: openspec/changes/fit-game-screen/design.md
- Lines: 1-59
- SHA256: 6362520f3ed641fe55160ab811c8fc921b0e3dcff81b3a28a7a227d76efe8cb8

```md
## Context

当前应用由 `App.tsx` 把 Lobby 与对局界面串起来。对局界面使用 `GameShell` 承载顶部状态条、主舞台、右侧栏和底部玩家态势；右侧栏目前依次放置 `ControlPanel`、`SpeechLedger`、`GameSummary` 和 `StatusStrip`。在 1920x1080 这类常见桌面屏上，右侧导演操作面板和多个大高度卡片会把信息区推长，导致用户需要页面滚动才能看完关键内容。

消息展示方面，`view-model.ts` 从服务端 `messages` 派生 `timeline` 和 `speechLedger`。现在两者都保留服务端原始顺序，组件顶部虽然会突出最新焦点，但历史列表仍从旧到新渲染，和“最近发言 / 当前局势优先”的观战需求不一致。

## Goals / Non-Goals

**Goals:**

- 在 1920x1080 桌面视口下，以一个窗口尽量展示主要观战内容，减少默认页面级滚动。
- 移除对局界面中的导演操作面板，让右侧空间优先服务最近发言、摘要和状态。
- 让最近发言账册和叙事实录时间线都按最新优先展示。
- 保持移动端自然纵向浏览，不强行套用桌面固定高度。

**Non-Goals:**

- 不新增替代的导演操作入口。
- 不修改后端 API、消息排序协议或服务端状态推进逻辑。
- 不重做 Lobby 首页、玩家卡片视觉风格或狼人杀规则逻辑。
- 不保证无限长度日志完全无滚动；超长历史仍可在局部列表中浏览。

## Decisions

### 1. 桌面端采用视口预算布局

在大屏断点上让 `GameShell` 明确以 100vh 为布局预算，压缩垂直间距和卡片高度，将顶部状态、主舞台、右侧信息和玩家态势纳入同一个可见画面。主舞台和列表区域使用明确的 `min-h-0`、grid/flex 分配和局部溢出边界，避免整页滚动成为默认行为。

替代方案是继续依赖自然文档流，只缩小若干卡片高度。该方案改动更小，但无法稳定保证 1080p 目标屏内可见，因此不作为主方案。

### 2. 移除 ControlPanel 而不是隐藏标题

`ControlPanel` 的职责是手动开始、推进和刷新，这与用户要求移除“导演控制台”一致。实现时应从 `App.tsx` 的 `sideRail` 中移除该组件，并在确认无其他引用后删除组件和测试。这样可以释放右侧栏高度，也避免留下不可见但仍需维护的旧操作面板。

替代方案是只改文案或折叠面板，但仍会保留导演操作概念，和本次范围不一致。

### 3. 在视图模型边界生成最新优先列表

`timeline` 和 `speechLedger.items` 应在 `view-model.ts` 派生为最新优先。组件只负责渲染传入顺序，并把“最新焦点”切换为列表第一项。这样测试可以直接验证数据契约，避免多个组件各自反转造成顺序不一致。

替代方案是在 `NarrativeLog` 和 `SpeechLedger` 内部反转数组。该方案局部改动少，但会让同一份 view-model 在不同组件中出现隐式顺序语义，不利于后续维护。

## Risks / Trade-offs

- 视口预算布局在极端数据量下仍可能需要局部滚动 → 仅把 1920x1080 常规内容作为无页面滚动目标，长历史列表保留局部浏览能力。
- 移除 `ControlPanel` 后对局界面不再提供手动推进入口 → 本次按用户要求执行，不新增替代入口；若后续需要操作能力，应作为单独 change 设计。
- 倒序展示可能影响现有测试对旧顺序的断言 → 更新 view-model 和组件测试，明确“最新优先”为新契约。

## Migration Plan

1. 先更新测试，覆盖倒序数据契约、`ControlPanel` 不再渲染、桌面布局没有默认页面级滚动。
2. 调整 `view-model.ts` 的 `timeline` 与 `speechLedger.items` 排序。
3. 调整 `App.tsx` 和 `GameShell`，移除导演操作面板并收紧桌面布局。
4. 删除不再使用的 `ControlPanel` 组件和测试。
5. 运行单元测试、类型检查，并用浏览器在 1920x1080 验证关键内容可见。

## Open Questions

- 无。当前按“移除对局界面导演控制台，不提供替代入口”处理。
```

## openspec/changes/fit-game-screen/tasks.md

- Source: openspec/changes/fit-game-screen/tasks.md
- Lines: 1-23
- SHA256: 47507c25a440c8eae6dcd4926fbbd7655434a7eba8e0091addd4ae5f0224501a

```md
## 1. Data Ordering

- [ ] 1.1 Update `view-model.ts` so `timeline` is derived with newest records first while preserving latest-focus metadata.
- [ ] 1.2 Update `buildSpeechLedger` so current-round and fallback speech records are returned newest first.
- [ ] 1.3 Update view-model tests to assert newest-first timeline and speech ledger ordering.

## 2. Console Simplification

- [ ] 2.1 Remove `ControlPanel` from the in-game `sideRail` composition in `App.tsx`.
- [ ] 2.2 Delete the unused `control-panel.tsx` component and its tests after confirming no remaining imports.
- [ ] 2.3 Update app-level tests and mocks so the console no longer expects director controls.

## 3. 1920x1080 Layout Fit

- [ ] 3.1 Adjust `GameShell` desktop layout to use a bounded 1920x1080-friendly viewport budget with stable grid/flex rows.
- [ ] 3.2 Tune `NarrativeLog`, `SpeechLedger`, summary, and situation region heights/gaps so primary content is visible without default page scrolling at 1920x1080.
- [ ] 3.3 Keep mobile and smaller desktop layouts readable with normal vertical flow where the 1920x1080 budget does not apply.

## 4. Verification

- [ ] 4.1 Run focused unit tests for view-model, app shell, narrative log, and speech ledger.
- [ ] 4.2 Run typecheck and lint.
- [ ] 4.3 Use browser verification at 1920x1080 to confirm the primary console regions are visible, the director console is absent, and timeline/speech ledger lists show newest records first.
```

## openspec/changes/fit-game-screen/specs/werewolf-web-frontend/spec.md

- Source: openspec/changes/fit-game-screen/specs/werewolf-web-frontend/spec.md
- Lines: 1-68
- SHA256: 025df947c48f5f9aaf066bd3d362f5474e19b250ce9fe5f208880799833ee0c9

```md
## MODIFIED Requirements

### Requirement: Dual-mode werewolf web experience

The web frontend SHALL render a lobby-first entry and, once the user enters the spectator game view, SHALL keep the desktop spectator layout readable within the target 1920x1080 viewport without relying on default document-level scrolling for primary content.

#### Scenario: Desktop spectator view fits the 1920x1080 target viewport

- **GIVEN** the user has entered the in-game spectator view on a 1920x1080 desktop viewport
- **WHEN** the frontend renders synchronized game state and messages
- **THEN** the primary narrative stage, latest speech ledger, compact status, game summary, and player situation remain visible in one window as the default layout
- **AND** the page does not require document-level vertical scrolling to discover those primary regions

#### Scenario: Desktop historical overflow stays local

- **GIVEN** the user is viewing the desktop spectator view
- **AND** the message or speech history exceeds the space available in the target viewport
- **WHEN** the frontend renders historical records
- **THEN** overflowing history is constrained to the relevant local list area
- **AND** the surrounding status, summary, and player situation regions remain visible and do not collapse to zero height

#### Scenario: Director control panel is removed from the spectator view

- **GIVEN** the user has entered the in-game spectator view
- **WHEN** the frontend renders the right-side or supporting information area
- **THEN** it does not render the director control panel or director console card
- **AND** it does not expose start, advance, or refresh controls as a director operation panel in that view

#### Scenario: Desktop seat overview preserves stage-first focus

- **GIVEN** the user is viewing the desktop spectator view
- **WHEN** the seat overview renders beside or around the primary narrative stage
- **THEN** the layout preserves a clear primary focus on the main narrative stage
- **AND** the seat overview remains readable without relying on absolute-positioned ring geometry that can overlap adjacent regions

### Requirement: Readable spectator timeline

The web frontend SHALL present spectator-visible message flow as a structured timeline that distinguishes AI/player speech, system announcements, and vote-related events, SHALL expose a separate speech ledger view for player speech, and SHALL render both the timeline and speech ledger with the newest records first.

#### Scenario: Timeline distinguishes message categories

- **GIVEN** synchronized game messages are available
- **WHEN** the spectator view renders the narrative timeline
- **THEN** the frontend visually distinguishes speech, system, and vote-related entries
- **AND** each timeline item shows enough context to identify its round and phase

#### Scenario: Latest timeline item is emphasized first

- **GIVEN** synchronized game messages are available
- **WHEN** the spectator view renders the narrative timeline
- **THEN** the newest relevant item is highlighted as the current focal point
- **AND** the historical timeline list starts with the newest record before earlier records

#### Scenario: Current-round speech ledger stays synchronized when current-round speech exists

- **GIVEN** synchronized game messages include player speech for the active round
- **WHEN** the frontend renders the speech ledger
- **THEN** the speech ledger shows the active round's player speech with the newest speech first
- **AND** each speech record identifies the speaker and round context

#### Scenario: Speech ledger falls back to the latest available round

- **GIVEN** the active round currently has no player speech
- **AND** earlier rounds contain player speech records
- **WHEN** the frontend renders the speech ledger
- **THEN** the speech ledger shows the most recent round that has player speech
- **AND** the displayed fallback speech records are ordered newest first
- **AND** the UI indicates that the displayed records are a fallback from that earlier round
```

