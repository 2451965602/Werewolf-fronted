import type { ApiPlayer } from "../types"
import { PlayerCard } from "./player-card"

interface PlayerGridProps {
  players: ApiPlayer[]
}

export function PlayerGrid({ players }: PlayerGridProps) {
  const hasPlayers = players && players.length > 0

  return (
    <section className="rounded-[28px] border border-border/50 bg-card/30 p-6 backdrop-blur-md">
      {/* Grid Header */}
      <div className="mb-6 flex items-center justify-between border-b border-border/30 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">👥</span>
          <h2 className="font-heading text-base font-semibold tracking-wide">
            古堡宾客席 (玩家状态总览)
          </h2>
        </div>
        <span className="rounded-full border border-white/5 bg-black/25 px-2.5 py-1 text-xs text-muted-foreground">
          {hasPlayers ? `${players.length} 席` : "虚位以待"}
        </span>
      </div>

      {/* Grid Cards Container */}
      {hasPlayers ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <span className="mb-2 text-3xl opacity-50">🕯️</span>
          <p className="text-sm">
            等待游戏启动后，古堡宾客席将显示每位玩家的席位与真实身份...
          </p>
        </div>
      )}
    </section>
  )
}
