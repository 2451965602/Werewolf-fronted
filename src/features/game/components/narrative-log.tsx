import type { TimelineItem } from "../types"

interface NarrativeLogProps {
  items: TimelineItem[]
  emptyState: {
    title: string
    description: string
  }
}

const toneMap = {
  player: {
    badge: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    border: "border-amber-500/15",
    background: "bg-amber-500/5 hover:bg-amber-500/10",
    indicator: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    label: "发言",
    labelClass: "text-amber-500/80 font-medium",
  },
  vote: {
    badge: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    border: "border-rose-500/15",
    background: "bg-rose-500/5 hover:bg-rose-500/10",
    indicator: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
    label: "宣判",
    labelClass: "text-rose-500/80 font-semibold",
  },
  system: {
    badge: "text-purple-300 bg-purple-500/10 border-purple-500/20",
    border: "border-purple-500/15",
    background: "bg-purple-500/5 hover:bg-purple-500/10",
    indicator: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]",
    label: "指引",
    labelClass: "text-purple-400/80 font-medium",
  },
} as const

export function NarrativeLog({ items, emptyState }: NarrativeLogProps) {
  const hasItems = items.length > 0

  return (
    <section className="relative flex h-[520px] flex-col overflow-hidden rounded-[24px] border border-border/60 bg-card/45 backdrop-blur-md">
      {/* Narrative Header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-black/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <h2 className="font-heading text-base font-semibold tracking-wide">
            叙事日志时间线
          </h2>
        </div>
        <span className="rounded-full border border-white/5 bg-black/25 px-2.5 py-1 text-xs text-muted-foreground">
          {items.length} 条记录
        </span>
      </div>

      {/* Narrative Main Content (Scrollable Container) */}
      <div className="flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-4 overflow-y-auto p-4 md:p-6">
        {hasItems ? (
          <div className="relative ml-2.5 space-y-5 border-l border-primary/20 py-2 pl-5 md:pl-6">
            {items.map((item) => {
              const tone = toneMap[item.tone]

              return (
                <div key={item.id} className="group relative">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute top-1.5 -left-[31px] size-2.5 rounded-full transition-all duration-300 group-hover:scale-125 md:-left-[35px] ${tone.indicator}`}
                  />

                  {/* Narrative Card */}
                  <article
                    className={`rounded-xl border p-4 transition-all duration-300 ${tone.border} ${tone.background} shadow-sm`}
                  >
                    <header className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${tone.badge}`}
                        >
                          {item.speaker}
                        </span>
                        <span className={tone.labelClass}>{tone.label}</span>
                      </div>
                      <div className="rounded-md bg-black/20 px-2 py-0.5 font-mono text-muted-foreground">
                        R{item.round} ·{" "}
                        {item.phase === "night"
                          ? "夜晚"
                          : item.phase === "day"
                            ? "白天"
                            : "已结束"}
                      </div>
                    </header>
                    <p className="font-sans text-sm leading-relaxed font-normal whitespace-pre-wrap text-foreground/90">
                      {item.content}
                    </p>
                  </article>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mx-auto my-auto flex h-full min-h-[360px] max-w-sm flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 animate-bounce text-4xl opacity-60">🕯️</div>
            <h3 className="text-base font-semibold tracking-tight text-foreground/85">
              {emptyState.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {emptyState.description}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
