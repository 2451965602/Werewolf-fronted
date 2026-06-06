import type {
  ApiGameState,
  ApiMessage,
  ApiPhase,
  ApiWinner,
  GameViewModel,
  SeatRingItem,
  SpeechLedger,
  SpeechLedgerItem,
  TimelineItem,
} from "./types"

type ResolvedPhase = ApiPhase | "unknown"

export function buildGameViewModel(
  state: ApiGameState,
  messages: ApiMessage[]
): GameViewModel {
  const alivePlayers = state.players.filter((player) => player.alive)
  const aliveCount = alivePlayers.length
  const deadCount = state.players.length - aliveCount
  const wolfCountAlive = alivePlayers.filter((player) => player.team === "wolf")
    .length
  const resolvedPhase = resolvePhase(state.phase)
  const phaseLabel = mapPhaseLabel(resolvedPhase)
  const winnerLabel = mapWinnerLabel(state.winner ?? "")
  const lastNightKilledPlayer =
    state.lastNightKilled != null
      ? (state.players.find((player) => player.id === state.lastNightKilled)
          ?.name ?? null)
      : null
  const latestRelevantMessage = pickLatestRelevantMessage(state, messages)
  const speechLedger = buildSpeechLedger(state, messages)
  const seatRing = buildSeatRing(state)
  const heroBanner = buildHeroBanner({
    round: state.round,
    phase: resolvedPhase,
    phaseLabel,
    winnerLabel,
    latestMessage: latestRelevantMessage,
    aliveCount,
    lastNightKilledPlayer,
  })
  const roleSpotlight = buildRoleSpotlight({
    phase: resolvedPhase,
    ended: state.ended,
    winnerLabel,
    latestMessage: latestRelevantMessage,
    aliveCount,
    deadCount,
    wolfCountAlive,
    lastNightKilledPlayer,
  })

  return {
    screenMode: "console",
    currentGameSummary: {
      round: state.round,
      phaseLabel,
      aliveCount,
      winnerLabel,
    },
    isInitialized: true,
    currentRound: state.round,
    phaseVariant: mapPhaseVariant(resolvedPhase),
    phaseLabel,
    winnerLabel,
    heroBanner,
    roleSpotlight,
    serviceHealth: {
      label: "服务正常",
      tone: "ok",
    },
    heroIntro: {
      title: "Werewolf Command Stage",
      description: "通过服务端状态驱动当前局势、日志和玩家状态。",
      primaryActionLabel: "开始游戏",
    },
    players: state.players,
    speechLedger,
    seatRing,
    summary: {
      currentRound: state.round,
      phaseLabel,
      winnerLabel,
      aliveCount,
      deadCount,
      wolfCountAlive,
      lastNightKilled: state.lastNightKilled ?? null,
      lastNightKilledPlayer,
    },
    timeline: messages.map((message, index) => mapTimelineItem(message, index)),
    emptyState: {
      title: "点击开始游戏以初始化狼人杀演示台",
      description: "开局后，这里会显示阶段推进、系统播报和玩家发言时间线。",
    },
  }
}

export function createUninitializedViewModel(): GameViewModel {
  return {
    screenMode: "pregame",
    currentGameSummary: null,
    isInitialized: false,
    currentRound: 0,
    phaseVariant: "idle",
    phaseLabel: "未开局",
    winnerLabel: "",
    heroBanner: {
      kicker: "等待开局",
      title: "狼人杀观战演示台",
      description: "连接服务后可直接开始一局新的狼人杀演示。",
    },
    roleSpotlight: {
      title: "开局提示",
      highlight: "连接服务后即可开始新的一局",
      supporting: "进入对局后，这里会展示阶段焦点、关键事件和胜负结果。",
    },
    serviceHealth: {
      label: "等待服务连接",
      tone: "warning",
    },
    heroIntro: {
      title: "Werewolf Command Stage",
      description: "连接服务后可直接开始一局新的狼人杀演示。",
      primaryActionLabel: "开始游戏",
    },
    players: [],
    speechLedger: {
      count: 0,
      sourceRound: null,
      isFallback: false,
      latestSpeaker: null,
      items: [],
    },
    seatRing: [],
    summary: {
      currentRound: 0,
      phaseLabel: "未开局",
      winnerLabel: "",
      aliveCount: 0,
      deadCount: 0,
      wolfCountAlive: 0,
      lastNightKilled: null,
      lastNightKilledPlayer: null,
    },
    timeline: [],
    emptyState: {
      title: "点击开始游戏以初始化狼人杀演示台",
      description: "当前还没有游戏状态。开始游戏后可以手动推进阶段并观察日志。",
    },
  }
}

const PHASE_LABELS: Record<ApiPhase, string> = {
  day: "白天",
  night: "夜晚",
  ended: "已结束",
}

function resolvePhase(phase: ApiPhase): ResolvedPhase {
  return phase === "day" || phase === "night" || phase === "ended"
    ? phase
    : "unknown"
}

function mapPhaseVariant(phase: ResolvedPhase): GameViewModel["phaseVariant"] {
  return phase === "unknown" ? "night" : phase
}

function mapPhaseLabel(phase: ResolvedPhase): string {
  return phase === "unknown" ? "阶段同步中" : PHASE_LABELS[phase]
}

function buildHeroBanner({
  round,
  phase,
  phaseLabel,
  winnerLabel,
  latestMessage,
  aliveCount,
  lastNightKilledPlayer,
}: {
  round: number
  phase: ResolvedPhase
  phaseLabel: string
  winnerLabel: string
  latestMessage: ApiMessage | null
  aliveCount: number
  lastNightKilledPlayer: string | null
}): GameViewModel["heroBanner"] {
  return {
    kicker: `第 ${round} 轮 · ${phaseLabel}`,
    title: mapHeroBannerTitle(phase, winnerLabel),
    description:
      phase === "unknown"
        ? mapHeroBannerDescription(
            phase,
            winnerLabel,
            aliveCount,
            lastNightKilledPlayer
          )
        :
      latestMessage?.content ??
          mapHeroBannerDescription(
            phase,
            winnerLabel,
            aliveCount,
            lastNightKilledPlayer
          ),
  }
}

function mapHeroBannerTitle(phase: ResolvedPhase, winnerLabel: string): string {
  switch (phase) {
    case "night":
      return "夜幕降临，行动正在暗处推进"
    case "ended":
      return winnerLabel || "牌局已结束，等待结算确认"
    case "unknown":
      return "阶段同步中，等待服务端确认"
    case "day":
    default:
      return "白天讨论开始，留意每一次发言"
  }
}

function mapHeroBannerDescription(
  phase: ResolvedPhase,
  winnerLabel: string,
  aliveCount: number,
  lastNightKilledPlayer: string | null
): string {
  switch (phase) {
    case "night":
      return lastNightKilledPlayer
        ? `昨夜 ${lastNightKilledPlayer} 已出局，夜间行动仍在继续。`
        : "系统正在结算夜间行动与身份技能。"
    case "ended":
      return winnerLabel
        ? `${winnerLabel}，本局对抗已经落幕。`
        : "本局已结束，等待胜负结果同步。"
    case "unknown":
      return "当前阶段暂不可用，系统正在同步最新局势。"
    case "day":
    default:
      return `当前仍有 ${aliveCount} 名玩家存活，讨论与投票将决定接下来的局势。`
  }
}

function buildRoleSpotlight({
  phase,
  ended,
  winnerLabel,
  latestMessage,
  aliveCount,
  deadCount,
  wolfCountAlive,
  lastNightKilledPlayer,
}: {
  phase: ResolvedPhase
  ended: boolean
  winnerLabel: string
  latestMessage: ApiMessage | null
  aliveCount: number
  deadCount: number
  wolfCountAlive: number
  lastNightKilledPlayer: string | null
}): GameViewModel["roleSpotlight"] {
  if (ended && winnerLabel) {
    return {
      title: "终局结果",
      highlight: winnerLabel,
      supporting: `${aliveCount} 人存活，${deadCount} 人出局。${latestMessage?.content ?? "游戏结束，等待下一局开始。"}`,
    }
  }

  if (phase === "unknown") {
    return {
      title: "未知阶段",
      highlight: "当前阶段状态同步中",
      supporting: `当前仍有 ${aliveCount} 名玩家存活，等待服务端同步下一条阶段信息。`,
    }
  }

  if (phase === "night") {
    return {
      title: "夜间焦点",
      highlight: lastNightKilledPlayer
        ? `昨夜 ${lastNightKilledPlayer} 倒下`
        : "昨夜暂未出现新的牺牲者",
      supporting:
        latestMessage?.content ??
        `仍有 ${wolfCountAlive} 名狼人潜伏，场上剩余 ${aliveCount} 名存活玩家。`,
    }
  }

  return {
    title: phase === "ended" ? "终局焦点" : "白天焦点",
    highlight:
      latestMessage?.content ??
      `场上仍有 ${aliveCount} 名玩家等待发言与投票。`,
    supporting:
      phase === "ended"
        ? "牌局已结束，等待胜负结果同步。"
        : `当前存活 ${aliveCount} 人，其中狼人存活 ${wolfCountAlive} 人。`,
  }
}

function pickLatestRelevantMessage(
  state: ApiGameState,
  messages: ApiMessage[]
): ApiMessage | null {
  const scopedMessages = messages.filter(
    (message) => message.round === state.round && message.phase === state.phase
  )

  if (scopedMessages.length > 0) {
    return scopedMessages.at(-1) ?? null
  }

  return messages.at(-1) ?? null
}

function mapWinnerLabel(winner: ApiWinner): string {
  switch (winner) {
    case "village":
      return "村民阵营获胜"
    case "wolf":
      return "狼人阵营获胜"
    default:
      return ""
  }
}

function mapTimelineItem(message: ApiMessage, index: number): TimelineItem {
  return {
    id: `${message.round}-${message.speakerId}-${message.type}-${index}`,
    tone: mapMessageTone(message.type),
    content: message.content,
    speaker: message.speaker,
    round: message.round,
    phase: message.phase,
  }
}

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
  const items = scopedMessages
    .map((message, index): SpeechLedgerItem => ({
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

function buildSeatRing(state: ApiGameState): SeatRingItem[] {
  return state.players.map((player) => ({
    seat: player.id,
    name: player.name,
    role: player.role,
    alive: player.alive,
    team: player.team,
  }))
}

function mapMessageTone(type: ApiMessage["type"]): TimelineItem["tone"] {
  switch (type) {
    case "narrator":
      return "narrator"
    case "player":
      return "player"
    case "vote":
      return "vote"
    default:
      return "system"
  }
}
