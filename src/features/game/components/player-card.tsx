import type { ApiPlayer } from "../types"

interface PlayerCardProps {
  player: ApiPlayer
}

export function PlayerCard({ player }: PlayerCardProps) {
  const { id, name, role, alive, team } = player

  const localizedRole = mapRoleLabel(role)
  const localizedTeam = team === "wolf" ? "狼人阵营" : "好人阵营"
  const isWolf = team === "wolf"
  const cardClass = !alive
    ? "border-zinc-800/70 bg-[linear-gradient(180deg,rgba(39,39,42,0.42)_0%,rgba(10,10,10,0.78)_100%)] text-zinc-300/80 grayscale"
    : isWolf
      ? "border-violet-500/25 bg-[linear-gradient(180deg,rgba(88,28,135,0.26)_0%,rgba(16,16,24,0.9)_100%)] text-violet-100 shadow-[0_14px_36px_rgba(88,28,135,0.18)]"
      : "border-amber-500/20 bg-[linear-gradient(180deg,rgba(120,53,15,0.18)_0%,rgba(17,17,17,0.88)_100%)] text-amber-50 shadow-[0_14px_36px_rgba(120,53,15,0.14)]"

  const accentClass = !alive
    ? "from-zinc-400/40 via-zinc-300/10 to-transparent"
    : isWolf
      ? "from-violet-300/80 via-fuchsia-400/25 to-transparent"
      : "from-amber-200/80 via-amber-300/20 to-transparent"

  const statusBadgeClass = alive
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
    : "border-rose-500/20 bg-rose-500/10 text-rose-300"

  const teamBadgeClass = !alive
    ? "border-zinc-700/60 bg-zinc-900/60 text-zinc-400"
    : isWolf
      ? "border-violet-500/20 bg-violet-500/10 text-violet-200"
      : "border-amber-500/20 bg-amber-500/10 text-amber-200"

  const roleBadgeClass = !alive
    ? "border-zinc-700/60 bg-zinc-900/60 text-zinc-300"
    : isWolf
      ? "border-violet-500/20 bg-violet-500/10 text-violet-100"
      : role === "villager"
        ? "border-slate-500/20 bg-slate-500/10 text-slate-100"
        : "border-amber-500/20 bg-amber-500/10 text-amber-100"

  return (
    <article
      className={`relative flex min-h-[172px] flex-col overflow-hidden rounded-[24px] border p-3.5 transition-all duration-300 hover:-translate-y-1 ${cardClass}`}
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accentClass}`} />

      <div className="flex items-start justify-between gap-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            Seat
          </div>
          <div className="mt-1 font-mono text-xl font-bold leading-none text-foreground">
            {id}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`rounded-full border px-2 py-1 text-[10px] font-semibold tracking-[0.12em] ${statusBadgeClass}`}
          >
            {alive ? "存活" : "出局"}
          </span>
          <span
            className={`rounded-full border px-2 py-1 text-[10px] font-medium ${teamBadgeClass}`}
          >
            {isWolf ? "狼队" : "村队"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            <span
              className={`size-1.5 rounded-full ${alive ? "bg-emerald-400" : "bg-rose-400"}`}
            />
            {alive ? "Active" : "Eliminated"}
          </div>

          <h3
            className={`mt-2 line-clamp-2 text-base font-semibold tracking-[0.04em] ${alive ? "text-foreground" : "text-zinc-300"}`}
          >
            {name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{localizedTeam}</p>
        </div>

        <div
          className={`mt-4 rounded-2xl border px-3 py-2.5 text-left ${roleBadgeClass}`}
        >
          <div className="text-[10px] uppercase tracking-[0.22em] opacity-70">
            身份
          </div>
          <div className="mt-1 text-sm font-bold tracking-[0.04em]">
            {localizedRole}
          </div>
        </div>
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
