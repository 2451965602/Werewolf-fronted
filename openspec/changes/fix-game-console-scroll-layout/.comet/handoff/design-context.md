# Comet Design Handoff

- Change: fix-game-console-scroll-layout
- Phase: design
- Mode: compact
- Context hash: 1d6347e93b6e334b69875c197e04cde2c05034c2b0ad3e52920c396aff6aa437

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/fix-game-console-scroll-layout/proposal.md

- Source: openspec/changes/fix-game-console-scroll-layout/proposal.md
- Lines: 1-30
- SHA256: b22fcc97de975099806e26443d9d9ba4d738dc42c0fa41622ec727a664570076

```md
## Why

当前对局界面在最近的 1920x1080 适配后仍有布局回归：叙事实录时间线与最近发言账册高度过低，用户看不到当前发言；局势摘要在右侧栏内排布拥挤；夜间焦点与古堡宾客席的滚动边界不稳定，容易出现多重或异常滚动条。

这会直接影响观战时读取最新信息的效率，也说明现有桌面端高度分配和 overflow 规则还没有形成稳定契约，需要在进入实现前收敛为一次明确的布局修复。

## What Changes

- 调整对局控制台桌面端的高度分配，让主舞台中的当前镜头/当前发言和最近发言账册都保留可读高度。
- 收紧右侧栏内部的 flex 规则，让局势摘要在有限宽高内保持清晰布局，不再与发言账册或状态提示互相挤压。
- 规范夜间焦点与古堡宾客席所在底部态势区的滚动边界，避免父子容器同时滚动或出现怪异滚动条。
- 保持移动端自然纵向浏览，不把桌面固定高度策略强加到小屏。
- 不修改后端 API、消息协议、游戏状态推进逻辑或数据排序契约。
- 补充组件/页面级测试与浏览器验证，覆盖当前发言可见、局势摘要稳定和底部态势区滚动行为。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `werewolf-web-frontend`: 调整桌面端观战布局要求，确保主舞台、发言账册、局势摘要、夜间焦点和古堡宾客席在目标视口下保持可读且滚动边界稳定。

## Impact

- 受影响代码主要位于 `src/App.tsx`、`src/features/game/components/game-shell.tsx`、`src/features/game/components/narrative-log.tsx`、`src/features/game/components/speech-ledger.tsx`、`src/features/game/components/game-summary.tsx`、`src/features/game/components/role-spotlight.tsx`、`src/features/game/components/player-grid.tsx` 及相关测试。
- 不涉及后端仓库 `E:\VSCode\golang\Werewolf-server`。
- 不新增依赖，不改变 API 请求、view-model 数据字段或狼人杀规则逻辑。
```

## openspec/changes/fix-game-console-scroll-layout/design.md

- Source: openspec/changes/fix-game-console-scroll-layout/design.md
- Lines: 1-66
- SHA256: fa17139c29599fcef132d63cba8cb321e49dfc12b2d95720fbed3b3a944f2514

```md
## Context

当前 `App.tsx` 使用 `GameShell` 组合对局界面：顶部是 `StageStatusStrip`，中部左侧由 `SeatRing` 包裹 `NarrativeLog`，右侧依次放置 `SpeechLedger`、`GameSummary` 和 `StatusStrip`，底部态势区放置 `RoleSpotlight` 与 `PlayerGrid`。

最近一次适配将桌面端收敛到 `lg:h-screen` 与三行 grid 预算，但现有子组件仍带有较重的最小高度、内层滚动和固定卡片高度。结果是中部主舞台与右侧栏被压缩，当前发言区域可能不可见；底部态势区又在父级滚动和子级内容高度之间产生冲突，表现为夜间焦点、古堡宾客席滚动条异常。

## Goals / Non-Goals

**Goals:**

- 让 1920x1080 桌面视口下的当前发言、最近发言账册、局势摘要、夜间焦点和古堡宾客席默认可读。
- 明确每个桌面区域的高度预算和滚动责任，避免父子容器重复裁剪。
- 保持主舞台优先，同时让右侧栏和底部态势区在有限空间内有稳定降级方式。
- 保留移动端纵向布局和现有数据流。

**Non-Goals:**

- 不重做整体视觉主题或新增页面。
- 不改变服务端接口、消息排序、玩家状态派生或对局推进逻辑。
- 不引入新的布局库、虚拟列表或复杂测量逻辑。
- 不把所有历史日志强行铺满页面；超长内容仍可局部滚动。

## Decisions

### 1. 以单一滚动责任修复桌面区域边界

桌面端继续使用有限视口预算，但每个区域只能有一个明确滚动 owner。`GameShell` 负责分配顶部、中部和底部高度；`NarrativeLog`、`SpeechLedger`、底部态势区只在各自内容超出时局部滚动，避免同一个方向上父容器 `overflow-auto` 与子容器 `ScrollArea` 同时争抢滚动。

替代方案是移除桌面端固定视口，回到自然页面滚动。该方案稳定但会退化此前“主要观战内容一屏可见”的目标，因此不作为主方案。

### 2. 中部主舞台优先保留当前发言

`NarrativeLog` 的标题、指标和当前镜头区域需要在桌面受限高度下压缩间距，而不是继续依赖较高的 `min-h`。列表区域可以滚动，但当前镜头/当前发言摘要必须位于可见区域。`SpeechLedger` 也应获得明确的最小可读高度，避免被 `GameSummary` 和 `StatusStrip` 压成只剩标题。

替代方案是只降低 `NarrativeLog` 的固定最小高度。该方案能缓解左侧问题，但无法保证右侧最近发言账册可读，因此需要同步调整右侧栏 flex 分配。

### 3. 局势摘要改为紧凑、不可挤压的信息块

`GameSummary` 在右侧栏中承担快速扫读职责，应减少内部大块嵌套布局，优先采用紧凑指标行和稳定换行。它可以随内容自然占高，但不应通过复杂 grid 在窄栏内产生错位，也不应抢占发言账册的主要高度。

替代方案是把局势摘要移到底部态势区。该方案会扩大变更范围并改变信息优先级，本次只修复现有右侧栏布局。

### 4. 底部态势区统一处理夜间焦点与宾客席

`RoleSpotlight` 和 `PlayerGrid` 同属于底部态势区。实现时应让外层态势区决定是否滚动，子卡片本身保持稳定高度和 `min-h-0`，避免 `RoleSpotlight` 与 `PlayerGrid` 分别制造独立滚动条。玩家数量较多时，优先让宾客席内容在底部区域内滚动，同时夜间焦点保持可见。

替代方案是给两个卡片都独立设置滚动。该方案容易形成多重滚动条，也是当前异常体验的来源之一。

## Risks / Trade-offs

- 压缩标题和指标区域可能降低视觉仪式感 -> 以当前发言可见性优先，保留核心标签和必要统计。
- 只用 CSS 调整可能难以覆盖所有视口高度 -> 用 1920x1080 作为主验收，并补充较矮桌面视口回归检查。
- 底部态势区统一滚动可能让超长宾客席需要局部浏览 -> 这是比页面级混乱滚动更可控的取舍。

## Migration Plan

1. 先补充或更新组件测试，锁定 `GameShell`、`SpeechLedger`、`GameSummary` 和底部态势区的布局契约。
2. 调整 `GameShell` 的 grid/flex 行高与 overflow 分配。
3. 调整 `NarrativeLog`、`SpeechLedger` 和 `GameSummary` 的桌面端高度、间距与可压缩规则。
4. 调整 `RoleSpotlight`、`PlayerGrid` 或 `App.tsx` 中底部态势区的容器关系，统一滚动边界。
5. 运行单元测试、类型检查和 lint。
6. 启动 Vite，在 1920x1080 和一个较矮桌面视口验证当前发言、摘要和底部态势区滚动表现。

## Open Questions

- 无。当前按用户列出的三类 UI 回归作为完整范围处理。
```

## openspec/changes/fix-game-console-scroll-layout/tasks.md

- Source: openspec/changes/fix-game-console-scroll-layout/tasks.md
- Lines: 1-23
- SHA256: 3dcf5586e54474ec126d093b976291627da7376197b2fc92362e5c5e3068618b

```md
## 1. Layout Contract Tests

- [ ] 1.1 Update `GameShell` tests to assert the desktop layout exposes bounded main, side, and situation regions without relying on competing overflow rules.
- [ ] 1.2 Add focused component coverage for `SpeechLedger` and `GameSummary` so the newest speech and summary metrics remain present in constrained containers.
- [ ] 1.3 Add or update coverage for bottom situation composition so night focus and guest seat regions use a single predictable overflow boundary.

## 2. Main Stage And Side Rail

- [ ] 2.1 Adjust `GameShell` desktop row sizing, min-height, and overflow rules to preserve a readable middle row and stable bottom situation area.
- [ ] 2.2 Tune `NarrativeLog` spacing and minimum-height behavior so the current focus/current speech summary stays visible before the historical list scrolls.
- [ ] 2.3 Tune `SpeechLedger` height/flex behavior so the latest speech record is not squeezed out by the summary or status strip.
- [ ] 2.4 Refactor `GameSummary` into a compact right-rail layout that keeps metrics aligned at the existing side-rail width.

## 3. Bottom Situation Region

- [ ] 3.1 Adjust `App.tsx`, `RoleSpotlight`, and `PlayerGrid` composition so night focus remains visible and guest seats scroll only within the intended region when needed.
- [ ] 3.2 Verify mobile and narrow desktop layouts continue to use natural vertical flow without desktop-only clipping.

## 4. Verification

- [ ] 4.1 Run focused tests for game layout components and app composition.
- [ ] 4.2 Run `npm run typecheck`, `npm run lint`, and the relevant Vitest suite.
- [ ] 4.3 Use browser verification at 1920x1080 and one shorter desktop viewport to confirm current speech visibility, organized summary layout, and normal scrollbars for night focus and guest seats.
```

## openspec/changes/fix-game-console-scroll-layout/specs/werewolf-web-frontend/spec.md

- Source: openspec/changes/fix-game-console-scroll-layout/specs/werewolf-web-frontend/spec.md
- Lines: 1-50
- SHA256: 60814358575f4387bc7dc1fabf2e03ad1d64b772b6ad91a9487745eab7ff336f

```md
## MODIFIED Requirements

### Requirement: Dual-mode werewolf web experience

The web frontend SHALL render a lobby-first entry and, once the user enters the spectator game view, SHALL keep the desktop spectator layout readable within the target 1920x1080 viewport without relying on default document-level scrolling for primary content. The desktop layout SHALL preserve visible access to the current narrative focus, latest speech ledger, game summary, night focus, and guest seat overview with stable local overflow boundaries.

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

#### Scenario: Current speech remains visible in constrained desktop height

- **GIVEN** the user is viewing the desktop spectator view
- **AND** synchronized messages include a current or latest speech item
- **WHEN** the available desktop height is constrained by the header, side rail, and player situation regions
- **THEN** the narrative stage still shows the current narrative focus or current speech summary without requiring the user to scroll the page
- **AND** the latest speech ledger keeps enough visible height to show at least the ledger heading and the newest speech record when speech records exist

#### Scenario: Summary and situation regions keep stable overflow boundaries

- **GIVEN** the user is viewing the desktop spectator view
- **WHEN** the right-side game summary, night focus, and guest seat overview render together with the main stage
- **THEN** the game summary remains organized within the side rail without overlapping or visually scrambling its metrics
- **AND** the night focus and guest seat overview do not create competing nested vertical scrollbars for the same content area
- **AND** any required overflow is constrained to the intended local situation or list region
```

