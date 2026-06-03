# Comet Design Handoff

- Change: implement-werewolf-frontend
- Phase: design
- Mode: compact
- Context hash: 0b43ac0e14782cecd88869aac4eb98524d006b10764c8912c2825c7afdfcdd78

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/implement-werewolf-frontend/proposal.md

- Source: openspec/changes/implement-werewolf-frontend/proposal.md
- Lines: 1-25
- SHA256: b78ef3608b15e271bd14685e4ce90a1fad5f4b022272cff11ffedb7a73e15486

```md
## Why

当前仓库已经具备狼人杀后端能力和 `web/` 前端骨架，但前端仍是模板页，无法展示游戏状态，也无法驱动现有的 `start / next / state / messages` 接口。参考仓库 `E:\VSCode\golang\Werewolf` 已经验证了狼人杀界面的视觉语言和信息组织方式，因此现在需要为当前项目补齐一套可用、可演示、可继续演进的游戏前端。

## What Changes

- 在当前仓库的 `web/` 中实现一套狼人杀前端界面，视觉与信息层级参考 `E:\VSCode\golang\Werewolf`。
- 新增前端页面结构、游戏状态展示、玩家列表、消息日志、主操作区和基础加载/错误状态。
- 对接现有后端 API：`POST /api/game/start`、`POST /api/game/next`、`GET /api/game/state`、`GET /api/game/messages`、`GET /api/game/health`。
- 将参考仓库中的“氛围感 UI、阶段展示、玩家卡片、日志面板”迁移为适配当前后端数据模型的 React + TypeScript 版本。
- 明确排除旧前端中的本地游戏引擎、语音识别、TTS、多语言、复杂角色交互与前端自治状态机，不在本次变更范围内。

## Capabilities

### New Capabilities
- `werewolf-web-frontend`: 定义当前项目的狼人杀 Web 界面、前端状态获取方式、页面模块和用户可执行操作。

### Modified Capabilities
- None.

## Impact

- Affected code: `web/src/**`、`web/package.json` 相关前端实现文件。
- Affected APIs: 消费现有 `werewolf-hertz-api` 提供的游戏生命周期、状态与消息接口，但本次 proposal 不要求新增或修改后端接口契约。
- Affected systems: 前端构建链路（Vite、React、TypeScript、shadcn/Tailwind 体系）与当前 Go 后端联调方式。
```

## openspec/changes/implement-werewolf-frontend/design.md

- Source: openspec/changes/implement-werewolf-frontend/design.md
- Lines: 1-96
- SHA256: d6b6e22caaefdc1bc3412cb0133c7d76453ed157f0256f1a48a98875a83572e9

[TRUNCATED]

```md
## Overview

本次变更在现有 `web/` Vite 前端骨架上实现狼人杀游戏界面，参考旧项目的舞台感布局、玩家卡片、阶段横幅和日志面板，但不复刻旧项目的前端自治游戏逻辑。新前端只负责调用当前 Go 后端 API、展示后端返回的状态，并提供有限的用户动作入口。

## Goals

- 让用户打开前端后可以直接看到可用的狼人杀控制台，而不是模板页。
- 复用参考仓库最有辨识度的视觉元素：深色氛围背景、阶段焦点区、玩家网格、消息日志区、主操作按钮。
- 以前后端职责分离为前提，所有游戏推进以服务端状态为准。

## Non-Goals

- 不迁移旧仓库里的本地游戏引擎与角色行动状态机。
- 不实现语音输入、TTS、多语言切换、复杂投票流程或角色私有交互。
- 不在本阶段引入新的后端 API，除非后续 design 阶段明确补充需求。

## Architecture

前端采用三层结构：

1. `api` 层：封装对 `/api/game/*` 的请求、错误归一化和数据类型。
2. `state/view-model` 层：负责加载、刷新、派发 start/next 操作，并将 `GameState` 转成页面消费的数据。
3. `ui` 层：组合页面区块并渲染参考旧项目风格的界面。

建议页面结构如下：

```text
GamePage
|- Hero / Phase Banner
|- Control Panel
|  |- Start Game
|  |- Next Phase
|  |- Refresh
|- Summary Cards
|- Player Grid
|- Message Log
|- Status / Error Strip
```

## Key Decisions

### 1. 保留当前技术栈，不回迁旧前端栈

继续使用当前 `web/` 已存在的 React 19 + TypeScript + Vite + shadcn/Tailwind 体系，而不是把参考仓库的 JSX/Tailwind 代码原样搬入。这样能保持当前仓库的类型安全、组件风格和后续可维护性。

### 2. 只迁移“界面语言”，不迁移“前端游戏引擎”

参考仓库的核心价值在于视觉组织与交互节奏，不在于它的本地状态机。当前后端只暴露整局推进接口，因此新界面应围绕“读取状态、展示状态、推进阶段”设计，避免做一套与服务端冲突的本地规则实现。

### 3. 用服务端数据驱动简化后的玩家卡片

玩家卡片展示 `id / name / alive / role / team` 等当前接口已经提供的数据。旧项目中依赖前端私有状态的内容，例如“守卫保护痕迹”“女巫剩余药水可视按钮”“发言轮次高亮”，只在服务端已有数据支撑时显示，否则不伪造。

### 4. 日志区直接消费 messages 接口

日志面板使用 `GET /api/game/messages` 的有序消息流，按 `type / speaker / round / phase` 分类展示。视觉上参考旧项目的彩色 log entry，但不引入朗读或回放功能。

## Data Flow

```text
User Action
   |
   +--> Start Game ----> POST /api/game/start ----+
   |                                              |
   +--> Next Phase ---> POST /api/game/next -----+--> normalize GameState --> render UI
   |                                              |
   +--> Refresh -------> GET /api/game/state ----+
   |
   +--> Load Messages --> GET /api/game/messages -> render log
```

页面首次加载时先探测 `health` 或直接拉取 `state/messages`。若尚未初始化游戏，界面显示空态和“开始游戏”主按钮。

## UI Mapping From Reference Project

- `SetupScreen` 的氛围背景、标题样式、主 CTA，迁移为当前项目的欢迎区和开始游戏入口。
- `GameInfo` 的阶段聚焦区，迁移为顶部 Phase Banner 与摘要信息卡。
- `PlayerCard` 的网格组织与生死状态表达，迁移为服务端状态驱动的玩家卡片。
- `GameLog` 的日志面板结构和色彩区分，迁移为消息历史区域。
- `ActionPanel` 的右侧控制思路，迁移为适配当前后端能力的控制面板，仅保留可执行动作。
```

Full source: openspec/changes/implement-werewolf-frontend/design.md

## openspec/changes/implement-werewolf-frontend/tasks.md

- Source: openspec/changes/implement-werewolf-frontend/tasks.md
- Lines: 1-6
- SHA256: bb6afa07052466a693daf3f5fba65d0e5657329ff124556d37b803abd952f53b

```md
- [ ] 梳理当前 `web/` 前端骨架、参考仓库组件结构与现有后端 API 数据模型，确定最终页面模块边界。
- [ ] 定义前端数据类型与 API 客户端，封装 `start`、`next`、`state`、`messages`、`health` 请求及错误处理。
- [ ] 实现游戏主页面布局，包括欢迎区、阶段横幅、摘要信息、控制面板、玩家网格、消息日志和状态提示。
- [ ] 将参考仓库中的视觉语言迁移到当前技术栈，补齐主题变量、背景氛围、卡片样式与日志样式。
- [ ] 将页面与后端联调，确保开始游戏、推进阶段、刷新状态和消息展示可用。
- [ ] 补充前端侧必要的类型检查、基础测试或至少构建验证，并整理已知限制。
```
