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
    <section className="rounded-[24px] border border-border/50 bg-card/40 p-6 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2 border-b border-border/30 pb-3">
        <span className="text-lg">📊</span>
        <h3 className="font-heading text-sm font-semibold tracking-wide">
          局势数据摘要
        </h3>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-black/20 p-3">
          <span className="text-xs text-muted-foreground">当前回合</span>
          <span className="mt-1 text-xl font-bold text-foreground">
            {currentRound > 0 ? `第 ${currentRound} 轮` : "未开始"}
          </span>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-black/20 p-3">
          <span className="text-xs text-muted-foreground">当前阶段</span>
          <span className="mt-1 text-xl font-bold text-amber-300">
            {phaseLabel}
          </span>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-black/20 p-3">
          <span className="text-xs text-muted-foreground">存活人数</span>
          <span className="mt-1 text-xl font-bold text-emerald-400">
            {aliveCount}{" "}
            <span className="text-[10px] font-normal text-muted-foreground">
              人
            </span>
          </span>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-black/20 p-3">
          <span className="text-xs text-muted-foreground">出局人数</span>
          <span className="mt-1 text-xl font-bold text-rose-400">
            {deadCount}{" "}
            <span className="text-[10px] font-normal text-muted-foreground">
              人
            </span>
          </span>
        </div>

        <div className="col-span-2 flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-3">
          <span className="text-xs text-muted-foreground">存活狼人 (暗)</span>
          <span className="text-lg font-bold text-purple-400">
            {wolfCountAlive > 0 ? `🐺 ${wolfCountAlive} 匹` : "已全部消灭 ☠️"}
          </span>
        </div>

        <div className="col-span-2 flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-3">
          <span className="text-xs text-muted-foreground">当前胜负状态</span>
          <span className="text-sm font-semibold text-foreground">
            {winnerLabel || "进行中"}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs leading-relaxed text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>昨夜遇害:</span>
          <span className="font-semibold text-foreground">
            {lastNightKilled !== null && lastNightKilled > 0 ? (
              <span className="font-bold text-rose-400">
                🎯 {lastNightKilled} 号 {lastNightKilledPlayer ?? "未知玩家"}
              </span>
            ) : (
              <span className="text-emerald-400">🕊️ 平安夜</span>
            )}
          </span>
        </div>
      </div>
    </section>
  )
}
