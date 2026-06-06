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

  it("maps narrator messages into a distinct timeline category", () => {
    const viewModel = buildGameViewModel(
      makeState(),
      [
        makeMessage({
          speakerId: 99,
          speaker: "旁白",
          content: "夜幕降临，请闭眼。",
          phase: "night",
          round: 1,
          type: "narrator",
        }),
      ],
    )

    expect(viewModel.timeline).toEqual([
      {
        id: "1-99-narrator-0",
        tone: "narrator",
        content: "夜幕降临，请闭眼。",
        speaker: "旁白",
        round: 1,
        phase: "night",
      },
    ])
  })

  it("builds a current-round speech ledger from player messages only", () => {
    const state = makeState({
      round: 3,
      phase: "day",
    })
    const messages = [
      makeMessage({
        speakerId: 8,
        speaker: "赵强",
        content: "上一轮发言，不应出现在当前回合记录。",
        phase: "day",
        round: 2,
        type: "player",
      }),
      makeMessage({
        speakerId: 9,
        speaker: "钱丽",
        content: "系统播报也不应出现在发言记录。",
        phase: "day",
        round: 3,
        type: "system",
      }),
      makeMessage({
        speakerId: 7,
        speaker: "周涛",
        content: "我是好人。",
        phase: "day",
        round: 3,
        type: "player",
      }),
      makeMessage({
        speakerId: 5,
        speaker: "陈静",
        content: "我也支持先从发言看。",
        phase: "day",
        round: 3,
        type: "player",
      }),
    ]

    const viewModel = buildGameViewModel(state, messages)

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
  })

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

  it("derives a seat ring with living and eliminated players", () => {
    const state = makeState({
      players: [
        makePlayer({ id: 1, name: "李明", role: "seer", alive: true, team: "village" }),
        makePlayer({
          id: 2,
          name: "王芳",
          role: "werewolf",
          alive: false,
          team: "wolf",
        }),
      ],
    })

    const viewModel = buildGameViewModel(state, [])

    expect(viewModel.seatRing).toEqual([
      {
        seat: 1,
        name: "李明",
        role: "seer",
        alive: true,
        team: "village",
      },
      {
        seat: 2,
        name: "王芳",
        role: "werewolf",
        alive: false,
        team: "wolf",
      },
    ])
    expect(viewModel.seatRing[1]?.alive).toBe(false)
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
