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
