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
