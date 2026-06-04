---
change: fix-layout-add-speech-log
design-doc: docs/superpowers/specs/2026-06-04-fix-layout-add-speech-log-design.md
base-ref: 622587caefe6bd70eadb3cdfe178f9f88e2f1190
---

# Fix Layout Add Speech Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复桌面端观战控制台的零高度布局问题，并新增与时间线同步的“当前回合发言记录”与环形席位略缩图。

**Architecture:** 在 view-model 层从现有 `state + messages` 派生 `speechLedger` 和 `seatRing` 数据；在组件层用新的桌面舞台组合替换当前 `banner + grid + situation` 的松散结构；保留详细席位卡片作为次级信息区。桌面端启用新结构，移动端维持现有纵向退化布局。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Tailwind v4、shadcn/ui（`card`、`badge`、`scroll-area`）

---

### Task 1: 扩展 view-model，先把数据派生测出来

**Files:**
- Modify: `src/features/game/types.ts`
- Modify: `src/features/game/view-model.ts`
- Modify: `src/features/game/view-model.test.ts`

- [ ] **Step 1: 写失败测试，定义发言记录与环形席位数据期望**

```ts
it("derives current-round speech ledger and seat ring state", () => {
  const viewModel = buildGameViewModel(
    {
      round: 2,
      phase: "day",
      ended: false,
      players: [
        { id: 1, name: "李明", role: "werewolf", alive: true, team: "wolf" },
        { id: 2, name: "王芳", role: "villager", alive: false, team: "village" },
      ],
      inspections: [],
      witchHealUsed: false,
      witchPoisonUsed: false,
    },
    [
      { speakerId: 1, speaker: "李明", content: "这轮先听大家。", phase: "day", round: 2, type: "player" },
      { speakerId: 0, speaker: "系统", content: "进入第2轮白天。", phase: "day", round: 2, type: "system" },
      { speakerId: 1, speaker: "李明", content: "上一轮发言", phase: "day", round: 1, type: "player" },
    ],
  )

  expect(viewModel.speechLedger.count).toBe(1)
  expect(viewModel.speechLedger.latestSpeaker).toBe("李明")
  expect(viewModel.speechLedger.items).toEqual([
    expect.objectContaining({ speaker: "李明", round: 2, phase: "day" }),
  ])

  expect(viewModel.seatRing).toEqual([
    expect.objectContaining({ seat: 1, role: "werewolf", alive: true }),
    expect.objectContaining({ seat: 2, role: "villager", alive: false }),
  ])
})
```

- [ ] **Step 2: 运行测试，确认当前失败**

Run: `npm run test -- src/features/game/view-model.test.ts`
Expected: FAIL，提示 `speechLedger` 或 `seatRing` 不存在。

- [ ] **Step 3: 在类型与 view-model 中补最小实现**

```ts
export interface SpeechLedgerItem {
  id: string
  speaker: string
  content: string
  round: number
  phase: ApiPhase
}

export interface SeatRingItem {
  seat: number
  name: string
  role: ApiRole
  alive: boolean
  team: ApiTeam
}

speechLedger: {
  count: number
  latestSpeaker: string | null
  items: SpeechLedgerItem[]
}

seatRing: SeatRingItem[]
```

```ts
const currentRoundSpeech = messages
  .filter((message) => message.round === state.round && message.type === "player")
  .map((message, index) => ({
    id: `${message.round}-${message.speakerId}-speech-${index}`,
    speaker: message.speaker,
    content: message.content,
    round: message.round,
    phase: message.phase,
  }))

seatRing: state.players.map((player) => ({
  seat: player.id,
  name: player.name,
  role: player.role,
  alive: player.alive,
  team: player.team,
}))
```

- [ ] **Step 4: 重新运行 view-model 测试**

Run: `npm run test -- src/features/game/view-model.test.ts`
Expected: PASS。

- [ ] **Step 5: 提交这一小步**

```bash
git add src/features/game/types.ts src/features/game/view-model.ts src/features/game/view-model.test.ts
git commit -m "feat: derive speech ledger and seat ring view models"
```

### Task 2: 先用测试锁住桌面壳层，再重构控制台布局

**Files:**
- Create: `src/features/game/components/stage-status-strip.tsx`
- Create: `src/features/game/components/seat-ring.tsx`
- Create: `src/features/game/components/speech-ledger.tsx`
- Create: `src/features/game/components/seat-ring.test.tsx`
- Create: `src/features/game/components/speech-ledger.test.tsx`
- Modify: `src/features/game/components/game-shell.tsx`
- Modify: `src/features/game/components/game-shell.test.tsx`
- Modify: `src/features/game/components/phase-hero.tsx` or replace its call site
- Modify: `src/App.tsx`

- [ ] **Step 1: 先更新 `game-shell` 测试，反映新桌面约束**

```ts
it("renders a desktop shell without the old fixed-screen layout class", () => {
  const html = renderToStaticMarkup(
    <GameShell
      banner={<div>Banner</div>}
      mainLog={<div>Main</div>}
      sideRail={<div>Side</div>}
      situation={<div>Situation</div>}
    />,
  )

  expect(html).toContain('aria-label="main log"')
  expect(html).not.toContain("lg:h-screen")
  expect(html).toContain("lg:grid")
})
```

- [ ] **Step 2: 运行组件测试，确认失败**

Run: `npm run test -- src/features/game/components/game-shell.test.tsx`
Expected: FAIL，因为当前实现仍包含 `lg:h-screen`。

- [ ] **Step 3: 新建桌面舞台组件并接入 `App.tsx`**

```tsx
<GameShell
  banner={<StageStatusStrip ... />}
  mainLog={
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <NarrativeLog items={viewModel.timeline} emptyState={viewModel.emptyState} />
      <SpeechLedger ledger={viewModel.speechLedger} />
    </div>
  }
  sideRail={<SeatRing items={viewModel.seatRing} />}
  situation={<PlayerGrid players={viewModel.players} />}
/>
```

```tsx
export function SeatRing({ items }: { items: SeatRingItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>圆桌席位</CardTitle>
      </CardHeader>
      <CardContent>{/* 环形节点 */}</CardContent>
    </Card>
  )
}
```

```tsx
export function SpeechLedger({ ledger }: { ledger: GameViewModel["speechLedger"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>当前回合发言记录</CardTitle>
        <CardDescription>{ledger.latestSpeaker ?? "等待本轮发言"}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea>{/* ledger.items */}</ScrollArea>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: 为新组件补基本渲染测试**

```ts
it("renders dead seats in a weakened style", () => {
  const html = renderToStaticMarkup(
    <SeatRing
      items={[{ seat: 2, name: "王芳", role: "villager", alive: false, team: "village" }]}
    />,
  )

  expect(html).toContain("2")
  expect(html).toContain("villager")
  expect(html).toContain("opacity-")
})
```

```ts
it("renders current-round speech records and latest speaker", () => {
  const html = renderToStaticMarkup(
    <SpeechLedger
      ledger={{
        count: 2,
        latestSpeaker: "王芳",
        items: [
          { id: "1", speaker: "李明", content: "先听大家。", round: 1, phase: "day" },
          { id: "2", speaker: "王芳", content: "我同意继续观察。", round: 1, phase: "day" },
        ],
      }}
    />,
  )

  expect(html).toContain("当前回合发言记录")
  expect(html).toContain("王芳")
  expect(html).toContain("我同意继续观察。")
})
```

- [ ] **Step 5: 跑这组组件测试**

Run: `npm run test -- src/features/game/components/game-shell.test.tsx src/features/game/components/seat-ring.test.tsx src/features/game/components/speech-ledger.test.tsx`
Expected: PASS。

- [ ] **Step 6: 提交布局重构**

```bash
git add src/App.tsx src/features/game/components/game-shell.tsx src/features/game/components/game-shell.test.tsx src/features/game/components/stage-status-strip.tsx src/features/game/components/seat-ring.tsx src/features/game/components/seat-ring.test.tsx src/features/game/components/speech-ledger.tsx src/features/game/components/speech-ledger.test.tsx
git commit -m "feat: rebuild desktop console stage layout"
```

### Task 3: 收尾样式、次级席位区与整体验证

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/game/components/narrative-log.tsx`
- Modify: `src/features/game/components/player-grid.tsx` (only if needed for secondary placement styling)
- Modify: `openspec/changes/fix-layout-add-speech-log/tasks.md`

- [ ] **Step 1: 微调主舞台与次级区域边界，避免信息打架**

```tsx
situation={
  <section className="grid gap-4">
    <PlayerGrid players={viewModel.players} />
  </section>
}
```

```tsx
<Card className="relative flex min-h-[560px] flex-col overflow-hidden lg:min-h-[640px]">
  {/* NarrativeLog 作为稳定主舞台 */}
</Card>
```

- [ ] **Step 2: 运行全量测试**

Run: `npm run test`
Expected: PASS。

- [ ] **Step 3: 运行类型和生产构建检查**

Run: `npm run typecheck && npm run build`
Expected: 两个命令都成功结束，无 TypeScript 错误、无 Vite 构建错误。

- [ ] **Step 4: 浏览器实测并勾选 OpenSpec 任务**

Run / Check:

```text
1. 打开 http://localhost:5173/
2. 进入当前牌局
3. 确认桌面端无零高度主区
4. 推进一轮，确认右侧“当前回合发言记录”随时间线同步
5. 确认环形席位中的死亡玩家被置灰
6. 将 openspec/changes/fix-layout-add-speech-log/tasks.md 全部改为 - [x]
```

- [ ] **Step 5: 提交最终收尾**

```bash
git add src/App.tsx src/features/game/components/narrative-log.tsx src/features/game/components/player-grid.tsx openspec/changes/fix-layout-add-speech-log/tasks.md
git commit -m "test: finish desktop speech stage verification"
```

## Self-Review

- Spec coverage：桌面稳定布局、独立发言记录、环形席位略缩图、死亡弱化样式、次级详细席位区均已被任务覆盖。
- Placeholder scan：计划中没有 `TBD`、`TODO` 或“自行实现”类占位语。
- Type consistency：`speechLedger`、`seatRing`、`SeatRing`、`SpeechLedger` 命名在各任务中保持一致。
