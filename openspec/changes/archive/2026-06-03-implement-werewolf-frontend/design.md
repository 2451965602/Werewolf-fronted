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

## Risks And Mitigations

- 风险：参考前端交互远比当前后端能力丰富，用户预期可能错位。
  缓解：在界面与文档中显式按“当前后端可用动作”设计，不承诺旧项目完整玩法操作。
- 风险：当前 `GameState` 信息有限，部分视觉状态无法复现。
  缓解：优先完成核心信息展示；缺失字段作为后续 capability 迭代，而不是在前端伪造状态。
- 风险：`web/` 目录目前像独立仓库，可能影响后续统一开发体验。
  缓解：本 change 先专注界面实现，后续若需要再单独处理仓库结构治理。

## Expected Deliverables

- 一个可运行的游戏首页/主界面。
- 一套与后端 API 对接的前端请求与状态管理代码。
- 一组参考旧项目风格、但基于当前技术栈重写的 UI 组件。
- 基础加载态、错误态和空态处理。
