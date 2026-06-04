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
    <section className="rounded-[24px] border border-border/50 bg-card/35 p-5 backdrop-blur-md">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
            局势快照
          </p>
          <h3 className="mt-1 font-heading text-sm font-semibold tracking-[0.16em] text-foreground">
            局势摘要
          </h3>
        </div>

        <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-200">
          {phaseLabel}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
                当前轮次
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {currentRound > 0 ? `第 ${currentRound} 轮` : "未开始"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
                胜负状态
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {winnerLabel || "进行中"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
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

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <span className="text-[11px] text-muted-foreground">存活</span>
            <span className="mt-2 block text-xl font-bold text-emerald-400">
              {aliveCount}
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <span className="text-[11px] text-muted-foreground">出局</span>
            <span className="mt-2 block text-xl font-bold text-rose-400">
              {deadCount}
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <span className="text-[11px] text-muted-foreground">存活狼人</span>
            <span className="mt-2 block text-xl font-bold text-violet-300">
              {wolfCountAlive}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
            阶段
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-200">
            {phaseLabel}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
            暗线威胁
          </p>
          <p className="mt-1 text-sm font-semibold text-violet-300">
            {wolfCountAlive > 0 ? `仍有 ${wolfCountAlive} 匹` : "狼人已清空"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
            总体态势
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {currentRound > 0 ? `第 ${currentRound} 轮` : "未开始"}
          </p>
        </div>
      </div>
    </section>
  )
}
