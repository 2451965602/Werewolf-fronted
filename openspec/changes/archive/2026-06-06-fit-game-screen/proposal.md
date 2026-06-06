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
