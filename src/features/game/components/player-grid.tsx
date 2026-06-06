import type { ApiPlayer } from "../types"
import { PlayerCard } from "./player-card"

interface PlayerGridProps {
  players: ApiPlayer[]
}

export function PlayerGrid({ players }: PlayerGridProps) {
  const hasPlayers = players && players.length > 0
  const aliveCount = players.filter((player) => player.alive).length
  const deadCount = players.length - aliveCount
  const wolfCount = players.filter((player) => player.team === "wolf").length

  return (
    <section className="guest-seat-card flex min-h-0 flex-col rounded-[20px] border border-border/50 bg-card/30 p-4 backdrop-blur-md xl:h-full">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">
            <span className="text-base">👥</span>
            席位总览
          </div>
          <h2 className="mt-2 font-heading text-base font-semibold tracking-[0.16em] text-foreground">
            古堡宾客席
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            先看席位号，再扫存活状态，最后确认阵营与身份。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground">
            {hasPlayers ? `${players.length} 席` : "虚位以待"}
          </span>
          <span className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
            存活 {aliveCount}
          </span>
          <span className="rounded-full border border-rose-500/15 bg-rose-500/10 px-3 py-1 text-xs text-rose-300">
            出局 {deadCount}
          </span>
          <span className="rounded-full border border-violet-500/15 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
            狼人总数 {wolfCount}
          </span>
        </div>
      </div>

      {hasPlayers ? (
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex min-h-0 flex-1 flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-black/15 py-10 text-center text-muted-foreground">
          <span className="mb-2 text-3xl opacity-50">🕯️</span>
          <p className="text-sm">
            等待牌局启动后，这里会按席位展开所有玩家的身份总览。
          </p>
        </div>
      )}
    </section>
  )
}
