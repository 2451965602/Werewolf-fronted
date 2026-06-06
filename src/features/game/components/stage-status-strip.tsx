import { Badge } from "../../../components/ui/badge"
import { Card } from "../../../components/ui/card"

interface StageStatusStripProps {
  isInitialized: boolean
  currentRound: number
  phaseLabel: string
  phaseVariant: "idle" | "day" | "night" | "ended"
  winnerLabel: string
}

export function StageStatusStrip({
  isInitialized,
  currentRound,
  phaseLabel,
  phaseVariant,
  winnerLabel,
}: StageStatusStripProps) {
  const bgGradient = isInitialized
    ? phaseVariant === "night"
      ? "from-violet-950/40 via-slate-900/40 to-indigo-950/40 border-violet-500/20 shadow-violet-500/5"
      : phaseVariant === "ended"
        ? "from-amber-950/40 via-stone-900/40 to-yellow-950/40 border-amber-500/20 shadow-amber-500/5"
        : "from-orange-950/30 via-zinc-900/40 to-stone-950/30 border-orange-500/20 shadow-orange-500/5"
    : "from-zinc-950/40 via-zinc-900/40 to-zinc-950/40 border-zinc-500/10 shadow-black/5"

  const stateDotClass =
    phaseVariant === "ended"
      ? "bg-amber-400"
      : isInitialized
        ? "animate-pulse bg-emerald-400"
        : "bg-zinc-500"

  const statusText =
    phaseVariant === "ended"
      ? "已结束"
      : isInitialized
        ? "进行中"
        : "未开局"

  const themeTextColor =
    phaseVariant === "night"
      ? "text-violet-400"
      : phaseVariant === "ended"
        ? "text-amber-400"
        : phaseVariant === "day"
          ? "text-orange-400"
          : "text-zinc-400"

  const badgeVariantClass =
    phaseVariant === "night"
      ? "border-violet-400/20 bg-violet-400/10 text-violet-300"
      : phaseVariant === "ended"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
        : phaseVariant === "day"
          ? "border-orange-400/20 bg-orange-400/10 text-orange-300"
          : "border-zinc-500/20 bg-zinc-500/10 text-zinc-300"

  const stageTitle =
    phaseVariant === "night"
      ? "夜晚行动"
      : phaseVariant === "ended"
        ? "终局结算"
        : phaseVariant === "day"
          ? `${phaseLabel}讨论`
          : phaseLabel

  return (
    <Card
      className={`relative overflow-hidden border bg-gradient-to-r p-3 px-4 md:px-6 shadow-sm backdrop-blur-md transition-all duration-500 ${bgGradient}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.015),transparent)] opacity-40 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* 左侧：牌局标志与关键文案 */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[10px] tracking-[0.25em] font-bold text-muted-foreground uppercase">
            WEREWOLF STAGE
          </span>
          <span className="hidden sm:inline-block h-3 w-px bg-zinc-800" />
          <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
            {isInitialized ? (
              <>
                <span className={themeTextColor}>
                  第 {currentRound} 轮
                </span>
                <span className="text-zinc-600">·</span>
                <span>{stageTitle}</span>
              </>
            ) : (
              <span className="text-zinc-400">演示台待命</span>
            )}
          </h2>
          {winnerLabel && (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] h-4.5 px-1.5 ml-1 animate-pulse">
              {winnerLabel}
            </Badge>
          )}
        </div>

        {/* 右侧：紧凑状态指标组 */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">阶段:</span>
            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${badgeVariantClass}`}>
              {phaseLabel}
            </span>
          </div>

          <div className="hidden xs:flex items-center gap-1.5">
            <span className="text-muted-foreground">回合:</span>
            <span className="font-medium text-foreground">
              {currentRound > 0 ? `ROUND ${currentRound}` : "—"}
            </span>
          </div>

          <div className="h-3 w-px bg-zinc-800" />

          <div className="flex items-center gap-1.5">
            <span className={`inline-block size-1.5 rounded-full ${stateDotClass}`} />
            <span className="font-medium text-foreground">{statusText}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
