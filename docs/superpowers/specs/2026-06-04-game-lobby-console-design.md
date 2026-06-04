---
role: technical-design
status: draft
topic: game-lobby-console
change: refactor-game-lobby-console
archived-with: 2026-06-04-refactor-game-lobby-console
status: final
---

## 目标

将当前狼人杀前端从测试演示台重构为正式观战大厅与对局控制台，优先解决首页默认跳转、1080p 首屏高度、AI/投票时间线可见性以及整体视觉产品化。

## 核心决策

1. 首页始终先进入 Lobby，不因存在进行中对局而自动进入 Console。
2. 进行中对局通过显式卡片继续，不伪造服务端状态。
3. Console 采用两栏 + 下方态势区结构，局部滚动优先。
4. NarrativeLog 成为主舞台，区分发言、投票、系统播报。
5. shadcn 组件优先，减少纯样式型自定义容器。

## 结果对照

- Lobby 已具备开始新局、检查服务、继续当前对局和空状态卡。
- Console 已收敛为阶段焦点、时间线主区、操作侧栏、玩家态势区。
- 关键验证命令 `test / lint / typecheck / build` 均通过。
