# Werewolf Frontend Layout Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the existing single-page Werewolf frontend into a spectator-first, visually thematic interface that covers the pregame screen and the live game console without changing backend contracts.

**Architecture:** Keep `App.tsx` as a thin state switcher driven by `useGameConsole`, extend the view model with derived spotlight/banner data, and refit the existing game components around a clearer three-zone shell: top banner, middle dual-column stage, and bottom situation zone. Prefer focused presentational components over rewriting request orchestration or inventing new client-side state.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Tailwind CSS v4, shadcn button primitives

> **Execution Checkpoint (2026-06-04):** Tasks 1-4 have been implemented in the isolated worktree `C:\Users\2451965602\.config\superpowers\worktrees\Werewolf-fronted\feat-werewolf-frontend-layout-refresh`. Final integration verification (`Task 5`) has not been run yet.

---

## File Structure

- Modify: `src/features/game/types.ts`
  Adds banner copy and role spotlight view-model slices used by the redesigned layout.
- Modify: `src/features/game/view-model.ts`
  Derives new banner/spotlight/situation data from existing `state + messages`.
- Modify: `src/features/game/view-model.test.ts`
  Covers new derived fields and ended-state behavior.
- Modify: `src/App.tsx`
  Keeps state branching but passes the new shell slots in a cleaner grouping.
- Modify: `src/features/game/components/game-shell.tsx`
  Converts the shell into an explicit banner / main stage / situation zone layout.
- Create: `src/features/game/components/role-spotlight.tsx`
  Renders the lightweight spectator-first focus panel using derived view-model data.
- Create: `src/features/game/components/game-shell.test.tsx`
  Verifies the new shell sections render in the intended hierarchy.
- Modify: `src/features/game/components/phase-hero.tsx`
  Expands the top banner from a local status card into the page anchor.
- Modify: `src/features/game/components/narrative-log.tsx`
  Keeps the log as the primary stage panel with stronger hierarchy.
- Modify: `src/features/game/components/control-panel.tsx`
  Keeps the same actions but restyles them as a director console.
- Modify: `src/features/game/components/game-summary.tsx`
  Tightens the summary into a compact side-rail card.
- Modify: `src/features/game/components/status-strip.tsx`
  Downgrades it to lightweight service/error messaging.
- Modify: `src/features/game/components/player-grid.tsx`
  Turns the player section into the bottom situation zone entry point.
- Modify: `src/features/game/components/player-card.tsx`
  Strengthens alive/dead/focus visual states.
- Modify: `src/features/game/components/pre-game-screen.tsx`
  Rebuilds the pregame page as a left-stage / right-service layout aligned with the new theme.
- Modify: `src/features/game/components/pre-game-screen.test.tsx`
  Updates the rendered expectations for the redesigned pregame screen.
- Modify: `src/index.css`
  Sets the revised theme tokens, fonts, gradients, and shared surface utilities.

### Task 1: Extend View-Model Data For Banner And Spotlight

**Files:**
- Modify: `src/features/game/types.ts`
- Modify: `src/features/game/view-model.ts`
- Test: `src/features/game/view-model.test.ts`

- [ ] **Step 1: Write the failing view-model tests for spotlight and banner copy**

```ts
it("derives role spotlight and banner copy from live state", () => {
  const viewModel = buildGameViewModel(
    makeState({
      round: 3,
      phase: "night",
      players: [
        makePlayer({ id: 1, name: "沈霖", role: "seer", team: "village", alive: true }),
        makePlayer({ id: 2, name: "顾远", role: "werewolf", team: "wolf", alive: false }),
      ],
      lastNightKilled: 2,
    }),
    [makeMessage({ content: "预言家正在观察场上异动。", phase: "night", round: 3 })]
  )

  expect(viewModel.heroBanner.kicker).toBe("夜幕回合 03")
  expect(viewModel.heroBanner.title).toBe("夜晚阶段")
  expect(viewModel.roleSpotlight.title).toBe("今夜焦点")
  expect(viewModel.roleSpotlight.highlight).toContain("顾远")
  expect(viewModel.roleSpotlight.supporting).toContain("预言家")
})

it("switches spotlight into endgame mode when a winner exists", () => {
  const viewModel = buildGameViewModel(
    makeState({ phase: "ended", ended: true, winner: "village" }),
    []
  )

  expect(viewModel.heroBanner.kicker).toBe("终局播报")
  expect(viewModel.roleSpotlight.title).toBe("终局结果")
  expect(viewModel.roleSpotlight.highlight).toContain("村民阵营获胜")
})
```

- [ ] **Step 2: Run the targeted view-model test to verify it fails**

Run: `npm run test -- src/features/game/view-model.test.ts`
Expected: FAIL with missing `heroBanner` / `roleSpotlight` properties on `GameViewModel`.

- [ ] **Step 3: Add the new view-model slices to `types.ts`**

```ts
export interface GameViewModel {
  screenMode: "pregame" | "console"
  isInitialized: boolean
  currentRound: number
  phaseVariant: "idle" | ApiPhase
  phaseLabel: string
  winnerLabel: string
  heroBanner: {
    kicker: string
    title: string
    description: string
  }
  roleSpotlight: {
    title: string
    highlight: string
    supporting: string
  }
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

- [ ] **Step 4: Implement the new derivation in `view-model.ts`**

```ts
function createHeroBanner(state: ApiGameState, winnerLabel: string) {
  if (state.ended && winnerLabel) {
    return {
      kicker: "终局播报",
      title: "胜负已定",
      description: `${winnerLabel}，牌局已进入结算阶段。`,
    }
  }

  return {
    kicker: `${state.phase === "night" ? "夜幕" : "白昼"}回合 ${String(state.round).padStart(2, "0")}`,
    title: `${mapPhaseLabel(state.phase)}阶段`,
    description: "叙事日志持续播报局势变化，右侧指令台负责推动牌局。",
  }
}

function createRoleSpotlight(state: ApiGameState, winnerLabel: string, lastNightKilledPlayer: string | null) {
  if (state.ended && winnerLabel) {
    return {
      title: "终局结果",
      highlight: winnerLabel,
      supporting: "观战视角已收束到最终胜负。",
    }
  }

  return {
    title: state.phase === "night" ? "今夜焦点" : "白天焦点",
    highlight: lastNightKilledPlayer ? `昨夜结果：${lastNightKilledPlayer} 出局` : "昨夜结果：平安夜",
    supporting: state.phase === "night" ? "预言家、女巫与狼人动向值得重点关注。" : "留意放逐结果、发言节奏与存活人数变化。",
  }
}
```

- [ ] **Step 5: Wire the new slices into both initialized and uninitialized view models**

```ts
return {
  screenMode: "console",
  isInitialized: true,
  currentRound: state.round,
  phaseVariant: state.phase,
  phaseLabel,
  winnerLabel,
  heroBanner: createHeroBanner(state, winnerLabel),
  roleSpotlight: createRoleSpotlight(state, winnerLabel, lastNightKilledPlayer),
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

```ts
heroBanner: {
  kicker: "牌局未启",
  title: "等待第一声钟响",
  description: "连接服务后即可进入旁观优先的狼人杀控制室。",
},
roleSpotlight: {
  title: "观战提示",
  highlight: "开局后这里会显示当前回合焦点。",
  supporting: "第一版暂不区分玩家私有视角。",
},
```

- [ ] **Step 6: Run the view-model test again**

Run: `npm run test -- src/features/game/view-model.test.ts`
Expected: PASS with all view-model assertions green.

- [ ] **Step 7: Commit**

```bash
git add src/features/game/types.ts src/features/game/view-model.ts src/features/game/view-model.test.ts
git commit -m "feat: derive banner and spotlight view model"
```

### Task 2: Rebuild The Layout Shell Around Banner, Stage, And Situation Zones

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/game/components/game-shell.tsx`
- Create: `src/features/game/components/role-spotlight.tsx`
- Test: `src/features/game/components/game-shell.test.tsx`

- [ ] **Step 1: Write the failing shell test**

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { GameShell } from "./game-shell"

describe("GameShell", () => {
  it("renders banner, main stage, and situation zone slots", () => {
    const html = renderToStaticMarkup(
      <GameShell
        banner={<div>横幅区</div>}
        mainLog={<div>叙事日志</div>}
        sideRail={<div>指令台</div>}
        situation={<div>玩家态势</div>}
      />
    )

    expect(html).toContain("横幅区")
    expect(html).toContain("叙事日志")
    expect(html).toContain("指令台")
    expect(html).toContain("玩家态势")
  })
})
```

- [ ] **Step 2: Run the shell test to verify it fails**

Run: `npm run test -- src/features/game/components/game-shell.test.tsx`
Expected: FAIL because `GameShell` does not yet accept `banner`, `mainLog`, `sideRail`, `situation` props.

- [ ] **Step 3: Replace the shell prop contract with explicit layout zones**

```tsx
interface GameShellProps {
  banner: React.ReactNode
  mainLog: React.ReactNode
  sideRail: React.ReactNode
  situation: React.ReactNode
}

export function GameShell({ banner, mainLog, sideRail, situation }: GameShellProps) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <header>{banner}</header>
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="min-w-0">{mainLog}</div>
          <aside className="flex flex-col gap-6">{sideRail}</aside>
        </section>
        <section>{situation}</section>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Add the new `RoleSpotlight` component**

```tsx
import type { GameViewModel } from "../types"

interface RoleSpotlightProps {
  spotlight: GameViewModel["roleSpotlight"]
}

export function RoleSpotlight({ spotlight }: RoleSpotlightProps) {
  return (
    <section className="rounded-[24px] border border-border/50 bg-card/35 p-5 backdrop-blur-md">
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">角色聚焦</p>
      <h3 className="mt-3 font-heading text-xl text-foreground">{spotlight.title}</h3>
      <p className="mt-3 text-sm font-semibold text-amber-200">{spotlight.highlight}</p>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{spotlight.supporting}</p>
    </section>
  )
}
```

- [ ] **Step 5: Rewire `App.tsx` to use the new shell slots**

```tsx
<GameShell
  banner={
    <PhaseHero
      isInitialized={viewModel.isInitialized}
      currentRound={viewModel.currentRound}
      phaseLabel={viewModel.phaseLabel}
      phaseVariant={viewModel.phaseVariant}
      winnerLabel={viewModel.winnerLabel}
      banner={viewModel.heroBanner}
    />
  }
  mainLog={<NarrativeLog items={viewModel.timeline} emptyState={viewModel.emptyState} />}
  sideRail={
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
  situation={
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_320px]">
      <PlayerGrid players={viewModel.players} />
      <RoleSpotlight spotlight={viewModel.roleSpotlight} />
    </div>
  }
/>
```

- [ ] **Step 6: Run the shell test again**

Run: `npm run test -- src/features/game/components/game-shell.test.tsx`
Expected: PASS and the new prop contract compiles.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/features/game/components/game-shell.tsx src/features/game/components/game-shell.test.tsx src/features/game/components/role-spotlight.tsx
git commit -m "feat: reshape game shell layout"
```

### Task 3: Refresh The Pregame Screen And Shared Theme

**Files:**
- Modify: `src/features/game/components/pre-game-screen.tsx`
- Modify: `src/features/game/components/pre-game-screen.test.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Write the failing pregame screen assertions for the new stage language**

```tsx
it("renders the stage-style pregame layout with service panel copy", () => {
  const html = renderToStaticMarkup(
    <PreGameScreen
      heroIntro={{
        title: "等待第一声钟响",
        description: "连接服务后即可进入旁观优先的狼人杀控制室。",
        primaryActionLabel: "开始游戏",
      }}
      serviceHealth={{ label: "服务正常", tone: "ok" }}
      requestState={{ isStarting: false, isAdvancing: false, isRefreshing: false, error: "" }}
      onStart={vi.fn()}
      onRefresh={vi.fn()}
    />
  )

  expect(html).toContain("等待第一声钟响")
  expect(html).toContain("服务面板")
  expect(html).toContain("进入控制室前")
})
```

- [ ] **Step 2: Run the pregame screen test to verify it fails**

Run: `npm run test -- src/features/game/components/pre-game-screen.test.tsx`
Expected: FAIL because the old component copy does not contain the new headings.

- [ ] **Step 3: Replace the shared theme tokens in `index.css` with the new palette and heading stack**

```css
@import "@fontsource-variable/inter";
@import "@fontsource/cinzel";

@theme inline {
  --font-heading: "Cinzel", serif;
  --font-sans: "Inter Variable", sans-serif;
}

:root {
  --background: oklch(0.13 0.02 265);
  --card: oklch(0.18 0.02 265 / 0.86);
  --primary: oklch(0.72 0.14 55);
  --accent: oklch(0.65 0.14 22);
  --border: oklch(0.34 0.02 280 / 0.82);
}

body {
  background-image:
    radial-gradient(circle at top, rgba(245, 158, 11, 0.12), transparent 20%),
    radial-gradient(circle at 15% 20%, rgba(190, 24, 93, 0.14), transparent 24%),
    radial-gradient(circle at 85% 10%, rgba(59, 130, 246, 0.12), transparent 18%),
    linear-gradient(180deg, rgba(8, 13, 24, 1), rgba(17, 13, 28, 1));
}
```

- [ ] **Step 4: Rebuild `PreGameScreen` around a left stage / right service structure**

```tsx
<section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl gap-6 rounded-[32px] border border-border/50 bg-card/45 p-6 shadow-[0_32px_120px_rgba(4,8,18,0.55)] backdrop-blur-xl lg:grid-cols-[minmax(0,1.45fr)_340px] lg:p-10">
  <div className="relative flex flex-col justify-between rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(190,24,93,0.12),transparent_24%),linear-gradient(180deg,rgba(8,14,24,0.94),rgba(18,12,30,0.98))] p-8 lg:p-10">
    <span className="inline-flex w-fit rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-amber-100/80">牌局未启</span>
    <div className="space-y-4">
      <h1 className="font-heading text-5xl leading-none tracking-tight md:text-7xl">{heroIntro.title}</h1>
      <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">{heroIntro.description}</p>
    </div>
  </div>
  <aside className="flex flex-col gap-4 rounded-[28px] border border-border/40 bg-black/20 p-6 backdrop-blur-md">
    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">服务面板</p>
    <h2 className="font-heading text-2xl">进入控制室前</h2>
  </aside>
</section>
```

- [ ] **Step 5: Run the pregame test again**

Run: `npm run test -- src/features/game/components/pre-game-screen.test.tsx`
Expected: PASS with the new headings and action labels present.

- [ ] **Step 6: Commit**

```bash
git add src/features/game/components/pre-game-screen.tsx src/features/game/components/pre-game-screen.test.tsx src/index.css
git commit -m "feat: redesign werewolf pregame stage"
```

### Task 4: Upgrade Banner, Side Rail, And Situation Presentation

**Files:**
- Modify: `src/features/game/components/phase-hero.tsx`
- Modify: `src/features/game/components/narrative-log.tsx`
- Modify: `src/features/game/components/control-panel.tsx`
- Modify: `src/features/game/components/game-summary.tsx`
- Modify: `src/features/game/components/status-strip.tsx`
- Modify: `src/features/game/components/player-grid.tsx`
- Modify: `src/features/game/components/player-card.tsx`

- [ ] **Step 1: Write a failing shell-level presentation test that includes spotlight and summary text**

```tsx
it("renders the spectator-first situation zone and spotlight copy", () => {
  const html = renderToStaticMarkup(
    <div>
      <GameSummary
        summary={{
          currentRound: 2,
          phaseLabel: "夜晚",
          winnerLabel: "",
          aliveCount: 6,
          deadCount: 2,
          wolfCountAlive: 2,
          lastNightKilled: 4,
          lastNightKilledPlayer: "苏岚",
        }}
      />
      <RoleSpotlight
        spotlight={{
          title: "今夜焦点",
          highlight: "昨夜结果：苏岚 出局",
          supporting: "预言家、女巫与狼人动向值得重点关注。",
        }}
      />
    </div>
  )

  expect(html).toContain("今夜焦点")
  expect(html).toContain("昨夜结果：苏岚 出局")
  expect(html).toContain("局势摘要")
})
```

- [ ] **Step 2: Run the targeted presentation tests**

Run: `npm run test -- src/features/game/components/game-shell.test.tsx src/features/game/components/pre-game-screen.test.tsx src/features/game/view-model.test.ts`
Expected: FAIL on the new summary copy or prop mismatches until the display components are updated.

- [ ] **Step 3: Expand `PhaseHero` to consume the new banner slice**

```tsx
interface PhaseHeroProps {
  isInitialized: boolean
  currentRound: number
  phaseLabel: string
  phaseVariant: "idle" | "day" | "night" | "ended"
  winnerLabel: string
  banner: {
    kicker: string
    title: string
    description: string
  }
}

<span className="text-[11px] uppercase tracking-[0.28em] text-amber-200/80">{banner.kicker}</span>
<h1 className="mt-2 font-heading text-3xl md:text-5xl">{banner.title}</h1>
<p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">{banner.description}</p>
```

- [ ] **Step 4: Tighten the side rail components into a hierarchy**

```tsx
// control-panel.tsx
<section className="rounded-[24px] border border-amber-400/15 bg-[linear-gradient(180deg,rgba(24,18,31,0.88),rgba(12,16,28,0.92))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-md">

// game-summary.tsx
<h3 className="font-heading text-sm font-semibold tracking-[0.18em] uppercase">局势摘要</h3>

// status-strip.tsx
return error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null
```

- [ ] **Step 5: Upgrade the player area and card emphasis**

```tsx
// player-grid.tsx
<section className="rounded-[28px] border border-border/50 bg-card/28 p-6 backdrop-blur-md">
  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
    {players.map((player) => (
      <PlayerCard key={player.id} player={player} />
    ))}
  </div>
</section>

// player-card.tsx
const stateRing = player.alive
  ? "ring-1 ring-emerald-400/25"
  : "ring-1 ring-rose-400/25 opacity-70 grayscale"
```

- [ ] **Step 6: Re-run the focused component tests**

Run: `npm run test -- src/features/game/view-model.test.ts src/features/game/components/game-shell.test.tsx src/features/game/components/pre-game-screen.test.tsx`
Expected: PASS with the revised hierarchy and spotlight text intact.

- [ ] **Step 7: Commit**

```bash
git add src/features/game/components/phase-hero.tsx src/features/game/components/narrative-log.tsx src/features/game/components/control-panel.tsx src/features/game/components/game-summary.tsx src/features/game/components/status-strip.tsx src/features/game/components/player-grid.tsx src/features/game/components/player-card.tsx
git commit -m "feat: refresh game console presentation"
```

### Task 5: Final Integration Verification

**Files:**
- Modify: `src/App.tsx` (only if integration fixes remain)
- Test: `src/features/game/view-model.test.ts`
- Test: `src/features/game/components/game-shell.test.tsx`
- Test: `src/features/game/components/pre-game-screen.test.tsx`

- [ ] **Step 1: Run the targeted regression suite after all UI work**

Run: `npm run test -- src/features/game/view-model.test.ts src/features/game/components/game-shell.test.tsx src/features/game/components/pre-game-screen.test.tsx`
Expected: PASS for all three focused suites.

- [ ] **Step 2: Run the full test suite**

Run: `npm run test`
Expected: PASS with no Vitest failures.

- [ ] **Step 3: Run type-checking**

Run: `npm run typecheck`
Expected: PASS with zero TypeScript errors.

- [ ] **Step 4: Run the production build**

Run: `npm run build`
Expected: PASS and Vite emits the production bundle.

- [ ] **Step 5: Commit the final integrated UI refresh**

```bash
git add src/App.tsx src/index.css src/features/game/types.ts src/features/game/view-model.ts src/features/game/view-model.test.ts src/features/game/components/*.tsx
git commit -m "feat: refresh werewolf spectator interface"
```

## Self-Review

- Spec coverage: the plan covers the two required page states, the spectator-first shell, the reserved spotlight area, the theme refresh, and the no-new-backend-contract constraint.
- Placeholder scan: no unfinished notes or deferred implementation markers remain.
- Type consistency: `heroBanner` and `roleSpotlight` are introduced in Task 1 and consumed consistently in Tasks 2-4.
