import type { GameViewModel } from "./features/game/types"
import { createUninitializedViewModel } from "./features/game/view-model"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { useGameConsoleMock } = vi.hoisted(() => ({
  useGameConsoleMock: vi.fn(),
}))

vi.mock("./features/game/use-game-console", () => ({
  useGameConsole: useGameConsoleMock,
}))

vi.mock("./features/game/components/pre-game-screen", () => ({
  PreGameScreen: () => <div>PreGameScreen Stub</div>,
}))

vi.mock("./features/game/components/phase-hero", () => ({
  PhaseHero: () => <div>PhaseHero Stub</div>,
}))

vi.mock("./features/game/components/narrative-log", () => ({
  NarrativeLog: () => <div>NarrativeLog Stub</div>,
}))

vi.mock("./features/game/components/control-panel", () => ({
  ControlPanel: () => <div>ControlPanel Stub</div>,
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

  it("renders the game shell layout when screen mode is console", () => {
    useGameConsoleMock.mockReturnValue({
      viewModel: makeConsoleViewModel(),
      requestState: makeRequestState(),
      refresh: vi.fn(),
      start: vi.fn(),
      advance: vi.fn(),
    })

    const html = renderToStaticMarkup(<App />)

    expect(html).toContain('aria-label="banner"')
    expect(html).toContain('aria-label="main log"')
    expect(html).toContain('aria-label="side rail"')
    expect(html).toContain('aria-label="situation"')
    expect(html).toContain("PhaseHero Stub")
    expect(html).toContain("NarrativeLog Stub")
    expect(html).toContain("ControlPanel Stub")
    expect(html).toContain("GameSummary Stub")
    expect(html).toContain("StatusStrip Stub")
    expect(html).toContain("RoleSpotlight Stub")
    expect(html).toContain("PlayerGrid Stub")
  })
})
