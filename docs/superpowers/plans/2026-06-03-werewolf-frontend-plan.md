---
change: implement-werewolf-frontend
design-doc: docs/superpowers/specs/2026-06-03-werewolf-frontend-design.md
base-ref: a57fd1af411a95bf8e3b84a9b30b2ca387c67ebb
archived-with: 2026-06-03-implement-werewolf-frontend
---

# Werewolf Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付一个由服务端状态驱动的狼人杀双态前端，未开局时展示欢迎页，开局后展示控制台，并保持 `start / next / state / messages / health` 的稳定联调体验。

**Architecture:** 保留当前 `api + useGameConsole + view-model + components` 主干，把“欢迎页/控制台切换”和“关键操作后补刷新 + 轻量自动同步”收敛到 `features/game` 里。把复杂的异步编排提炼成可单测的纯函数模块，React hook 只负责生命周期、定时器和 UI 事件绑定。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Tailwind CSS 4、shadcn/ui。

archived-with: 2026-06-03-implement-werewolf-frontend
---

## File Structure

- Modify: `web/src/features/game/types.ts` - 扩展双态页面和服务状态所需类型。
- Modify: `web/src/features/game/view-model.ts` - 补充欢迎页信息、屏幕模式和服务状态映射。
- Modify: `web/src/features/game/view-model.test.ts` - 为双态映射补失败测试与通过测试。
- Create: `web/src/features/game/console-operations.ts` - 纯函数/异步编排层，负责初始加载、关键操作后的补刷新、消息降级。
- Create: `web/src/features/game/console-operations.test.ts` - 单测异步编排行为。
- Modify: `web/src/features/game/use-game-console.ts` - 连接编排层、轮询、React 生命周期。
- Create: `web/src/features/game/components/pre-game-screen.tsx` - 未开局欢迎页。
- Create: `web/src/features/game/components/pre-game-screen.test.tsx` - 验证欢迎页关键文案与按钮。
- Modify: `web/src/App.tsx` - 在欢迎页与控制台之间切换。
- Modify: `web/src/index.css` - 补齐欢迎页的背景、字体和氛围 token。
- Modify: `openspec/changes/implement-werewolf-frontend/tasks.md` - 按完成情况勾选任务。

## Task 1: 扩展视图模型，明确欢迎页与控制台的边界

**Files:**
- Modify: `web/src/features/game/types.ts`
- Modify: `web/src/features/game/view-model.ts`
- Modify: `web/src/features/game/view-model.test.ts`

- [ ] **Step 1: 写失败测试，锁定双态字段和欢迎页 copy**

在 `web/src/features/game/view-model.test.ts` 追加：

```ts
it("marks uninitialized state as pregame mode", () => {
  const viewModel = createUninitializedViewModel()

  expect(viewModel.screenMode).toBe("pregame")
  expect(viewModel.serviceHealth.label).toBe("等待服务连接")
  expect(viewModel.heroIntro.title).toContain("Werewolf")
})

it("marks ready state as console mode", () => {
  const viewModel = buildGameViewModel(makeState({ phase: "night" }), [])

  expect(viewModel.screenMode).toBe("console")
  expect(viewModel.serviceHealth.label).toBe("服务正常")
  expect(viewModel.heroIntro.primaryActionLabel).toBe("开始游戏")
})
```

- [ ] **Step 2: 运行 view-model 单测，确认它先失败**

Run: `npm run test -- src/features/game/view-model.test.ts`
Expected: FAIL，提示 `screenMode`、`serviceHealth` 或 `heroIntro` 尚不存在。

- [ ] **Step 3: 扩展类型与映射实现**

更新 `web/src/features/game/types.ts` 的 `GameViewModel`：

```ts
export interface GameViewModel {
  screenMode: "pregame" | "console"
  isInitialized: boolean
  currentRound: number
  phaseVariant: "idle" | ApiPhase
  phaseLabel: string
  winnerLabel: string
  serviceHealth: {
    label: string
    tone: "ok" | "warning" | "error"
  }
  heroIntro: {
    title: string
    description: string
    primaryActionLabel: string
  }
  players: ApiPlayer[]
  summary: {
    currentRound: number
    phaseLabel: string
    winnerLabel: string
    aliveCount: number
    deadCount: number
    wolfCountAlive: number
    lastNightKilled: number | null
    lastNightKilledPlayer: string | null
  }
  timeline: TimelineItem[]
  emptyState: {
    title: string
    description: string
  }
}
```

更新 `web/src/features/game/view-model.ts`：

```ts
return {
  screenMode: "console",
  isInitialized: true,
  currentRound: state.round,
  phaseVariant: state.phase,
  phaseLabel,
  winnerLabel,
  serviceHealth: {
    label: "服务正常",
    tone: "ok",
  },
  heroIntro: {
    title: "Werewolf Command Stage",
    description: "通过服务端状态驱动当前局势、日志和玩家状态。",
    primaryActionLabel: "开始游戏",
  },
  players: state.players,
  summary: {
    currentRound: state.round,
    phaseLabel,
    winnerLabel,
    aliveCount: alivePlayers.length,
    deadCount: state.players.length - alivePlayers.length,
    wolfCountAlive: alivePlayers.filter((player) => player.team === "wolf").length,
    lastNightKilled: state.lastNightKilled ?? null,
    lastNightKilledPlayer,
  },
  timeline: messages.map((message, index) => mapTimelineItem(message, index)),
  emptyState: {
    title: "点击开始游戏以初始化狼人杀演示台",
    description: "开局后，这里会显示阶段推进、系统播报和玩家发言时间线。",
  },
}
```

`createUninitializedViewModel()` 返回：

```ts
return {
  screenMode: "pregame",
  isInitialized: false,
  currentRound: 0,
  phaseVariant: "idle",
  phaseLabel: "未开局",
  winnerLabel: "",
  serviceHealth: {
    label: "等待服务连接",
    tone: "warning",
  },
  heroIntro: {
    title: "Werewolf Command Stage",
    description: "连接服务后可直接开始一局新的狼人杀演示。",
    primaryActionLabel: "开始游戏",
  },
  players: [],
  summary: {
    currentRound: 0,
    phaseLabel: "未开局",
    winnerLabel: "",
    aliveCount: 0,
    deadCount: 0,
    wolfCountAlive: 0,
    lastNightKilled: null,
    lastNightKilledPlayer: null,
  },
  timeline: [],
  emptyState: {
    title: "点击开始游戏以初始化狼人杀演示台",
    description: "当前还没有游戏状态。开始游戏后可以手动推进阶段并观察日志。",
  },
}
```

- [ ] **Step 4: 重新运行 view-model 单测**

Run: `npm run test -- src/features/game/view-model.test.ts`
Expected: PASS.

- [ ] **Step 5: 提交 Task 1**

```bash
git add web/src/features/game/types.ts web/src/features/game/view-model.ts web/src/features/game/view-model.test.ts
git commit -m "feat: add dual-mode game view model"
```

## Task 2: 把接口编排从 hook 中抽离，并补上关键刷新语义

**Files:**
- Create: `web/src/features/game/console-operations.ts`
- Create: `web/src/features/game/console-operations.test.ts`
- Modify: `web/src/features/game/use-game-console.ts`
- Modify: `web/src/features/game/api.ts`

- [ ] **Step 1: 先写编排层失败测试**

创建 `web/src/features/game/console-operations.test.ts`：

```ts
import { describe, expect, it, vi } from "vitest"
import type { ApiGameState } from "./types"

import {
  advanceConsole,
  loadConsoleSnapshot,
  startConsole,
} from "./console-operations"

function makeState(overrides: Partial<ApiGameState> = {}): ApiGameState {
  return {
    round: 1,
    phase: "day",
    ended: false,
    winner: "",
    players: [],
    inspections: [],
    witchHealUsed: false,
    witchPoisonUsed: false,
    ...overrides,
  }
}

it("loads pregame snapshot when state is uninitialized", async () => {
  const snapshot = await loadConsoleSnapshot({
    fetchHealth: vi.fn().mockResolvedValue({ status: "ok" }),
    fetchGameState: vi.fn().mockResolvedValue({ kind: "uninitialized" }),
    fetchMessages: vi.fn(),
  })

  expect(snapshot.viewModel.screenMode).toBe("pregame")
  expect(snapshot.error).toBe("")
})

it("keeps console usable when messages request fails", async () => {
  const snapshot = await loadConsoleSnapshot({
    fetchHealth: vi.fn().mockResolvedValue({ status: "ok" }),
    fetchGameState: vi.fn().mockResolvedValue({ kind: "ready", state: makeState() }),
    fetchMessages: vi.fn().mockRejectedValue(new Error("messages down")),
  })

  expect(snapshot.viewModel.screenMode).toBe("console")
  expect(snapshot.error).toContain("messages down")
})

it("refreshes state and messages after start", async () => {
  const startGame = vi.fn().mockResolvedValue(makeState())
  const fetchMessages = vi.fn().mockResolvedValue([])

  await startConsole({ startGame, fetchMessages })

  expect(startGame).toHaveBeenCalledTimes(1)
  expect(fetchMessages).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: 运行编排层测试，确认它先失败**

Run: `npm run test -- src/features/game/console-operations.test.ts`
Expected: FAIL，提示模块或函数不存在。

- [ ] **Step 3: 实现纯编排层并瘦身 hook**

创建 `web/src/features/game/console-operations.ts`：

```ts
import {
  fetchGameState,
  fetchHealth,
  fetchMessages,
  startGame,
  advancePhase,
  RequestError,
  type GameStateResult,
} from "./api"
import { buildGameViewModel, createUninitializedViewModel } from "./view-model"

export async function loadConsoleSnapshot(deps = {
  fetchHealth,
  fetchGameState,
  fetchMessages,
}) {
  const [{ status: healthStatus }, stateResult, messagesResult] = await Promise.all([
    deps.fetchHealth().catch(() => ({ status: "down" })),
    deps.fetchGameState(),
    deps.fetchMessages().catch((error: unknown) => error),
  ])

  if (stateResult.kind === "uninitialized") {
    return {
      viewModel: createUninitializedViewModel(),
      error: "",
      healthStatus,
    }
  }

  return {
    viewModel: buildGameViewModel(
      stateResult.state,
      messagesResult instanceof Error ? [] : messagesResult
    ),
    error: messagesResult instanceof Error ? String(messagesResult.message) : "",
    healthStatus,
  }
}

export async function startConsole(deps = { startGame, fetchMessages }) {
  const state = await deps.startGame()
  const messages = await deps.fetchMessages().catch(() => [])
  return buildGameViewModel(state, messages)
}

export async function advanceConsole(deps = { advancePhase, fetchMessages }) {
  const state = await deps.advancePhase()
  const messages = await deps.fetchMessages().catch(() => [])
  return buildGameViewModel(state, messages)
}
```

把 `web/src/features/game/use-game-console.ts` 改成只做状态机和生命周期：

```ts
import { useCallback, useEffect, useEffectEvent, useState } from "react"
import {
  advanceConsole,
  loadConsoleSnapshot,
  startConsole,
} from "./console-operations"

const AUTO_SYNC_MS = 5000

const pollSnapshot = useEffectEvent(async () => {
  const snapshot = await loadConsoleSnapshot()
  setViewModel(snapshot.viewModel)
  setRequestState((prev) => ({ ...prev, error: snapshot.error }))
})

useEffect(() => {
  const timer = window.setInterval(() => {
    void pollSnapshot()
  }, AUTO_SYNC_MS)

  return () => window.clearInterval(timer)
}, [pollSnapshot])
```

- [ ] **Step 4: 跑编排层与现有 API 测试**

Run: `npm run test -- src/features/game/console-operations.test.ts src/features/game/api.test.ts`
Expected: PASS.

- [ ] **Step 5: 提交 Task 2**

```bash
git add web/src/features/game/api.ts web/src/features/game/console-operations.ts web/src/features/game/console-operations.test.ts web/src/features/game/use-game-console.ts
git commit -m "feat: add server-driven console orchestration"
```

## Task 3: 新增欢迎页组件，并在 App 中切换双态页面

**Files:**
- Create: `web/src/features/game/components/pre-game-screen.tsx`
- Create: `web/src/features/game/components/pre-game-screen.test.tsx`
- Modify: `web/src/App.tsx`

- [ ] **Step 1: 先写欢迎页组件测试**

创建 `web/src/features/game/components/pre-game-screen.test.tsx`：

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { PreGameScreen } from "./pre-game-screen"

it("renders hero copy and primary action", () => {
  const html = renderToStaticMarkup(
    <PreGameScreen
      heroIntro={{
        title: "Werewolf Command Stage",
        description: "连接服务后可直接开始一局新的狼人杀演示。",
        primaryActionLabel: "开始游戏",
      }}
      serviceHealth={{ label: "等待服务连接", tone: "warning" }}
      requestState={{ isStarting: false, isRefreshing: false, error: "" }}
      onStart={vi.fn()}
      onRefresh={vi.fn()}
    />
  )

  expect(html).toContain("Werewolf Command Stage")
  expect(html).toContain("开始游戏")
  expect(html).toContain("等待服务连接")
})
```

- [ ] **Step 2: 运行欢迎页组件测试，确认它先失败**

Run: `npm run test -- src/features/game/components/pre-game-screen.test.tsx`
Expected: FAIL，提示组件不存在。

- [ ] **Step 3: 实现欢迎页并接入 App 切换**

创建 `web/src/features/game/components/pre-game-screen.tsx`：

```tsx
import { Button } from "@/components/ui/button"

interface PreGameScreenProps {
  heroIntro: {
    title: string
    description: string
    primaryActionLabel: string
  }
  serviceHealth: {
    label: string
    tone: "ok" | "warning" | "error"
  }
  requestState: {
    isStarting: boolean
    isRefreshing: boolean
    error: string
  }
  onStart: () => Promise<void>
  onRefresh: () => Promise<void>
}

export function PreGameScreen({
  heroIntro,
  serviceHealth,
  requestState,
  onStart,
  onRefresh,
}: PreGameScreenProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl">
      <div className="space-y-6">
        <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">
          未开局 / 服务端驱动
        </p>
        <h1 className="font-heading text-5xl leading-none md:text-7xl">
          {heroIntro.title}
        </h1>
        <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
          {heroIntro.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={onStart} disabled={requestState.isStarting}>
            {heroIntro.primaryActionLabel}
          </Button>
          <Button variant="outline" onClick={onRefresh}>
            检查服务状态
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          当前服务状态：{serviceHealth.label}
        </p>
      </div>
    </section>
  )
}
```

把 `web/src/App.tsx` 改成：

```tsx
const isPregame = viewModel.screenMode === "pregame"

return isPregame ? (
  <PreGameScreen
    heroIntro={viewModel.heroIntro}
    serviceHealth={viewModel.serviceHealth}
    requestState={requestState}
    onStart={start}
    onRefresh={refresh}
  />
) : (
  <GameShell
    hero={
      <PhaseHero
        isInitialized={viewModel.isInitialized}
        currentRound={viewModel.currentRound}
        phaseLabel={viewModel.phaseLabel}
        phaseVariant={viewModel.phaseVariant}
        winnerLabel={viewModel.winnerLabel}
      />
    }
    log={<NarrativeLog items={viewModel.timeline} emptyState={viewModel.emptyState} />}
    rail={
      <div className="space-y-6">
        <ControlPanel
          requestState={requestState}
          isInitialized={viewModel.isInitialized}
          onRefresh={refresh}
          onStart={start}
          onAdvance={advance}
        />
        <GameSummary summary={viewModel.summary} />
        <StatusStrip error={requestState.error} isInitialized={viewModel.isInitialized} />
      </div>
    }
    players={<PlayerGrid players={viewModel.players} />}
  />
)
```

- [ ] **Step 4: 跑欢迎页与 view-model 相关测试**

Run: `npm run test -- src/features/game/components/pre-game-screen.test.tsx src/features/game/view-model.test.ts`
Expected: PASS.

- [ ] **Step 5: 提交 Task 3**

```bash
git add web/src/App.tsx web/src/features/game/components/pre-game-screen.tsx web/src/features/game/components/pre-game-screen.test.tsx
git commit -m "feat: add pregame experience for web frontend"
```

## Task 4: 补齐视觉 token、完成验证并同步 OpenSpec 任务清单

**Files:**
- Modify: `web/src/index.css`
- Modify: `openspec/changes/implement-werewolf-frontend/tasks.md`

- [ ] **Step 1: 先写一条最小样式验收检查清单**

在本任务开始前，人工验收以下 4 点：

```text
1. 欢迎页首屏在桌面和移动端都能完整显示主标题与按钮。
2. 控制台页背景、卡片层级和欢迎页风格连续，不像两个独立产品。
3. 错误提示在欢迎页与控制台中都可见，不会被背景吞掉。
4. 轮询期间按钮和日志不会出现布局跳动。
```

- [ ] **Step 2: 调整全局 token 与欢迎页背景样式**

更新 `web/src/index.css`：

```css
@import "@fontsource-variable/inter";

@theme inline {
  --font-heading: "Inter Variable", "Segoe UI", sans-serif;
  --font-sans: "Inter Variable", "Segoe UI", sans-serif;
}

body {
  background-image:
    radial-gradient(circle at top, rgba(244, 114, 182, 0.12), transparent 22%),
    radial-gradient(circle at 85% 0%, rgba(56, 189, 248, 0.16), transparent 20%),
    linear-gradient(180deg, rgba(11, 15, 25, 0.98), rgba(6, 12, 24, 1));
}
```

如果欢迎页局部需要更强的发光和雾化效果，把局部类名写在 `pre-game-screen.tsx`，不要把特定布局规则继续塞进全局 `body`。

- [ ] **Step 3: 跑完整验证并更新 OpenSpec tasks**

Run in `web/`:

```bash
npm run typecheck
npm run test
npm run build
```

Expected: 三条命令全部 PASS。

然后把 `openspec/changes/implement-werewolf-frontend/tasks.md` 的 6 个复选框按实际完成情况勾掉；如果自动同步、欢迎页和联调都已完成，则应全部勾选。

- [ ] **Step 4: 复查 spec 覆盖**

确认每条 requirement 都有对应实现：

```text
- Dual-mode werewolf web experience -> App.tsx + pre-game-screen.tsx + view-model.ts
- Server-driven game controls -> console-operations.ts + use-game-console.ts + control-panel.tsx
- Hybrid synchronization -> console-operations.ts + use-game-console.ts
- Degraded failures remain operable -> console-operations.ts + StatusStrip / NarrativeLog
```

如果有 requirement 找不到落点，不要进入 verify，先补任务。

- [ ] **Step 5: 提交 Task 4**

```bash
git add web/src/index.css openspec/changes/implement-werewolf-frontend/tasks.md
git commit -m "feat: finalize werewolf web frontend experience"
```
