---
change: fix-ui-overlap
design-doc: docs/superpowers/specs/2026-06-06-fix-ui-overlap-design.md
base-ref: 0e819bca54701a599edba24306ed3f768d74c559
archived-with: 2026-06-06-fix-ui-overlap
---

# Fix UI Overlap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复桌面端观战控制台的主舞台、导演席和席位区重叠问题，并让发言账册在当前轮无发言时回退展示最近可用发言。

**Architecture:** 继续沿用 `buildGameViewModel()` 作为展示数据派生边界，在 view-model 内补充 `SpeechLedger` 的来源轮次与 fallback 标记。组件层只调整 `GameShell`、`SeatRing` 和 `SpeechLedger` 的布局与文案，不改后端 API、消息协议或游戏状态同步链路。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Tailwind v4、shadcn/ui（`Card`、`Badge`）

archived-with: 2026-06-06-fix-ui-overlap
---

## File Structure

- `src/features/game/types.ts`: 扩展 `SpeechLedger` 展示契约，新增 `sourceRound` 与 `isFallback`。
- `src/features/game/view-model.ts`: 从现有消息流派生当前轮发言；当前轮为空时回退到不超过当前轮的最近有发言轮次。
- `src/features/game/view-model.test.ts`: 覆盖当前轮发言、历史轮次 fallback、无发言三类派生状态。
- `src/features/game/components/speech-ledger.tsx`: 根据 `isFallback` 与 `sourceRound` 切换标题和说明。
- `src/features/game/components/speech-ledger.test.tsx`: 覆盖当前轮标题与 fallback 标题。
- `src/features/game/components/game-shell.tsx`: 调整桌面端高度、滚动和区域约束，防止底部席位区与主舞台重叠。
- `src/features/game/components/game-shell.test.tsx`: 锁定桌面端布局 class，防止回退到无边界挤压。
- `src/features/game/components/seat-ring.tsx`: 移除绝对定位椭圆环绕，改为稳定的弱环绕/分组布局。
- `src/features/game/components/seat-ring.test.tsx`: 覆盖主舞台优先语义、非绝对定位布局和空状态。
- `openspec/changes/fix-ui-overlap/tasks.md`: 每完成一组行为后勾选对应任务。

### Task 1: 扩展发言账册 view-model 契约

**Files:**
- Modify: `src/features/game/types.ts`
- Modify: `src/features/game/view-model.ts`
- Modify: `src/features/game/view-model.test.ts`

- [ ] **Step 1: 写当前轮发言测试**

在 `src/features/game/view-model.test.ts` 中确保 `builds a current-round speech ledger from player messages only` 断言包含新字段：

```ts
expect(viewModel.speechLedger).toEqual({
  count: 2,
  sourceRound: 3,
  isFallback: false,
  latestSpeaker: "陈静",
  items: [
    {
      id: "3-day-7-player-0",
      speaker: "周涛",
      content: "我是好人。",
      round: 3,
      phase: "day",
    },
    {
      id: "3-day-5-player-1",
      speaker: "陈静",
      content: "我也支持先从发言看。",
      round: 3,
      phase: "day",
    },
  ],
})
```

- [ ] **Step 2: 写 fallback 测试**

在同一文件新增测试：

```ts
it("falls back to the latest available player speech when the current round has none", () => {
  const viewModel = buildGameViewModel(
    makeState({
      round: 2,
      phase: "night",
    }),
    [
      makeMessage({
        speakerId: 1,
        speaker: "李明",
        content: "上一轮我先发言。",
        phase: "day",
        round: 1,
        type: "player",
      }),
      makeMessage({
        speakerId: 2,
        speaker: "王芳",
        content: "上一轮我补充一点。",
        phase: "day",
        round: 1,
        type: "player",
      }),
      makeMessage({
        speakerId: 0,
        speaker: "系统",
        content: "1号李明被放逐。",
        phase: "day",
        round: 2,
        type: "vote",
      }),
    ],
  )

  expect(viewModel.speechLedger).toEqual({
    count: 2,
    sourceRound: 1,
    isFallback: true,
    latestSpeaker: "王芳",
    items: [
      {
        id: "1-day-1-player-0",
        speaker: "李明",
        content: "上一轮我先发言。",
        round: 1,
        phase: "day",
      },
      {
        id: "1-day-2-player-1",
        speaker: "王芳",
        content: "上一轮我补充一点。",
        round: 1,
        phase: "day",
      },
    ],
  })
})
```

- [ ] **Step 3: 运行测试确认失败**

Run: `npm run test -- src/features/game/view-model.test.ts`
Expected: FAIL，提示 `sourceRound` / `isFallback` 字段缺失或 fallback 未实现。

- [ ] **Step 4: 扩展类型**

在 `src/features/game/types.ts` 中更新：

```ts
export interface SpeechLedger {
  count: number
  sourceRound: number | null
  isFallback: boolean
  latestSpeaker: string | null
  items: SpeechLedgerItem[]
}
```

- [ ] **Step 5: 实现最小派生逻辑**

在 `src/features/game/view-model.ts` 中让未初始化模型返回：

```ts
speechLedger: {
  count: 0,
  sourceRound: null,
  isFallback: false,
  latestSpeaker: null,
  items: [],
},
```

并将 `buildSpeechLedger()` 更新为：

```ts
function buildSpeechLedger(
  state: ApiGameState,
  messages: ApiMessage[]
): SpeechLedger {
  const playerMessages = messages.filter((message) => message.type === "player")
  const currentRoundMessages = playerMessages.filter(
    (message) => message.round === state.round
  )
  const fallbackRound = playerMessages.reduce<number | null>((latestRound, message) => {
    if (message.round > state.round) {
      return latestRound
    }

    if (latestRound == null || message.round > latestRound) {
      return message.round
    }

    return latestRound
  }, null)
  const scopedMessages =
    currentRoundMessages.length > 0
      ? currentRoundMessages
      : fallbackRound == null
        ? []
        : playerMessages.filter((message) => message.round === fallbackRound)
  const items = scopedMessages.map((message, index): SpeechLedgerItem => ({
    id: `${message.round}-${message.phase}-${message.speakerId}-${message.type}-${index}`,
    speaker: message.speaker,
    content: message.content,
    round: message.round,
    phase: message.phase,
  }))

  return {
    count: items.length,
    sourceRound: items[0]?.round ?? null,
    isFallback: currentRoundMessages.length === 0 && items.length > 0,
    latestSpeaker: items.at(-1)?.speaker ?? null,
    items,
  }
}
```

- [ ] **Step 6: 运行测试确认通过并提交**

Run: `npm run test -- src/features/game/view-model.test.ts`
Expected: PASS。

```bash
git add src/features/game/types.ts src/features/game/view-model.ts src/features/game/view-model.test.ts
git commit -m "fix: derive fallback speech ledger"
```

### Task 2: 更新 SpeechLedger fallback 展示

**Files:**
- Modify: `src/features/game/components/speech-ledger.tsx`
- Modify: `src/features/game/components/speech-ledger.test.tsx`

- [ ] **Step 1: 写组件展示测试**

在 `src/features/game/components/speech-ledger.test.tsx` 中确保包含：

```ts
it("renders a fallback title when showing the latest available speeches", () => {
  const html = renderToStaticMarkup(
    <SpeechLedger
      ledger={{
        count: 2,
        sourceRound: 1,
        isFallback: true,
        latestSpeaker: "王芳",
        items: [
          { id: "1", speaker: "李明", content: "先听大家。", round: 1, phase: "day" },
          { id: "2", speaker: "王芳", content: "我同意继续观察。", round: 1, phase: "day" },
        ],
      }}
    />
  )

  expect(html).toContain("最近发言账册")
  expect(html).toContain("展示第 1 轮最近发言")
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- src/features/game/components/speech-ledger.test.tsx`
Expected: FAIL，页面仍显示“本轮发言账册”。

- [ ] **Step 3: 实现标题和说明派生**

在 `SpeechLedger()` 开头加入：

```ts
const title = ledger.isFallback ? "最近发言账册" : "本轮发言账册"
const description = ledger.latestSpeaker
  ? ledger.isFallback && ledger.sourceRound != null
    ? `展示第 ${ledger.sourceRound} 轮最近发言 · 最新发言: ${ledger.latestSpeaker}`
    : `最新发言: ${ledger.latestSpeaker}`
  : "等待本轮首位玩家发言..."
```

渲染处使用：

```tsx
{title}
```

和：

```tsx
{description}
```

空状态说明更新为：

```tsx
<p className="text-[10px] text-zinc-600 mt-1">
  如果上一轮已有发言，系统会自动回退展示最近一轮发言记录
</p>
```

- [ ] **Step 4: 运行测试确认通过并提交**

Run: `npm run test -- src/features/game/components/speech-ledger.test.tsx`
Expected: PASS。

```bash
git add src/features/game/components/speech-ledger.tsx src/features/game/components/speech-ledger.test.tsx
git commit -m "fix: label fallback speech ledger"
```

### Task 3: 修复 GameShell 桌面高度和滚动边界

**Files:**
- Modify: `src/features/game/components/game-shell.tsx`
- Modify: `src/features/game/components/game-shell.test.tsx`

- [ ] **Step 1: 写布局约束测试**

在 `src/features/game/components/game-shell.test.tsx` 中断言桌面布局不再依赖固定屏高裁切：

```ts
expect(html).toContain("lg:items-start")
expect(html).not.toContain("lg:h-screen")
expect(html).not.toContain("lg:overflow-hidden")
expect(html).not.toContain("lg:max-h-")
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- src/features/game/components/game-shell.test.tsx`
Expected: FAIL，旧布局仍包含固定屏高或桌面级裁切 class。

- [ ] **Step 3: 调整桌面容器 class**

在 `src/features/game/components/game-shell.tsx` 中使用以下结构：

```tsx
<div className="min-h-screen w-full bg-background pb-12 text-foreground transition-all duration-300">
  <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 lg:px-8">
    <header aria-label="banner" className="w-full">
      {banner}
    </header>

    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div
        aria-label="main log"
        className="flex min-w-0 flex-col gap-6"
      >
        {mainLog}
      </div>

      <aside aria-label="side rail" className="flex flex-col gap-6 lg:self-start">
        {sideRail}
      </aside>
    </section>

    <section aria-label="situation" className="mt-2 w-full">
      {situation}
    </section>
  </main>
</div>
```

- [ ] **Step 4: 运行测试确认通过并提交**

Run: `npm run test -- src/features/game/components/game-shell.test.tsx`
Expected: PASS。

```bash
git add src/features/game/components/game-shell.tsx src/features/game/components/game-shell.test.tsx
git commit -m "fix: constrain desktop game shell layout"
```

### Task 4: 将 SeatRing 改为稳定弱环绕布局

**Files:**
- Modify: `src/features/game/components/seat-ring.tsx`
- Modify: `src/features/game/components/seat-ring.test.tsx`

- [ ] **Step 1: 写主舞台优先与非绝对定位测试**

在 `src/features/game/components/seat-ring.test.tsx` 中确保包含：

```ts
expect(html).toContain("Central Narrative Stage")
expect(html).toContain("圆桌席位态势")
expect(html).toContain("1号 · 预言家 · 存活")
expect(html).not.toContain("李明")
expect(html).not.toContain("absolute inset-0")
expect(html).toContain("min-h-0")
expect(html).toContain("overflow-hidden")
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- src/features/game/components/seat-ring.test.tsx`
Expected: FAIL，旧实现仍包含绝对定位环绕 class。

- [ ] **Step 3: 替换绝对定位环绕**

在 `src/features/game/components/seat-ring.tsx` 中保留 `mapRoleLabel()`，将 `SeatRing()` 的返回结构改为：

```tsx
return (
  <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
    <Card className="w-full border-zinc-800/60 bg-zinc-950/20 shadow-lg backdrop-blur-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            圆桌席位态势
          </CardTitle>
          <Badge variant="outline" className="h-4.5 border-zinc-800 bg-zinc-900/30 px-1.5 text-[10px] text-zinc-400">
            {aliveCount} 存活 / {total} 总数
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {hasItems ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {items.map((player) => {
              const containerClass = player.alive
                ? player.team === "wolf"
                  ? "border-red-500/50 bg-red-950/20 text-red-100"
                  : "border-blue-500/40 bg-blue-950/10 text-blue-100"
                : "opacity-35 grayscale border-dashed border-zinc-800 bg-zinc-900/10 text-zinc-500"
              const roleLabel = mapRoleLabel(player.role)

              return (
                <div key={player.seat} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex size-11 items-center justify-center rounded-full border font-heading text-sm font-extrabold transition-all duration-300 ${containerClass}`}
                    title={`${player.seat}号 · ${roleLabel} · ${player.alive ? "存活" : "死亡"}`}
                  >
                    <span className="leading-none">{player.seat}</span>
                  </div>
                  <span className={`rounded border px-1.5 py-0.5 text-[8px] font-semibold tracking-tight ${
                    player.alive
                      ? player.team === "wolf"
                        ? "border-red-500/20 bg-red-950/60 text-red-400"
                        : "border-zinc-800 bg-zinc-900/80 text-zinc-400"
                      : "border-transparent bg-zinc-950/40 text-zinc-600"
                  }`}>
                    {roleLabel}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800/60 bg-zinc-950/10 px-4 py-6 text-center text-sm text-zinc-500">
            暂无席位数据
          </div>
        )}
      </CardContent>
    </Card>

    <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
  </div>
)
```

- [ ] **Step 4: 运行测试确认通过并提交**

Run: `npm run test -- src/features/game/components/seat-ring.test.tsx`
Expected: PASS。

```bash
git add src/features/game/components/seat-ring.tsx src/features/game/components/seat-ring.test.tsx
git commit -m "fix: stabilize seat ring layout"
```

### Task 5: 全量验证并同步 OpenSpec 任务

**Files:**
- Modify: `openspec/changes/fix-ui-overlap/tasks.md`

- [ ] **Step 1: 运行相关单测**

Run: `npm run test -- src/features/game/view-model.test.ts src/features/game/components/game-shell.test.tsx src/features/game/components/seat-ring.test.tsx src/features/game/components/speech-ledger.test.tsx`
Expected: PASS。后台执行时超时设置为 60s。

- [ ] **Step 2: 运行构建**

Run: `npm run build`
Expected: PASS，TypeScript 与 Vite 构建均成功。

- [ ] **Step 3: 浏览器验证桌面和移动端**

启动开发服务器：

```bash
npm run dev -- --host 127.0.0.1
```

验证视口：
- Desktop tall: `1440x900`
- Desktop short: `1440x720`
- Mobile: `390x844`

Expected:
- 主舞台时间线可读，内部滚动不压住底部席位区。
- 右侧导演席不覆盖主舞台。
- 席位态势卡片与主舞台存在稳定边界。
- 当前轮无发言时，发言账册展示“最近发言账册”和来源轮次。
- 移动端仍为纵向堆叠，不出现文字重叠。

- [ ] **Step 4: 勾选 OpenSpec tasks**

将 `openspec/changes/fix-ui-overlap/tasks.md` 更新为：

```md
- [x] 调整 `GameShell` 的桌面端布局约束，移除或替换导致区域重叠的固定视口高度与溢出策略。
- [x] 将 `SeatRing` 调整为保留主舞台焦点的稳定弱环绕/分组布局，避免绝对定位环绕导致的挤压与覆盖。
- [x] 为 `SpeechLedger` 增加最近可用发言回退逻辑与来源轮次标识。
- [x] 更新组件测试、view-model 测试或页面级测试，覆盖桌面端布局不重叠与发言回退行为。
- [x] 用浏览器验证桌面端至少两档视口高度与移动端回归表现，确认主舞台、导演席与席位区可读且可交互。
```

- [ ] **Step 5: 提交任务状态**

```bash
git add openspec/changes/fix-ui-overlap/tasks.md docs/superpowers/plans/2026-06-06-fix-ui-overlap.md
git commit -m "docs: track fix ui overlap plan"
```

## Self-Review

- Spec coverage: 桌面端主舞台稳定、SeatRing 非绝对定位、SpeechLedger fallback、测试和浏览器验证均有对应任务。
- Placeholder scan: 计划不包含 TBD、TODO、类似任务省略或未定义函数名。
- Type consistency: `SpeechLedger.sourceRound`、`SpeechLedger.isFallback`、`latestSpeaker` 与组件和测试中的字段一致。
