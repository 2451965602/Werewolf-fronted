export type ApiPhase = "day" | "night" | "ended"

export type ApiRole = "werewolf" | "villager" | "seer" | "witch" | "hunter"

export type ApiTeam = "wolf" | "village"

export type ApiMessageType = "system" | "narrator" | "player" | "vote"

export type ApiWinner = ApiTeam | ""

export interface ApiPlayer {
  id: number
  name: string
  role: ApiRole
  alive: boolean
  team: ApiTeam
}

export interface ApiMessage {
  speakerId: number
  speaker: string
  content: string
  phase: ApiPhase
  round: number
  type: ApiMessageType
}

export interface ApiInspectionResult {
  seerId: number
  targetId: number
  role: ApiRole
  round: number
}

export interface ApiGameState {
  round: number
  phase: ApiPhase
  ended: boolean
  winner?: ApiWinner
  players: ApiPlayer[]
  lastNightKilled?: number
  inspections: ApiInspectionResult[]
  witchHealUsed: boolean
  witchPoisonUsed: boolean
}

export interface TimelineItem {
  id: string
  tone: "system" | "player" | "vote"
  content: string
  speaker: string
  round: number
  phase: ApiPhase
}

export interface HeroBannerContent {
  kicker: string
  title: string
  description: string
}

export interface GameViewModel {
  screenMode: "pregame" | "console"
  isInitialized: boolean
  currentRound: number
  phaseVariant: "idle" | ApiPhase
  phaseLabel: string
  winnerLabel: string
  heroBanner: HeroBannerContent
  roleSpotlight: {
    title: string
    highlight: string
    supporting: string
  }
  serviceHealth: {
    label: string
    tone: "ok" | "warning" | "error"
  }
  heroIntro: {
    title: string
    description: string
    primaryActionLabel: string
  }
  players: ApiPlayer[]
  summary: {
    currentRound: number
    phaseLabel: string
    winnerLabel: string
    aliveCount: number
    deadCount: number
    wolfCountAlive: number
    lastNightKilled: number | null
    lastNightKilledPlayer: string | null
  }
  timeline: TimelineItem[]
  emptyState: {
    title: string
    description: string
  }
}
