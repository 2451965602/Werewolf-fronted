import type {
  ApiGameState,
  ApiMessage,
  ApiPhase,
  ApiWinner,
  GameViewModel,
  TimelineItem,
} from "./types"

export function buildGameViewModel(
  state: ApiGameState,
  messages: ApiMessage[]
): GameViewModel {
  const alivePlayers = state.players.filter((player) => player.alive)
  const phaseLabel = mapPhaseLabel(state.phase)
  const winnerLabel = mapWinnerLabel(state.winner ?? "")
  const lastNightKilledPlayer =
    state.lastNightKilled != null
      ? (state.players.find((player) => player.id === state.lastNightKilled)
          ?.name ?? null)
      : null

  return {
    screenMode: "console",
    isInitialized: true,
    currentRound: state.round,
    phaseVariant: state.phase,
    phaseLabel,
    winnerLabel,
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
    summary: {
      currentRound: state.round,
      phaseLabel,
      winnerLabel,
      aliveCount: alivePlayers.length,
      deadCount: state.players.length - alivePlayers.length,
      wolfCountAlive: alivePlayers.filter((player) => player.team === "wolf")
        .length,
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
    isInitialized: false,
    currentRound: 0,
    phaseVariant: "idle",
    phaseLabel: "未开局",
    winnerLabel: "",
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

function mapPhaseLabel(phase: ApiPhase): string {
  switch (phase) {
    case "day":
      return "白天"
    case "night":
      return "夜晚"
    case "ended":
      return "已结束"
    default:
      return phase
  }
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

function mapMessageTone(type: ApiMessage["type"]): TimelineItem["tone"] {
  switch (type) {
    case "player":
      return "player"
    case "vote":
      return "vote"
    default:
      return "system"
  }
}
