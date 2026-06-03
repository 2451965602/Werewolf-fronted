import { describe, expect, it } from "vitest"

import { buildGameViewModel, createUninitializedViewModel } from "./view-model"
import type { ApiGameState, ApiMessage, ApiPlayer } from "./types"

function makePlayer(overrides: Partial<ApiPlayer> = {}): ApiPlayer {
  return {
    id: 1,
    name: "李明",
    role: "villager",
    alive: true,
    team: "village",
    ...overrides,
  }
}

function makeMessage(overrides: Partial<ApiMessage> = {}): ApiMessage {
  return {
    speakerId: 0,
    speaker: "系统",
    content: "进入第 1 天白天",
    phase: "day",
    round: 1,
    type: "system",
    ...overrides,
  }
}

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

describe("buildGameViewModel", () => {
  it("maps remote state into summary counts", () => {
    const state = makeState({
      phase: "night",
      players: [
        makePlayer({ id: 1, team: "wolf", alive: true }),
        makePlayer({ id: 2, name: "王芳", team: "village", alive: false }),
      ],
      lastNightKilled: 2,
    })

    const viewModel = buildGameViewModel(state, [])

    expect(viewModel.isInitialized).toBe(true)
    expect(viewModel.currentRound).toBe(1)
    expect(viewModel.screenMode).toBe("console")
    expect(viewModel.phaseVariant).toBe("night")
    expect(viewModel.phaseLabel).toBe("夜晚")
    expect(viewModel.serviceHealth).toEqual({
      label: "服务正常",
      tone: "ok",
    })
    expect(viewModel.heroIntro).toEqual({
      title: "Werewolf Command Stage",
      description: "通过服务端状态驱动当前局势、日志和玩家状态。",
      primaryActionLabel: "开始游戏",
    })
    expect(viewModel.summary.currentRound).toBe(1)
    expect(viewModel.summary.phaseLabel).toBe("夜晚")
    expect(viewModel.summary.aliveCount).toBe(1)
    expect(viewModel.summary.deadCount).toBe(1)
    expect(viewModel.summary.wolfCountAlive).toBe(1)
    expect(viewModel.summary.lastNightKilled).toBe(2)
    expect(viewModel.summary.lastNightKilledPlayer).toBe("王芳")
  })

  it("maps timeline items from standalone messages", () => {
    const messages = [
      makeMessage({
        speakerId: 7,
        speaker: "周涛",
        content: "我是好人。",
        phase: "day",
        round: 2,
        type: "player",
      }),
      makeMessage({
        content: "2号王芳被放逐。",
        phase: "day",
        round: 2,
        type: "vote",
      }),
    ]

    const viewModel = buildGameViewModel(makeState(), messages)

    expect(viewModel.timeline).toEqual([
      {
        id: "2-7-player-0",
        tone: "player",
        content: "我是好人。",
        speaker: "周涛",
        round: 2,
        phase: "day",
      },
      {
        id: "2-0-vote-1",
        tone: "vote",
        content: "2号王芳被放逐。",
        speaker: "系统",
        round: 2,
        phase: "day",
      },
    ])
  })

  it("maps winner label when game has ended", () => {
    const viewModel = buildGameViewModel(
      makeState({ phase: "ended", ended: true, winner: "village" }),
      []
    )

    expect(viewModel.phaseLabel).toBe("已结束")
    expect(viewModel.winnerLabel).toBe("村民阵营获胜")
  })
})

describe("createUninitializedViewModel", () => {
  it("creates a not-started spectator screen model", () => {
    const viewModel = createUninitializedViewModel()

    expect(viewModel.isInitialized).toBe(false)
    expect(viewModel.screenMode).toBe("pregame")
    expect(viewModel.currentRound).toBe(0)
    expect(viewModel.phaseVariant).toBe("idle")
    expect(viewModel.serviceHealth).toEqual({
      label: "等待服务连接",
      tone: "warning",
    })
    expect(viewModel.heroIntro).toEqual({
      title: "Werewolf Command Stage",
      description: "连接服务后可直接开始一局新的狼人杀演示。",
      primaryActionLabel: "开始游戏",
    })
    expect(viewModel.players).toEqual([])
    expect(viewModel.timeline).toEqual([])
    expect(viewModel.emptyState.title).toContain("开始游戏")
    expect(viewModel.summary).toEqual({
      aliveCount: 0,
      deadCount: 0,
      wolfCountAlive: 0,
      lastNightKilled: null,
      lastNightKilledPlayer: null,
      currentRound: 0,
      phaseLabel: "未开局",
      winnerLabel: "",
    })
  })

  it("keeps explicit empty-state copy for 404-uninitialized mapping in the api layer", () => {
    const viewModel = createUninitializedViewModel()

    expect(viewModel.emptyState.description).toContain("当前还没有游戏状态")
  })
})
