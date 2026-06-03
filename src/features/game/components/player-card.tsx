import type { ApiPlayer } from "../types"

interface PlayerCardProps {
  player: ApiPlayer
}

export function PlayerCard({ player }: PlayerCardProps) {
  const { id, name, role, alive, team } = player

  // Mapping Role and Team localized names
  const localizedRole = mapRoleLabel(role)
  const localizedTeam = team === "wolf" ? "狼人阵营" : "好人阵营"

  // Theme cards by state
  const isWolf = team === "wolf"
  const deadClass = !alive
    ? "opacity-60 bg-zinc-950/45 border-zinc-800/40 text-muted-foreground line-through grayscale"
    : isWolf
      ? "bg-gradient-to-b from-purple-950/15 via-black/25 to-black/35 border-purple-900/30 text-purple-200"
      : "bg-gradient-to-b from-amber-950/10 via-black/25 to-black/35 border-amber-900/20 text-amber-100/90"

  const roleBadgeClass = !alive
    ? "bg-zinc-800 text-zinc-500 border-zinc-700/30"
    : isWolf
      ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
      : role === "villager"
        ? "bg-slate-500/10 text-slate-300 border-slate-500/20"
        : "bg-amber-500/10 text-amber-300 border-amber-500/20"

  return (
    <article
      className={`relative flex flex-col items-center justify-between rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.03] ${deadClass} min-h-[140px]`}
    >
      {/* Player ID Number Badge */}
      <span
        className={`absolute top-2.5 left-2.5 flex size-5 items-center justify-center rounded-lg border font-mono text-[10px] font-bold ${
          !alive
            ? "border-zinc-800 bg-zinc-900 text-zinc-500"
            : "border-white/5 bg-black/45 text-foreground/75"
        }`}
      >
        {id}
      </span>

      {/* Life/Death Corner Indicator */}
      <span
        className={`absolute top-2.5 right-2.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${
          alive
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            : "border-rose-500/20 bg-rose-500/10 text-rose-400"
        }`}
      >
        {alive ? "存活" : "出局"}
      </span>

      {/* Player Identity Icon & Localized Name */}
      <div className="mt-4 mb-2 flex w-full flex-col items-center text-center">
        <span className="max-w-full truncate text-sm font-semibold tracking-wide">
          {name}
        </span>
        <span className="mt-0.5 text-[10px] opacity-60">{localizedTeam}</span>
      </div>

      {/* Player Identity Role Code */}
      <div
        className={`w-full rounded-xl border px-2 py-1 text-center text-[11px] font-bold ${roleBadgeClass}`}
      >
        {localizedRole}
      </div>
    </article>
  )
}

function mapRoleLabel(role: string): string {
  switch (role) {
    case "werewolf":
      return "🐺 狼人"
    case "villager":
      return "🌾 村民"
    case "seer":
      return "👁️ 预言家"
    case "witch":
      return "🧪 女巫"
    case "hunter":
      return "🏹 猎人"
    default:
      return role
  }
}
