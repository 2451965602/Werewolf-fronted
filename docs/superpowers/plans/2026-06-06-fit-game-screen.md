---
change: fit-game-screen
design-doc: docs/superpowers/specs/2026-06-06-fit-game-screen-design.md
base-ref: 27f5185df1eb3f809e49deb54a6e06b83fcb9596
---

# Fit Game Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让对局观战页在 1920x1080 桌面视口下尽量单屏展示主要内容，移除导演控制台，并让时间线与发言账册最新优先。

**Architecture:** 顺序语义集中在 `buildGameViewModel()`，组件按传入顺序渲染。页面组合层从 `App.tsx` 移除导演操作面板；布局层通过 `GameShell` 的桌面视口预算和局部滚动边界控制 1080p 可见性。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Tailwind v4、shadcn/ui

---

## File Structure

- `src/features/game/view-model.ts`: 输出最新优先的 `timeline` 与 `speechLedger.items`，并同步 `latestSpeaker`。
- `src/features/game/view-model.test.ts`: 锁定时间线、当前轮发言、fallback 发言的最新优先顺序。
- `src/features/game/components/narrative-log.tsx`: 将最新焦点改为读取 `items[0]`。
- `src/features/game/components/narrative-log.test.tsx`: 验证最新焦点使用第一条记录。
- `src/features/game/components/speech-ledger.test.tsx`: 验证组件按传入顺序渲染倒序发言。
- `src/App.tsx`: 移除 `ControlPanel` import、props 传递和右侧栏渲染。
- `src/App.test.tsx`: 移除 `ControlPanel` mock，断言对局页不包含导演控制台。
- `src/features/game/components/control-panel.tsx`: 删除无引用的导演操作组件。
- `src/features/game/components/status-strip.tsx`: 移除未开局提示中的“导演台”措辞。
- `src/features/game/components/game-shell.tsx`: 加入桌面端视口预算、局部滚动和更紧凑的 grid/flex 约束。
- `src/features/game/components/game-shell.test.tsx`: 更新桌面布局 class 断言。
- `src/features/game/components/speech-ledger.tsx`: 调整桌面高度为可伸缩，适配右侧栏视口预算。
- `openspec/changes/fit-game-screen/tasks.md`: 每完成对应任务组后勾选。

### Task 1: 数据排序契约

**Files:**
- Modify: `src/features/game/view-model.test.ts`
- Modify: `src/features/game/view-model.ts`
- Modify: `src/features/game/components/narrative-log.tsx`
- Modify: `src/features/game/components/narrative-log.test.tsx`
- Modify: `src/features/game/components/speech-ledger.test.tsx`

- [ ] **Step 1: 写时间线倒序失败测试**

在 `src/features/game/view-model.test.ts` 的 `maps timeline items from standalone messages` 中，把断言改为最新消息在第一位：

```ts
expect(viewModel.timeline).toEqual([
  {
    id: "2-0-vote-1",
    tone: "vote",
    content: "2号王芳被放逐。",
    speaker: "系统",
    round: 2,
    phase: "day",
  },
  {
    id: "2-7-player-0",
    tone: "player",
    content: "我是好人。",
    speaker: "周涛",
    round: 2,
    phase: "day",
  },
])
expect(viewModel.timeline[0]?.tone).toBe("vote")
```

- [ ] **Step 2: 写发言账册倒序失败测试**

在同文件中更新当前轮发言断言：

```ts
expect(viewModel.speechLedger).toEqual({
  count: 2,
  sourceRound: 3,
  isFallback: false,
  latestSpeaker: "陈静",
  items: [
    {
      id: "3-day-5-player-1",
      speaker: "陈静",
      content: "我也支持先从发言看。",
      round: 3,
      phase: "day",
    },
    {
      id: "3-day-7-player-0",
      speaker: "周涛",
      content: "我是好人。",
      round: 3,
      phase: "day",
    },
  ],
})
```

同步更新 fallback 发言断言：

```ts
expect(viewModel.speechLedger).toEqual({
  count: 2,
  sourceRound: 1,
  isFallback: true,
  latestSpeaker: "王芳",
  items: [
    {
      id: "1-day-2-player-1",
      speaker: "王芳",
      content: "上一轮我补充一点。",
      round: 1,
      phase: "day",
    },
    {
      id: "1-day-1-player-0",
      speaker: "李明",
      content: "上一轮我先发言。",
      round: 1,
      phase: "day",
    },
  ],
})
```

- [ ] **Step 3: 运行 view-model 测试确认失败**

Run: `npm run test -- src/features/game/view-model.test.ts`

Expected: FAIL，失败点应指向 `timeline` 或 `speechLedger.items` 顺序仍是旧到新。

- [ ] **Step 4: 实现 view-model 最新优先**

在 `src/features/game/view-model.ts` 中加入不可变反转 helper：

```ts
function newestFirst<T>(items: T[]): T[] {
  return [...items].reverse()
}
```

把 `timeline` 派生改为：

```ts
timeline: newestFirst(
  messages.map((message, index) => mapTimelineItem(message, index))
),
```

把 `buildSpeechLedger()` 的 items 派生改为：

```ts
const items = newestFirst(
  scopedMessages.map((message, index): SpeechLedgerItem => ({
    id: `${message.round}-${message.phase}-${message.speakerId}-${message.type}-${index}`,
    speaker: message.speaker,
    content: message.content,
    round: message.round,
    phase: message.phase,
  }))
)

return {
  count: items.length,
  sourceRound: items[0]?.round ?? null,
  isFallback: currentRoundMessages.length === 0 && items.length > 0,
  latestSpeaker: items[0]?.speaker ?? null,
  items,
}
```

- [ ] **Step 5: 改 NarrativeLog 最新焦点**

在 `src/features/game/components/narrative-log.tsx` 中把：

```ts
const latestItem = hasItems ? items[items.length - 1] : null
```

改为：

```ts
const latestItem = hasItems ? items[0] : null
```

- [ ] **Step 6: 补组件顺序测试**

在 `src/features/game/components/narrative-log.test.tsx` 中，传入第一条为最新记录，并断言当前镜头区域包含第一条内容：

```ts
expect(html.indexOf("夜幕降临，请闭眼。")).toBeLessThan(
  html.indexOf("1号投给3号。"),
)
```

在 `src/features/game/components/speech-ledger.test.tsx` 中，把 items 顺序改为王芳在前，并添加：

```ts
expect(html.indexOf("我同意继续观察。")).toBeLessThan(
  html.indexOf("先听大家。"),
)
```

- [ ] **Step 7: 运行排序相关测试确认通过**

Run: `npm run test -- src/features/game/view-model.test.ts src/features/game/components/narrative-log.test.tsx src/features/game/components/speech-ledger.test.tsx`

Expected: PASS。

- [ ] **Step 8: 勾选 OpenSpec 数据排序任务**

把 `openspec/changes/fit-game-screen/tasks.md` 中 1.1、1.2、1.3 改为：

```md
- [x] 1.1 Update `view-model.ts` so `timeline` is derived with newest records first while preserving latest-focus metadata.
- [x] 1.2 Update `buildSpeechLedger` so current-round and fallback speech records are returned newest first.
- [x] 1.3 Update view-model tests to assert newest-first timeline and speech ledger ordering.
```

- [ ] **Step 9: 提交数据排序改动**

```bash
git add src/features/game/view-model.ts src/features/game/view-model.test.ts src/features/game/components/narrative-log.tsx src/features/game/components/narrative-log.test.tsx src/features/game/components/speech-ledger.test.tsx openspec/changes/fit-game-screen/tasks.md
git commit -m "feat: show latest game records first"
```

### Task 2: 移除导演控制台

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`
- Delete: `src/features/game/components/control-panel.tsx`
- Modify: `src/features/game/components/status-strip.tsx`
- Modify: `openspec/changes/fit-game-screen/tasks.md`

- [ ] **Step 1: 更新 App 测试**

在 `src/App.test.tsx` 中删除 `vi.mock("./features/game/components/control-panel", ...)` 代码块，并删除进入对局后的正向断言：

```ts
expect(container.innerHTML).toContain("ControlPanel Stub")
```

在同一测试中加入负向断言：

```ts
expect(container.innerHTML).not.toContain("ControlPanel Stub")
expect(container.innerHTML).not.toContain("导演控制台")
```

- [ ] **Step 2: 运行 App 测试确认失败**

Run: `npm run test -- src/App.test.tsx`

Expected: FAIL，因为 `App.tsx` 仍渲染 `ControlPanel`，测试仍能看到相关内容或 import 会被触发。

- [ ] **Step 3: 从 App 移除 ControlPanel**

在 `src/App.tsx` 中删除：

```ts
import { ControlPanel } from "./features/game/components/control-panel"
```

把 hook 解构从：

```ts
const { viewModel, requestState, refresh, start, advance } = useGameConsole()
```

改为：

```ts
const { viewModel, requestState, refresh, start } = useGameConsole()
```

把 `sideRail` 改为：

```tsx
sideRail={
  <div className="flex h-full min-h-0 flex-col gap-4">
    <SpeechLedger ledger={viewModel.speechLedger} />
    <GameSummary summary={viewModel.summary} />
    <StatusStrip
      error={requestState.error}
      isInitialized={viewModel.isInitialized}
    />
  </div>
}
```

- [ ] **Step 4: 删除无引用组件并清理文案**

删除 `src/features/game/components/control-panel.tsx`。

在 `src/features/game/components/status-strip.tsx` 中把未开局提示从：

```tsx
古堡仍在候场，请在导演台点击“开始游戏”完成首次发牌。
```

改为：

```tsx
古堡仍在候场，请回到大厅开始新局完成首次发牌。
```

- [ ] **Step 5: 确认无剩余引用**

Run: `rg -n "ControlPanel|control-panel|导演控制台|导演席控制|导演台" src`

Expected: 无输出。

- [ ] **Step 6: 运行 App 测试确认通过**

Run: `npm run test -- src/App.test.tsx`

Expected: PASS。

- [ ] **Step 7: 勾选 OpenSpec 控制台简化任务**

把 `openspec/changes/fit-game-screen/tasks.md` 中 2.1、2.2、2.3 改为 checked。

- [ ] **Step 8: 提交移除导演控制台改动**

```bash
git add src/App.tsx src/App.test.tsx src/features/game/components/status-strip.tsx openspec/changes/fit-game-screen/tasks.md
git add -u src/features/game/components/control-panel.tsx
git commit -m "feat: remove director controls from spectator view"
```

### Task 3: 1920x1080 桌面布局预算

**Files:**
- Modify: `src/features/game/components/game-shell.test.tsx`
- Modify: `src/features/game/components/game-shell.tsx`
- Modify: `src/features/game/components/speech-ledger.tsx`
- Modify: `openspec/changes/fit-game-screen/tasks.md`

- [ ] **Step 1: 更新 GameShell 布局测试**

在 `src/features/game/components/game-shell.test.tsx` 中把旧的负向断言：

```ts
expect(html).not.toContain("lg:h-screen")
expect(html).not.toContain("lg:overflow-hidden")
expect(html).not.toContain("lg:max-h-")
```

改成新的正向断言：

```ts
expect(html).toContain("lg:h-screen")
expect(html).toContain("lg:overflow-hidden")
expect(html).toContain("lg:grid")
expect(html).toContain("lg:grid-rows-[auto_minmax(0,1fr)_minmax(180px,260px)]")
expect(html).toContain("lg:overflow-auto")
```

- [ ] **Step 2: 运行 GameShell 测试确认失败**

Run: `npm run test -- src/features/game/components/game-shell.test.tsx`

Expected: FAIL，因为当前 `GameShell` 仍是自然文档流。

- [ ] **Step 3: 实现 GameShell 桌面视口预算**

用以下结构替换 `src/features/game/components/game-shell.tsx` 的返回 JSX class 组合，保留四个 aria-label：

```tsx
return (
  <div className="min-h-screen w-full bg-background text-foreground transition-all duration-300 lg:h-screen lg:overflow-hidden">
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-6 lg:grid lg:h-full lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)_minmax(180px,260px)] lg:px-6 lg:py-4 xl:max-w-[1800px] 2xl:max-w-[1840px]">
      <header aria-label="banner" className="w-full min-w-0">
        {banner}
      </header>

      <section className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch xl:grid-cols-[minmax(0,1fr)_340px]">
        <div aria-label="main log" className="flex min-h-0 min-w-0 flex-col">
          {mainLog}
        </div>

        <aside aria-label="side rail" className="min-h-0 min-w-0 overflow-hidden">
          {sideRail}
        </aside>
      </section>

      <section aria-label="situation" className="min-h-0 w-full overflow-hidden lg:overflow-auto">
        {situation}
      </section>
    </main>
  </div>
)
```

- [ ] **Step 4: 调整 SpeechLedger 桌面高度**

在 `src/features/game/components/speech-ledger.tsx` 中把外层 `Card` class 从固定 `lg:h-[480px]` 改为可伸缩：

```tsx
<Card className="flex h-[320px] flex-col overflow-hidden border-zinc-800/60 bg-zinc-950/20 shadow-lg backdrop-blur-md lg:h-auto lg:min-h-0 lg:flex-1">
```

- [ ] **Step 5: 运行布局测试确认通过**

Run: `npm run test -- src/features/game/components/game-shell.test.tsx src/features/game/components/speech-ledger.test.tsx`

Expected: PASS。

- [ ] **Step 6: 勾选 OpenSpec 布局任务**

把 `openspec/changes/fit-game-screen/tasks.md` 中 3.1、3.2、3.3 改为 checked。

- [ ] **Step 7: 提交布局改动**

```bash
git add src/features/game/components/game-shell.tsx src/features/game/components/game-shell.test.tsx src/features/game/components/speech-ledger.tsx openspec/changes/fit-game-screen/tasks.md
git commit -m "feat: fit spectator view to desktop viewport"
```

### Task 4: 验证与浏览器检查

**Files:**
- Modify: `openspec/changes/fit-game-screen/tasks.md`

- [ ] **Step 1: 运行聚焦单元测试**

Run: `npm run test -- src/features/game/view-model.test.ts src/App.test.tsx src/features/game/components/game-shell.test.tsx src/features/game/components/narrative-log.test.tsx src/features/game/components/speech-ledger.test.tsx`

Expected: PASS。后台执行时设置 60000ms 超时。

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck`

Expected: PASS。后台执行时设置 60000ms 超时。

- [ ] **Step 3: 运行 lint**

Run: `npm run lint`

Expected: PASS。后台执行时设置 60000ms 超时。

- [ ] **Step 4: 运行完整构建**

Run: `npm run build`

Expected: PASS。后台执行时设置 60000ms 超时。

- [ ] **Step 5: 浏览器验证 1920x1080**

启动 dev server：

```bash
npm run dev -- --host 127.0.0.1
```

在 1920x1080 viewport 打开应用，进入已有或新建对局后检查：

```js
({
  hasDirectorConsole: document.body.innerText.includes("导演控制台"),
  hasMainLog: !!document.querySelector('[aria-label="main log"]'),
  hasSideRail: !!document.querySelector('[aria-label="side rail"]'),
  hasSituation: !!document.querySelector('[aria-label="situation"]'),
  pageNeedsScroll:
    document.documentElement.scrollHeight > window.innerHeight + 2,
})
```

Expected:

```js
{
  hasDirectorConsole: false,
  hasMainLog: true,
  hasSideRail: true,
  hasSituation: true,
  pageNeedsScroll: false,
}
```

- [ ] **Step 6: 勾选验证任务**

把 `openspec/changes/fit-game-screen/tasks.md` 中 4.1、4.2、4.3 改为 checked。

- [ ] **Step 7: 提交验证记录**

```bash
git add openspec/changes/fit-game-screen/tasks.md
git commit -m "test: verify fit game screen change"
```
