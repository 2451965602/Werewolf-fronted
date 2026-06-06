---
change: fix-game-console-scroll-layout
design-doc: docs/superpowers/specs/2026-06-06-fix-game-console-scroll-layout-design.md
base-ref: 52c710577bd331f533e31788dff6bfa567945df9
---

# Fix Game Console Scroll Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the spectator console layout so current speech, latest speech ledger, game summary, night focus, and guest seats stay readable with stable scroll boundaries.

**Architecture:** Keep `GameShell` as the desktop viewport boundary, then make each region own exactly one vertical overflow path. Compress the main stage and side rail cards without changing view-model data, API calls, or game rules.

**Tech Stack:** React 19, TypeScript, Tailwind CSS utility classes, Vitest, React DOM static rendering, Vite.

---

## File Structure

- Modify: `src/features/game/components/game-shell.tsx`
  - Owns the top-level desktop grid, row sizing, side rail, and bottom situation overflow boundary.
- Modify: `src/App.tsx`
  - Owns composition of side rail and bottom situation region; add layout wrapper classes only.
- Modify: `src/features/game/components/narrative-log.tsx`
  - Compress desktop header and ensure current focus remains outside the historical scroll area.
- Modify: `src/features/game/components/speech-ledger.tsx`
  - Give the latest speech ledger a minimum readable height and local list overflow.
- Modify: `src/features/game/components/game-summary.tsx`
  - Convert the wide summary card into a compact side-rail summary.
- Modify: `src/features/game/components/role-spotlight.tsx`
  - Let night focus behave as a stable, non-scroll-stealing card in the bottom situation region.
- Modify: `src/features/game/components/player-grid.tsx`
  - Make guest seats fit inside the bottom situation region and let the card body scroll only when needed.
- Modify: `src/features/game/components/game-shell.test.tsx`
  - Lock the top-level layout contract and overflow owner classes.
- Modify: `src/features/game/components/narrative-log.test.tsx`
  - Lock current focus visibility and compact desktop layout classes.
- Modify: `src/features/game/components/speech-ledger.test.tsx`
  - Lock ledger priority height and newest speech rendering.
- Create: `src/features/game/components/game-summary.test.tsx`
  - Lock compact summary rendering and required metrics.
- Modify: `src/App.test.tsx`
  - Lock bottom situation composition wrapper.

## Task 1: Lock Top-Level Layout Boundaries

**Files:**
- Modify: `src/features/game/components/game-shell.test.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/features/game/components/game-shell.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `GameShell` failing test**

Replace the existing `GameShell` test body with this stricter layout contract:

```tsx
it("renders bounded desktop regions with one situation overflow owner", () => {
  const props: ComponentProps<typeof GameShell> = {
    banner: <div>Banner Content</div>,
    mainLog: <div>Main Log Content</div>,
    sideRail: <div>Side Rail Content</div>,
    situation: <div>Situation Content</div>,
  }

  const html = renderToStaticMarkup(<GameShell {...props} />)

  expect(html).toContain('aria-label="banner"')
  expect(html).toContain('aria-label="main log"')
  expect(html).toContain('aria-label="side rail"')
  expect(html).toContain('aria-label="situation"')
  expect(html).toContain("lg:h-screen")
  expect(html).toContain("lg:overflow-hidden")
  expect(html).toContain("lg:grid")
  expect(html).toContain("lg:grid-rows-[auto_minmax(0,1fr)_clamp(160px,24vh,230px)]")
  expect(html).toContain("lg:grid-cols-[minmax(0,1fr)_340px]")
  expect(html).toContain("xl:grid-cols-[minmax(0,1fr)_360px]")
  expect(html).toContain("lg:overflow-hidden")
  expect(html).toContain("lg:overflow-y-auto")
  expect(html).toContain("Banner Content")
  expect(html).toContain("Main Log Content")
  expect(html).toContain("Side Rail Content")
  expect(html).toContain("Situation Content")
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- src/features/game/components/game-shell.test.tsx
```

Expected: FAIL because `lg:grid-rows-[auto_minmax(0,1fr)_clamp(160px,24vh,230px)]`, the wider side rail columns, and `lg:overflow-y-auto` are not present yet.

- [ ] **Step 3: Implement `GameShell` layout boundary**

Update `GameShell` so the return markup uses these class contracts:

```tsx
return (
  <div className="min-h-screen w-full bg-background text-foreground transition-all duration-300 lg:h-screen lg:overflow-hidden">
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-6 lg:grid lg:h-full lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)_clamp(160px,24vh,230px)] lg:px-6 lg:py-4 xl:max-w-[1800px] 2xl:max-w-[1840px]">
      <header aria-label="banner" className="min-w-0 w-full">
        {banner}
      </header>

      <section className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch xl:grid-cols-[minmax(0,1fr)_360px]">
        <div aria-label="main log" className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          {mainLog}
        </div>

        <aside aria-label="side rail" className="min-h-0 min-w-0 overflow-hidden">
          {sideRail}
        </aside>
      </section>

      <section aria-label="situation" className="min-h-0 w-full overflow-hidden lg:overflow-y-auto lg:overflow-x-hidden">
        {situation}
      </section>
    </main>
  </div>
)
```

- [ ] **Step 4: Update `App` composition failing test**

In `App.test.tsx`, inside the `"stays on lobby when an active game already exists until continue is clicked"` test, add assertions after the existing `RoleSpotlight Stub` and `PlayerGrid Stub` checks:

```tsx
expect(container.innerHTML).toContain("game-situation-grid")
expect(container.innerHTML).toContain("side-rail-stack")
```

- [ ] **Step 5: Run the app test and verify RED**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because `game-situation-grid` and `side-rail-stack` are not rendered yet.

- [ ] **Step 6: Implement `App` composition wrappers**

Update the `sideRail` and `situation` props in `App.tsx`:

```tsx
sideRail={
  <div className="side-rail-stack flex h-full min-h-0 flex-col gap-3 overflow-hidden">
    <SpeechLedger ledger={viewModel.speechLedger} />
    <GameSummary summary={viewModel.summary} />
    <StatusStrip
      error={requestState.error}
      isInitialized={viewModel.isInitialized}
    />
  </div>
}
situation={
  <div className="game-situation-grid grid h-full min-h-0 gap-4 xl:grid-cols-[300px_minmax(0,1fr)] xl:items-stretch">
    <RoleSpotlight spotlight={viewModel.roleSpotlight} />
    <PlayerGrid players={viewModel.players} />
  </div>
}
```

- [ ] **Step 7: Run Task 1 tests and verify GREEN**

Run:

```bash
npm test -- src/features/game/components/game-shell.test.tsx src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Task 1**

```bash
git add src/features/game/components/game-shell.tsx src/features/game/components/game-shell.test.tsx src/App.tsx src/App.test.tsx
git commit -m "fix: stabilize game console layout boundaries"
```

## Task 2: Preserve Current Speech And Latest Ledger Visibility

**Files:**
- Modify: `src/features/game/components/narrative-log.test.tsx`
- Modify: `src/features/game/components/speech-ledger.test.tsx`
- Modify: `src/features/game/components/narrative-log.tsx`
- Modify: `src/features/game/components/speech-ledger.tsx`

- [ ] **Step 1: Add `NarrativeLog` failing layout contract**

Add this test to `narrative-log.test.tsx`:

```tsx
it("keeps the current focus visible before the historical list scrolls", () => {
  const html = renderToStaticMarkup(
    <NarrativeLog
      items={[
        {
          id: "latest",
          tone: "player",
          speaker: "3号玩家",
          content: "我现在重点怀疑 5 号。",
          round: 2,
          phase: "day",
        },
      ]}
      emptyState={{ title: "暂无记录", description: "等待开局" }}
    />,
  )

  expect(html).toContain("当前镜头")
  expect(html).toContain("我现在重点怀疑 5 号。")
  expect(html).toContain("lg:min-h-0")
  expect(html).toContain("lg:p-4")
  expect(html).toContain("timeline-history-scroll")
  expect(html.indexOf("当前镜头")).toBeLessThan(
    html.indexOf("timeline-history-scroll"),
  )
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- src/features/game/components/narrative-log.test.tsx
```

Expected: FAIL because `lg:p-4` and `timeline-history-scroll` are not present yet.

- [ ] **Step 3: Implement compact `NarrativeLog` layout**

Update these class groups in `narrative-log.tsx`:

```tsx
<Card className="relative flex h-full min-h-[480px] flex-col overflow-hidden border-border/60 bg-[linear-gradient(180deg,rgba(24,24,27,0.92),rgba(9,9,11,0.94))] shadow-[0_24px_80px_rgba(0,0,0,0.24)] lg:min-h-0">
```

Keep the card shell but make the header and body compact:

```tsx
<CardHeader className="relative z-10 border-b border-white/8 p-4 md:p-5 lg:p-4">
  <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
```

Change the stats wrapper to reduce height:

```tsx
<div className="grid gap-2 sm:grid-cols-[auto_auto] xl:min-w-[320px]">
```

Change each stat tile padding:

```tsx
<div className="rounded-[18px] border border-white/8 bg-white/5 px-3 py-2">
```

Change body padding:

```tsx
<CardContent className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3 md:px-5 md:pb-5 lg:p-4">
```

Change the historical scroll area:

```tsx
<ScrollArea className="timeline-history-scroll min-h-0 flex-1 px-4 py-4 md:px-5">
```

- [ ] **Step 4: Add `SpeechLedger` failing layout contract**

Add this assertion block to the first `SpeechLedger` test:

```tsx
expect(html).toContain("latest-speech-scroll")
expect(html).toContain("lg:min-h-[220px]")
expect(html).toContain("lg:flex-[1_1_0]")
expect(html.indexOf("我同意继续观察。")).toBeLessThan(
  html.indexOf("先听大家。"),
)
```

- [ ] **Step 5: Run the focused test and verify RED**

Run:

```bash
npm test -- src/features/game/components/speech-ledger.test.tsx
```

Expected: FAIL because `latest-speech-scroll`, `lg:min-h-[220px]`, and `lg:flex-[1_1_0]` are not present yet.

- [ ] **Step 6: Implement prioritized `SpeechLedger` flex behavior**

Update `speech-ledger.tsx` card and scroll classes:

```tsx
<Card className="flex h-[320px] flex-col overflow-hidden border-zinc-800/60 bg-zinc-950/20 shadow-lg backdrop-blur-md lg:h-auto lg:min-h-[220px] lg:flex-[1_1_0]">
```

```tsx
<CardHeader className="border-b border-zinc-900/50 pb-3">
```

```tsx
<CardContent className="min-h-0 flex-1 p-0">
  {hasItems ? (
    <ScrollArea className="latest-speech-scroll h-full w-full">
```

Keep the existing item rendering and fallback copy unchanged.

- [ ] **Step 7: Run Task 2 tests and verify GREEN**

Run:

```bash
npm test -- src/features/game/components/narrative-log.test.tsx src/features/game/components/speech-ledger.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Task 2**

```bash
git add src/features/game/components/narrative-log.tsx src/features/game/components/narrative-log.test.tsx src/features/game/components/speech-ledger.tsx src/features/game/components/speech-ledger.test.tsx
git commit -m "fix: preserve current speech visibility"
```

## Task 3: Compact Summary And Stable Situation Region

**Files:**
- Create: `src/features/game/components/game-summary.test.tsx`
- Modify: `src/features/game/components/game-summary.tsx`
- Modify: `src/features/game/components/role-spotlight.tsx`
- Modify: `src/features/game/components/player-grid.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Create failing `GameSummary` compact test**

Create `src/features/game/components/game-summary.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { GameSummary } from "./game-summary"

describe("GameSummary", () => {
  it("renders a compact side-rail summary with stable metric labels", () => {
    const html = renderToStaticMarkup(
      <GameSummary
        summary={{
          currentRound: 3,
          phaseLabel: "夜晚",
          winnerLabel: "",
          aliveCount: 6,
          deadCount: 2,
          wolfCountAlive: 2,
          lastNightKilled: 5,
          lastNightKilledPlayer: "王芳",
        }}
      />,
    )

    expect(html).toContain("compact-game-summary")
    expect(html).toContain("局势摘要")
    expect(html).toContain("第 3 轮")
    expect(html).toContain("夜晚")
    expect(html).toContain("5 号 王芳 出局")
    expect(html).toContain("存活")
    expect(html).toContain("出局")
    expect(html).toContain("存活狼人")
    expect(html).toContain("grid-cols-3")
  })
})
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```bash
npm test -- src/features/game/components/game-summary.test.tsx
```

Expected: FAIL because `compact-game-summary` is not present yet.

- [ ] **Step 3: Implement compact `GameSummary`**

Replace the returned JSX in `game-summary.tsx` with:

```tsx
return (
  <section className="compact-game-summary shrink-0 rounded-[20px] border border-border/50 bg-card/35 p-4 backdrop-blur-md">
    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.2em] text-muted-foreground/70 uppercase">
          局势快照
        </p>
        <h3 className="mt-1 font-heading text-sm font-semibold tracking-[0.12em] text-foreground">
          局势摘要
        </h3>
      </div>

      <div className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200">
        {phaseLabel}
      </div>
    </div>

    <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.18em] text-muted-foreground/70 uppercase">
            当前轮次
          </p>
          <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
            {currentRound > 0 ? `第 ${currentRound} 轮` : "未开始"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-[0.18em] text-muted-foreground/70 uppercase">
            胜负
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {winnerLabel || "进行中"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
        <span className="text-muted-foreground">昨夜事件</span>
        <span className="text-right font-semibold text-foreground">
          {lastNightKilled !== null && lastNightKilled > 0 ? (
            <span className="text-rose-300">
              {lastNightKilled} 号 {lastNightKilledPlayer ?? "未知玩家"} 出局
            </span>
          ) : (
            <span className="text-emerald-300">平安夜</span>
          )}
        </span>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-3 gap-2">
      <div className="rounded-xl border border-white/10 bg-black/20 p-2.5">
        <span className="text-[11px] text-muted-foreground">存活</span>
        <span className="mt-1 block text-lg font-bold text-emerald-400">
          {aliveCount}
        </span>
      </div>
      <div className="rounded-xl border border-white/10 bg-black/20 p-2.5">
        <span className="text-[11px] text-muted-foreground">出局</span>
        <span className="mt-1 block text-lg font-bold text-rose-400">
          {deadCount}
        </span>
      </div>
      <div className="rounded-xl border border-white/10 bg-black/20 p-2.5">
        <span className="text-[11px] text-muted-foreground">存活狼人</span>
        <span className="mt-1 block text-lg font-bold text-violet-300">
          {wolfCountAlive}
        </span>
      </div>
    </div>
  </section>
)
```

- [ ] **Step 4: Add situation-region assertions to `App.test.tsx`**

In the same console rendering test, add:

```tsx
expect(container.innerHTML).toContain("RoleSpotlight Stub")
expect(container.innerHTML).toContain("PlayerGrid Stub")
expect(container.innerHTML.indexOf("RoleSpotlight Stub")).toBeLessThan(
  container.innerHTML.indexOf("PlayerGrid Stub"),
)
```

If the first two assertions already exist, keep one copy of each and add only the order assertion.

- [ ] **Step 5: Run `App` test and verify RED if order or wrappers are missing**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS if Task 1 already added the wrapper and composition order is correct; FAIL if the order assertion exposes a composition issue.

- [ ] **Step 6: Implement stable bottom cards**

Update `role-spotlight.tsx` root class:

```tsx
<section className="night-focus-card min-h-0 shrink-0 rounded-[20px] border border-border/50 bg-card/35 p-4 backdrop-blur-md xl:h-full xl:overflow-hidden">
```

Update `player-grid.tsx` root and list classes:

```tsx
<section className="guest-seat-card flex min-h-0 flex-col rounded-[20px] border border-border/50 bg-card/30 p-4 backdrop-blur-md xl:h-full">
```

```tsx
<div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8">
    {players.map((player) => (
      <PlayerCard key={player.id} player={player} />
    ))}
  </div>
</div>
```

Keep the existing empty state, but wrap it in the same `min-h-0 flex-1` area:

```tsx
<div className="mt-4 flex min-h-0 flex-1 flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-black/15 py-10 text-center text-muted-foreground">
```

- [ ] **Step 7: Add class assertions for bottom cards**

Create or extend focused tests later if needed, but at minimum add these assertions to the `App` composition test because `RoleSpotlight` and `PlayerGrid` are mocked there:

```tsx
expect(container.innerHTML).toContain("game-situation-grid")
```

Then rely on browser verification in Task 4 for actual scroll behavior.

- [ ] **Step 8: Run Task 3 tests and verify GREEN**

Run:

```bash
npm test -- src/features/game/components/game-summary.test.tsx src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit Task 3**

```bash
git add src/features/game/components/game-summary.tsx src/features/game/components/game-summary.test.tsx src/features/game/components/role-spotlight.tsx src/features/game/components/player-grid.tsx src/App.test.tsx
git commit -m "fix: compact summary and situation scrolling"
```

## Task 4: Verification And OpenSpec Task Completion

**Files:**
- Modify: `openspec/changes/fix-game-console-scroll-layout/tasks.md`

- [ ] **Step 1: Run focused component tests**

Run:

```bash
npm test -- src/features/game/components/game-shell.test.tsx src/features/game/components/narrative-log.test.tsx src/features/game/components/speech-ledger.test.tsx src/features/game/components/game-summary.test.tsx src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run full automated checks**

Run:

```bash
npm run typecheck
npm run lint
npm test
```

Expected: all commands PASS with no TypeScript, ESLint, or Vitest failures.

- [ ] **Step 3: Start the Vite dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`. Keep the server running for browser verification.

- [ ] **Step 4: Verify desktop viewport in browser**

Using browser automation at 1920x1080:

1. Open the local Vite URL.
2. Enter the console by continuing or starting the game according to the current app state.
3. Confirm the viewport shows these text regions without incoherent overlap:
   - `叙事实录时间线`
   - `当前镜头`
   - `最近发言账册` or `本轮发言账册`
   - `局势摘要`
   - `夜间焦点` or the current `roleSpotlight.title`
   - `古堡宾客席`
4. Confirm page-level scroll is not required to discover the primary regions at 1920x1080.
5. Confirm any scrollbar is local to the timeline, speech list, or bottom situation area.

- [ ] **Step 5: Verify shorter desktop viewport**

Resize the browser to 1440x820 and repeat the same checks. Expected: no component overlap; if content overflows, it uses the intended local region.

- [ ] **Step 6: Verify mobile/narrow layout**

Resize the browser to 390x844. Expected: normal vertical document flow, readable cards, no desktop-only clipping.

- [ ] **Step 7: Mark OpenSpec tasks complete**

After all implementation and verification steps pass, update `openspec/changes/fix-game-console-scroll-layout/tasks.md` so every task is checked:

```md
- [x] 1.1 Update `GameShell` tests to assert the desktop layout exposes bounded main, side, and situation regions without relying on competing overflow rules.
- [x] 1.2 Add focused component coverage for `SpeechLedger` and `GameSummary` so the newest speech and summary metrics remain present in constrained containers.
- [x] 1.3 Add or update coverage for bottom situation composition so night focus and guest seat regions use a single predictable overflow boundary.
- [x] 2.1 Adjust `GameShell` desktop row sizing, min-height, and overflow rules to preserve a readable middle row and stable bottom situation area.
- [x] 2.2 Tune `NarrativeLog` spacing and minimum-height behavior so the current focus/current speech summary stays visible before the historical list scrolls.
- [x] 2.3 Tune `SpeechLedger` height/flex behavior so the latest speech record is not squeezed out by the summary or status strip.
- [x] 2.4 Refactor `GameSummary` into a compact right-rail layout that keeps metrics aligned at the existing side-rail width.
- [x] 3.1 Adjust `App.tsx`, `RoleSpotlight`, and `PlayerGrid` composition so night focus remains visible and guest seats scroll only within the intended region when needed.
- [x] 3.2 Verify mobile and narrow desktop layouts continue to use natural vertical flow without desktop-only clipping.
- [x] 4.1 Run focused tests for game layout components and app composition.
- [x] 4.2 Run `npm run typecheck`, `npm run lint`, and the relevant Vitest suite.
- [x] 4.3 Use browser verification at 1920x1080 and one shorter desktop viewport to confirm current speech visibility, organized summary layout, and normal scrollbars for night focus and guest seats.
```

- [ ] **Step 8: Commit verification and task completion**

```bash
git add openspec/changes/fix-game-console-scroll-layout/tasks.md
git commit -m "chore: complete scroll layout verification"
```

- [ ] **Step 9: Run build guard**

Run:

```bash
wsl.exe --exec bash -lc 'cd /mnt/e/VSCode/golang/Werewolf-fronted && . .agents/skills/comet/scripts/comet-env.sh && "$COMET_BASH" "$COMET_GUARD" fix-game-console-scroll-layout build --apply'
```

Expected: PASS and `.comet.yaml` transitions to `phase: verify`.

## Self-Review

- Spec coverage: current speech visibility is covered by Task 2, summary stability by Task 3, and scroll boundaries by Tasks 1, 3, and 4.
- Placeholder scan: no incomplete-marker or fill-in instructions are used.
- Type consistency: all snippets use existing component names, existing `GameViewModel["summary"]` shape, and existing test tooling.
- Scope check: no API, view-model data, backend, dependency, or rule changes are included.
