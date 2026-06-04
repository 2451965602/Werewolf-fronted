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

function formatPhaseLabel(phase: TimelineItem["phase"]) {
  return phase === "night" ? "夜晚" : phase === "day" ? "白天" : "已结束"
}

export function NarrativeLog({ items, emptyState }: NarrativeLogProps) {
  const hasItems = items.length > 0
  const latestItem = hasItems ? items[items.length - 1] : null

  return (
    <section className="relative flex h-[560px] flex-col overflow-hidden rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,rgba(24,24,27,0.92),rgba(9,9,11,0.94))] shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-md">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.08),_transparent_40%)]" />
      <div className="relative z-10 border-b border-white/8 px-6 py-5 md:px-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.24em] uppercase text-white/48">
              <span>主舞台</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>实时叙事流</span>
            </div>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
              叙事实录时间线
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/62 md:text-base">
              聚焦当前局势里的发言、裁决与系统播报，让主舞台始终停留在最重要的节奏节点。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[auto_auto] xl:min-w-[360px]">
            <div className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
              <span className="text-[11px] tracking-[0.2em] text-white/45 uppercase">
                记录总数
              </span>
              <div className="mt-2 text-lg font-semibold text-white/92">
                {items.length}
              </div>
            </div>

            <div className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
              <span className="text-[11px] tracking-[0.2em] text-white/45 uppercase">
                最新焦点
              </span>
              <div className="mt-2 text-sm font-medium text-white/84">
                {latestItem
                  ? `${latestItem.speaker} · R${latestItem.round} ${formatPhaseLabel(latestItem.phase)}`
                  : "等待首条记录"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-hidden px-4 pb-4 pt-4 md:px-6 md:pb-6">
        {hasItems ? (
          <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-white/8 bg-black/18">
            {latestItem ? (
              <div className="border-b border-white/8 px-5 py-4 md:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-white/45">
                      <span>当前镜头</span>
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                      <span>{latestItem.speaker}</span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/82 md:text-base">
                      {latestItem.content}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-white/62">
                    R{latestItem.round} · {formatPhaseLabel(latestItem.phase)}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1 overflow-y-auto px-5 py-5 md:px-6">
              <div className="relative ml-2.5 space-y-5 border-l border-white/10 py-2 pl-5 md:pl-6">
                {items.map((item) => {
                  const tone = toneMap[item.tone]

                  return (
                    <div key={item.id} className="group relative">
                      <div
                        className={`absolute top-1.5 -left-[31px] size-2.5 rounded-full transition-all duration-300 group-hover:scale-125 md:-left-[35px] ${tone.indicator}`}
                      />

                      <article
                        className={`rounded-2xl border p-4 transition-all duration-300 md:p-5 ${tone.border} ${tone.background} shadow-[0_12px_36px_rgba(0,0,0,0.12)]`}
                      >
                        <header className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${tone.badge}`}
                            >
                              {item.speaker}
                            </span>
                            <span className={tone.labelClass}>{tone.label}</span>
                          </div>
                          <div className="rounded-md bg-black/20 px-2 py-0.5 font-mono text-muted-foreground">
                            R{item.round} · {formatPhaseLabel(item.phase)}
                          </div>
                        </header>
                        <p className="font-sans text-sm leading-7 font-normal whitespace-pre-wrap text-foreground/90">
                          {item.content}
                        </p>
                      </article>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-black/18 p-8 text-center">
            <div className="mb-3 text-4xl opacity-60">🕯️</div>
            <h3 className="text-base font-semibold tracking-tight text-foreground/85">
              {emptyState.title}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {emptyState.description}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
