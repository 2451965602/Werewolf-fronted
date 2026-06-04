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
    const messages = [
      makeMessage({
        content: "狼人请睁眼并选择目标。",
        phase: "night",
        round: 1,
      }),
    ]

    const viewModel = buildGameViewModel(state, messages)

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
    expect(viewModel.heroBanner).toEqual({
      kicker: "第 1 轮 · 夜晚",
      title: "夜幕降临，行动正在暗处推进",
      description: "狼人请睁眼并选择目标。",
    })
    expect(viewModel.roleSpotlight).toEqual({
      title: "夜间焦点",
      highlight: "昨夜 王芳 倒下",
      supporting: "狼人请睁眼并选择目标。",
    })
    expect(viewModel.summary.currentRound).toBe(1)
    expect(viewModel.currentGameSummary).toEqual({
      round: 1,
      phaseLabel: "夜晚",
      aliveCount: 1,
      winnerLabel: "",
    })
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
    expect(viewModel.timeline[1]?.tone).toBe("vote")
  })

  it("maps winner label when game has ended", () => {
    const viewModel = buildGameViewModel(
      makeState({
        phase: "ended",
        ended: true,
        winner: "village",
        players: [
          makePlayer({ id: 1, team: "village", alive: true }),
          makePlayer({ id: 2, name: "王芳", team: "wolf", alive: false }),
        ],
      }),
      [
        makeMessage({
          content: "游戏结束，村民阵营获胜。",
          phase: "ended",
          type: "narrator",
        }),
      ]
    )

    expect(viewModel.phaseLabel).toBe("已结束")
    expect(viewModel.winnerLabel).toBe("村民阵营获胜")
    expect(viewModel.roleSpotlight).toEqual({
      title: "终局结果",
      highlight: "村民阵营获胜",
      supporting: "1 人存活，1 人出局。游戏结束，村民阵营获胜。",
    })
  })

  it("falls back to a safe phase label when backend phase is unknown", () => {
    const viewModel = buildGameViewModel(
      makeState({
        phase: "dusk" as ApiGameState["phase"],
      }),
      []
    )

    expect(viewModel.phaseVariant).toBe("night")
    expect(viewModel.phaseLabel).toBe("阶段同步中")
    expect(viewModel.heroBanner.kicker).toBe("第 1 轮 · 阶段同步中")
    expect(viewModel.heroBanner.title).toBe("阶段同步中，等待服务端确认")
    expect(viewModel.heroBanner.description).toBe(
      "当前阶段暂不可用，系统正在同步最新局势。"
    )
    expect(viewModel.roleSpotlight).toEqual({
      title: "未知阶段",
      highlight: "当前阶段状态同步中",
      supporting: "当前仍有 0 名玩家存活，等待服务端同步下一条阶段信息。",
    })
  })
})

describe("createUninitializedViewModel", () => {
  it("creates a not-started spectator screen model", () => {
    const viewModel = createUninitializedViewModel()

    expect(viewModel.isInitialized).toBe(false)
    expect(viewModel.screenMode).toBe("pregame")
    expect(viewModel.currentRound).toBe(0)
    expect(viewModel.currentGameSummary).toBeNull()
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
    expect(viewModel.heroBanner).toEqual({
      kicker: "等待开局",
      title: "狼人杀观战演示台",
      description: "连接服务后可直接开始一局新的狼人杀演示。",
    })
    expect(viewModel.roleSpotlight).toEqual({
      title: "开局提示",
      highlight: "连接服务后即可开始新的一局",
      supporting: "进入对局后，这里会展示阶段焦点、关键事件和胜负结果。",
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
