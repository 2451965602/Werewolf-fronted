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

describe("loadConsoleSnapshot", () => {
  it("loads a pregame snapshot when the game is uninitialized", async () => {
    const snapshot = await loadConsoleSnapshot({
      fetchHealth: vi.fn().mockResolvedValue({ status: "ok" }),
      fetchGameState: vi.fn().mockResolvedValue({ kind: "uninitialized" }),
      fetchMessages: vi.fn(),
    })

    expect(snapshot.viewModel.screenMode).toBe("pregame")
    expect(snapshot.viewModel.serviceHealth).toEqual({
      label: "服务正常",
      tone: "ok",
    })
    expect(snapshot.error).toBe("")
  })

  it("keeps the console usable when messages fail", async () => {
    const snapshot = await loadConsoleSnapshot({
      fetchHealth: vi.fn().mockResolvedValue({ status: "ok" }),
      fetchGameState: vi
        .fn()
        .mockResolvedValue({ kind: "ready", state: makeState({ phase: "night" }) }),
      fetchMessages: vi.fn().mockRejectedValue(new Error("messages down")),
    })

    expect(snapshot.viewModel.screenMode).toBe("console")
    expect(snapshot.viewModel.phaseLabel).toBe("夜晚")
    expect(snapshot.error).toContain("messages down")
  })
})

describe("startConsole", () => {
  it("refreshes state and messages after start succeeds", async () => {
    const startGame = vi.fn().mockResolvedValue(makeState())
    const fetchGameState = vi
      .fn()
      .mockResolvedValue({ kind: "ready", state: makeState({ round: 2 }) })
    const fetchMessages = vi.fn().mockResolvedValue([])

    const snapshot = await startConsole({
      startGame,
      fetchGameState,
      fetchMessages,
    })

    expect(startGame).toHaveBeenCalledTimes(1)
    expect(fetchGameState).toHaveBeenCalledTimes(1)
    expect(fetchMessages).toHaveBeenCalledTimes(1)
    expect(snapshot.viewModel.screenMode).toBe("console")
    expect(snapshot.viewModel.currentRound).toBe(2)
    expect(snapshot.error).toBe("")
  })
})

describe("advanceConsole", () => {
  it("refreshes state and messages after phase advance succeeds", async () => {
    const advancePhase = vi.fn().mockResolvedValue(makeState({ round: 2 }))
    const fetchGameState = vi
      .fn()
      .mockResolvedValue({ kind: "ready", state: makeState({ round: 3 }) })
    const fetchMessages = vi.fn().mockResolvedValue([])

    const snapshot = await advanceConsole({
      advancePhase,
      fetchGameState,
      fetchMessages,
    })

    expect(advancePhase).toHaveBeenCalledTimes(1)
    expect(fetchGameState).toHaveBeenCalledTimes(1)
    expect(fetchMessages).toHaveBeenCalledTimes(1)
    expect(snapshot.viewModel.currentRound).toBe(3)
    expect(snapshot.error).toBe("")
  })
})
