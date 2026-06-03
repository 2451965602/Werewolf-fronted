interface PhaseHeroProps {
  isInitialized: boolean
  currentRound: number
  phaseLabel: string
  phaseVariant: "idle" | "day" | "night" | "ended"
  winnerLabel: string
}

export function PhaseHero({
  isInitialized,
  currentRound,
  phaseLabel,
  phaseVariant,
  winnerLabel,
}: PhaseHeroProps) {
  // Goth style styling classes
  const heroBg = isInitialized
    ? phaseVariant === "night"
      ? "bg-gradient-to-r from-purple-950/40 via-violet-950/30 to-slate-900/40 border-violet-800/20"
      : phaseVariant === "ended"
        ? "bg-gradient-to-r from-amber-950/40 via-red-950/30 to-slate-900/40 border-amber-800/20"
        : "bg-gradient-to-r from-amber-950/20 via-orange-950/10 to-slate-900/40 border-orange-800/20"
    : "bg-gradient-to-r from-zinc-950/40 via-slate-900/30 to-zinc-900/40 border-zinc-800/20"

  const statusPulse =
    isInitialized && phaseVariant === "night"
      ? "animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.15)]"
      : isInitialized && phaseVariant === "day"
        ? "shadow-[0_0_15px_rgba(249,115,22,0.1)]"
        : ""

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border p-6 transition-all duration-500 md:p-8 ${heroBg} ${statusPulse}`}
    >
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider text-primary uppercase opacity-80">
            Werewolf Spectator Console
          </span>
          <h1 className="mt-1 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text font-heading text-2xl font-bold tracking-tight text-transparent md:text-3xl">
            狼人杀 观战演示台
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-xs text-muted-foreground">当前回合</span>
            <span className="mt-0.5 text-sm font-semibold text-foreground/90">
              {currentRound > 0 ? `第 ${currentRound} 轮` : "未开始"}
            </span>
          </div>

          <div className="mx-1 hidden h-8 w-[1px] bg-border/40 md:block" />

          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">当前局势</span>
            <div className="mt-0.5 flex items-center gap-2">
              <span
                className={`inline-block size-2 rounded-full ${isInitialized ? "animate-pulse bg-emerald-500" : "bg-zinc-500"}`}
              />
              <span className="text-sm font-medium">
                {phaseVariant === "ended"
                  ? "已结束"
                  : isInitialized
                    ? "进行中"
                    : "未开局"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-black/30 px-4 py-2 backdrop-blur-md">
            <span className="text-xs text-muted-foreground">阶段</span>
            <span
              className={`text-sm font-bold tracking-wide ${
                phaseLabel === "夜晚"
                  ? "text-purple-400"
                  : phaseLabel === "已结束"
                    ? "text-amber-400"
                    : "text-amber-200"
              }`}
            >
              {phaseLabel}
            </span>
          </div>
        </div>
      </div>

      {winnerLabel && (
        <div className="animate-fade-in relative z-10 mt-4 flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-medium text-amber-300">
          <span className="text-lg">👑</span>
          <div>
            <span className="font-bold">{winnerLabel}</span> —
            游戏圆满落幕，感谢观战！
          </div>
        </div>
      )}
    </div>
  )
}
