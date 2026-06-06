import type { GameViewModel } from "../types"

interface GameSummaryProps {
  summary: GameViewModel["summary"]
}

export function GameSummary({ summary }: GameSummaryProps) {
  const {
    aliveCount,
    currentRound,
    deadCount,
    lastNightKilled,
    lastNightKilledPlayer,
    phaseLabel,
    winnerLabel,
    wolfCountAlive,
  } = summary

  return (
    <section className="compact-game-summary shrink-0 rounded-[20px] border border-border/50 bg-card/35 p-4 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground/70 uppercase">
            局势快照
          </p>
          <h3 className="mt-1 font-heading text-sm font-semibold tracking-[0.12em] text-foreground">
            局势摘要
          </h3>
        </div>

        <div className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200">
          {phaseLabel}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.18em] text-muted-foreground/70 uppercase">
              当前轮次
            </p>
            <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
              {currentRound > 0 ? `第 ${currentRound} 轮` : "未开始"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] tracking-[0.18em] text-muted-foreground/70 uppercase">
              胜负
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {winnerLabel || "进行中"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
          <span className="text-muted-foreground">昨夜事件</span>
          <span className="text-right font-semibold text-foreground">
            {lastNightKilled !== null && lastNightKilled > 0 ? (
              <span className="text-rose-300">
                {lastNightKilled} 号 {lastNightKilledPlayer ?? "未知玩家"} 出局
              </span>
            ) : (
              <span className="text-emerald-300">平安夜</span>
            )}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-2.5">
          <span className="text-[11px] text-muted-foreground">存活</span>
          <span className="mt-1 block text-lg font-bold text-emerald-400">
            {aliveCount}
          </span>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-2.5">
          <span className="text-[11px] text-muted-foreground">出局</span>
          <span className="mt-1 block text-lg font-bold text-rose-400">
            {deadCount}
          </span>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-2.5">
          <span className="text-[11px] text-muted-foreground">存活狼人</span>
          <span className="mt-1 block text-lg font-bold text-violet-300">
            {wolfCountAlive}
          </span>
        </div>
      </div>
    </section>
  )
}
