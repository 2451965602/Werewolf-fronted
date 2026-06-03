---
comet_change: implement-werewolf-frontend
role: technical-design
canonical_spec: openspec
status: in-review
archived-with: 2026-06-03-implement-werewolf-frontend
status: final
---

## 目标

为当前仓库的 `web/` 提供一套可演示、可联调的狼人杀前端。第一版优先保证现有后端接口 `start / next / state / messages / health` 可稳定驱动页面，其次再承接参考仓库的视觉记忆点。

该前端面向演示体验，而不是纯调试面板。因此信息层级必须清楚、操作必须直接，但页面仍应保留“舞台感”而不是后台工具感。

## 采用方案

采用“**双态单页**”方案：应用仍只有一个页面入口，不引入多路由；页面根据服务端游戏是否已初始化，在两个视觉态之间切换。

```text
App
└─ GameExperience
   ├─ PreGameScreen
   │  ├─ Hero copy
   │  ├─ Start CTA
   │  └─ Health / guidance cards
   └─ GameConsole
      ├─ PhaseHero
      ├─ ControlPanel
      ├─ GameSummary
      ├─ NarrativeLog
      ├─ PlayerGrid
      └─ StatusStrip
```

- `PreGameScreen` 用来承接未开局状态，借用参考仓库 `SetupScreen` 的氛围背景、标题和主 CTA，但不展示当前后端不支持的角色选择、本地规则配置或前端自治状态。
- `GameConsole` 承接开局后的主操作流，沿用当前已成型的 `game-shell + hero + rail + log + players` 结构，避免推翻现有的 React 组件拆分。
- 页面切换只由服务端状态决定。前端不维护“看起来已经开始但服务端其实没开始”的本地幻象状态。

## 页面结构与职责

### PreGameScreen

未开局态页面承担三件事：

1. 告诉用户当前页面是狼人杀演示入口。
2. 提供单一、明确的“开始游戏”动作。
3. 用少量说明和状态提示建立真实预期，而不是承诺后端暂不支持的玩法交互。

页面内容包括：

- 顶部主视觉区：标题、简短说明、副标题。
- 主操作区：`开始游戏` 按钮，必要时附一个轻量 `检查服务状态` 入口。
- 说明卡片：展示“页面会在开局后切到控制台”“当前版本只消费服务端状态”等信息。

### GameConsole

开局后的页面结构保持当前已经验证过的联调布局：

- `PhaseHero`：聚焦当前阶段、轮次、赢家状态、刷新时间。
- `ControlPanel`：集中放置 `开始游戏`、`下一阶段`、`手动刷新` 等动作。
- `GameSummary`：提炼赢家、轮次、存活人数、关键提示。
- `NarrativeLog`：直接消费 `messages` 接口，承载叙事与系统消息。
- `PlayerGrid`：展示玩家基础信息、生死状态、公开角色/阵营字段。
- `StatusStrip`：承载接口错误、降级提示和可重试状态。

## 数据与状态流

前端继续使用三层结构：

1. `api` 层：封装 `/api/game/*` 请求和错误归一化。
2. `view-model` / hook 层：协调请求状态、页面切换条件、自动刷新策略。
3. `ui` 层：纯渲染欢迎页与控制台组件。

数据流如下：

```text
Initial load
  ├─ GET /api/game/health
  ├─ GET /api/game/state
  └─ GET /api/game/messages
         ↓
  derive screen mode (pregame or console)

Start game
  ├─ POST /api/game/start
  └─ on success -> refresh state + messages

Advance phase
  ├─ POST /api/game/next
  └─ on success -> refresh state + messages

Background sync
  └─ lightweight polling for state + messages
```

页面模式判定规则：

- 服务端可达且游戏未初始化：进入 `PreGameScreen`。
- 已有有效游戏状态：进入 `GameConsole`。
- 请求失败：保留上一次稳定页面态，并通过 `StatusStrip` 暴露错误。

## 刷新策略

第一版采用“**关键操作强一致刷新 + 平时轻量自动同步**”的混合模式。

- `开始游戏`、`下一阶段`、`手动刷新` 后，前端必须立即串行补拉一次 `state + messages`，确保用户操作和画面结果对齐。
- 在用户不操作时，前端以保守频率轻量轮询 `state + messages`，让消息和局势在演示时能自动更新，但不把页面设计成严格实时系统。
- 轮询失败不应导致整页退化；只记录错误并由下一轮或手动刷新恢复。

这个策略满足两个目标：

- 对关键操作保持高可预测性。
- 对演示过程保持足够“活着”的页面反馈。

## 错误处理与降级

- `health` 失败：提示服务异常，但不单独打断页面主流程。
- `state` 失败：保留上次可用状态；若首次加载就失败，则展示明确错误空态。
- `messages` 失败：控制台主体仍然可用，日志区降级为错误提示与重试入口。
- `start` / `next` 失败：不做本地乐观更新；保留当前视图并给出失败提示。

前端所有错误都应集中成统一的用户可读提示，避免把原始异常直接散落到多个组件中。

## 视觉映射原则

参考仓库提供的是视觉语言，不是代码模板。本次只迁移下列视觉原则：

- 欢迎页的沉浸式背景、标题层级和主动作按钮。
- 阶段横幅的强聚焦信息组织。
- 玩家卡片的网格化陈列与生死状态表达。
- 日志面板的分层叙事感，而不是原样复刻旧仓库样式类名。

明确不迁移：

- 角色预选与本地游戏配置。
- 前端自治状态机。
- 语音、TTS、多语言和复杂私有交互。

## 文件落点

- `web/src/App.tsx`：切换为 `PreGameScreen` / `GameConsole` 的单入口编排。
- `web/src/features/game/use-game-console.ts`：页面态判定、刷新协调、轮询生命周期。
- `web/src/features/game/view-model.ts`：欢迎页与控制台共享视图模型字段。
- `web/src/features/game/components/*`：复用并扩展现有 hero、summary、log、player、status 组件。
- 新增 `PreGameScreen` 相关组件文件，避免把欢迎页逻辑塞进现有控制台组件。
- `web/src/index.css`：补齐主题变量、背景氛围和欢迎页样式。

## 测试策略

- `api.test.ts`：继续验证请求封装与错误归一化。
- `view-model.test.ts`：新增双态页面切换、关键操作后补刷新、消息失败降级等行为测试。
- 构建验证至少覆盖：`npm run typecheck`、`npm run test`、`npm run build`。

## 取舍与风险

- 双态页面比单页控制台更有演示感，但会增加欢迎页与控制台之间的切换逻辑。通过“单入口 + 单数据源”控制复杂度。
- 自动同步能提升演示体验，但会引入额外请求频率。第一版用保守轮询，必要时后续再抽成可配置策略。
- 参考仓库的视觉能力强于当前后端能力，因此页面必须始终以服务端真实字段为边界，避免视觉承诺超过真实玩法支持。
