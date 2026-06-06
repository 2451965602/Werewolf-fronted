import type { GameViewModel } from "./features/game/types"
import { createUninitializedViewModel } from "./features/game/view-model"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const { useGameConsoleMock } = vi.hoisted(() => ({
  useGameConsoleMock: vi.fn(),
}))

vi.mock("./features/game/use-game-console", () => ({
  useGameConsole: useGameConsoleMock,
}))

vi.mock("./features/game/components/pre-game-screen", () => ({
  PreGameScreen: ({ onContinue, onStart, currentGameSummary }: { onContinue?: () => Promise<void>; onStart: () => Promise<void>; currentGameSummary?: GameViewModel["currentGameSummary"] }) => (
    <div>
      <span>PreGameScreen Stub</span>
      {currentGameSummary ? <button onClick={() => void onContinue?.()}>继续当前对局</button> : null}
      <button onClick={() => void onStart()}>开始游戏</button>
    </div>
  ),
}))

vi.mock("./features/game/components/stage-status-strip", () => ({
  StageStatusStrip: () => <div>StageStatusStrip Stub</div>,
}))

vi.mock("./features/game/components/speech-ledger", () => ({
  SpeechLedger: () => <div>SpeechLedger Stub</div>,
}))

vi.mock("./features/game/components/seat-ring", () => ({
  SeatRing: ({ children }: { children?: React.ReactNode }) => (
    <div>
      <span>SeatRing Stub</span>
      {children}
    </div>
  ),
}))

vi.mock("./features/game/components/narrative-log", () => ({
  NarrativeLog: () => <div>NarrativeLog Stub</div>,
}))

vi.mock("./features/game/components/game-summary", () => ({
  GameSummary: () => <div>GameSummary Stub</div>,
}))

vi.mock("./features/game/components/status-strip", () => ({
  StatusStrip: () => <div>StatusStrip Stub</div>,
}))

vi.mock("./features/game/components/player-grid", () => ({
  PlayerGrid: () => <div>PlayerGrid Stub</div>,
}))

vi.mock("./features/game/components/role-spotlight", () => ({
  RoleSpotlight: () => <div>RoleSpotlight Stub</div>,
}))

import { App } from "./App"

type MockRequestState = {
  isStarting: boolean
  isAdvancing: boolean
  isRefreshing: boolean
  error: string
}

function makeRequestState(overrides: Partial<MockRequestState> = {}): MockRequestState {
  return {
    isStarting: false,
    isAdvancing: false,
    isRefreshing: false,
    error: "",
    ...overrides,
  }
}

function makeConsoleViewModel(): GameViewModel {
  return {
    ...createUninitializedViewModel(),
    screenMode: "console",
    currentGameSummary: {
      round: 3,
      phaseLabel: "白天",
      aliveCount: 6,
      winnerLabel: "",
    },
    isInitialized: true,
    currentRound: 3,
    phaseVariant: "day",
    phaseLabel: "白天",
    roleSpotlight: {
      title: "白天焦点",
      highlight: "集中讨论当前嫌疑人",
      supporting: "投票前请关注每一轮发言变化。",
    },
    summary: {
      currentRound: 3,
      phaseLabel: "白天",
      winnerLabel: "",
      aliveCount: 6,
      deadCount: 2,
      wolfCountAlive: 2,
      lastNightKilled: 5,
      lastNightKilledPlayer: "王芳",
    },
  }
}

function findButtonByText(container: HTMLElement, text: string) {
  return Array.from(container.querySelectorAll("button")).find(
    (button) => button.textContent === text,
  )
}

describe("App", () => {
  beforeEach(() => {
    useGameConsoleMock.mockReset()
  })

  it("renders PreGameScreen when screen mode is pregame", () => {
    useGameConsoleMock.mockReturnValue({
      viewModel: createUninitializedViewModel(),
      requestState: makeRequestState(),
      refresh: vi.fn(),
      start: vi.fn(),
      advance: vi.fn(),
    })

    const html = renderToStaticMarkup(<App />)

    expect(html).toContain("PreGameScreen Stub")
    expect(html).not.toContain('aria-label="banner"')
  })

  it("stays on lobby when an active game already exists until continue is clicked", async () => {
    const currentViewModel = makeConsoleViewModel()

    useGameConsoleMock.mockImplementation(() => ({
      viewModel: currentViewModel,
      requestState: makeRequestState(),
      refresh: vi.fn(),
      start: vi.fn(),
      advance: vi.fn(),
    }))

    const html = renderToStaticMarkup(<App />)

    expect(html).toContain("PreGameScreen Stub")
    expect(html).not.toContain('aria-label="main log"')

    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<App />)
    })

    await act(async () => {
      findButtonByText(container, "继续当前对局")?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      )
    })

    expect(container.innerHTML).toContain('aria-label="banner"')
    expect(container.innerHTML).toContain('aria-label="main log"')
    expect(container.innerHTML).toContain('aria-label="side rail"')
    expect(container.innerHTML).toContain('aria-label="situation"')
    expect(container.innerHTML).toContain("StageStatusStrip Stub")
    expect(container.innerHTML).toContain("NarrativeLog Stub")
    expect(container.innerHTML).toContain("SpeechLedger Stub")
    expect(container.innerHTML).toContain("SeatRing Stub")
    expect(container.innerHTML).toContain("GameSummary Stub")
    expect(container.innerHTML).toContain("StatusStrip Stub")
    expect(container.innerHTML).toContain("RoleSpotlight Stub")
    expect(container.innerHTML).toContain("PlayerGrid Stub")
    expect(container.innerHTML.indexOf("RoleSpotlight Stub")).toBeLessThan(
      container.innerHTML.indexOf("PlayerGrid Stub"),
    )
    expect(container.innerHTML).toContain("game-situation-grid")
    expect(container.innerHTML).toContain("side-rail-stack")
    expect(container.innerHTML).not.toContain(["导演", "控制台"].join(""))

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it("switches to console after start succeeds", async () => {
    let currentViewModel: GameViewModel = createUninitializedViewModel()
    const start = vi.fn().mockImplementation(async () => {
      currentViewModel = makeConsoleViewModel()
      return true
    })

    useGameConsoleMock.mockImplementation(() => ({
      viewModel: currentViewModel,
      requestState: makeRequestState(),
      refresh: vi.fn(),
      start,
      advance: vi.fn(),
    }))

    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<App />)
    })

    await act(async () => {
      findButtonByText(container, "开始游戏")?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      )
    })

    expect(start).toHaveBeenCalledTimes(1)
    expect(container.innerHTML).toContain("GameSummary Stub")

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it("stays on lobby when start fails", async () => {
    const start = vi.fn().mockResolvedValue(false)

    useGameConsoleMock.mockImplementation(() => ({
      viewModel: createUninitializedViewModel(),
      requestState: makeRequestState(),
      refresh: vi.fn(),
      start,
      advance: vi.fn(),
    }))

    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<App />)
    })

    await act(async () => {
      findButtonByText(container, "开始游戏")?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      )
      await Promise.resolve()
    })

    expect(start).toHaveBeenCalledTimes(1)
    expect(container.innerHTML).toContain("PreGameScreen Stub")
    expect(container.innerHTML).not.toContain("GameSummary Stub")

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })
})
