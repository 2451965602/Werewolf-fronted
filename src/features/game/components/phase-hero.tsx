import type { HeroBannerContent } from "../types"

interface PhaseHeroProps {
  isInitialized: boolean
  currentRound: number
  phaseLabel: string
  phaseVariant: "idle" | "day" | "night" | "ended"
  winnerLabel: string
  heroBanner?: HeroBannerContent
}

export function PhaseHero({
  isInitialized,
  currentRound,
  phaseLabel,
  phaseVariant,
  winnerLabel,
  heroBanner,
}: PhaseHeroProps) {
  const heroBg = isInitialized
    ? phaseVariant === "night"
      ? "border-violet-700/30 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.28),_transparent_38%),linear-gradient(135deg,rgba(24,24,27,0.96),rgba(49,46,129,0.82),rgba(15,23,42,0.98))]"
      : phaseVariant === "ended"
        ? "border-amber-700/30 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.24),_transparent_36%),linear-gradient(135deg,rgba(41,37,36,0.98),rgba(120,53,15,0.78),rgba(15,23,42,0.98))]"
        : "border-orange-700/30 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.2),_transparent_36%),linear-gradient(135deg,rgba(39,39,42,0.98),rgba(120,53,15,0.72),rgba(15,23,42,0.98))]"
    : "border-zinc-700/30 bg-[radial-gradient(circle_at_top_left,_rgba(161,161,170,0.16),_transparent_34%),linear-gradient(135deg,rgba(24,24,27,0.98),rgba(39,39,42,0.92),rgba(15,23,42,0.98))]"

  const statusPulse =
    isInitialized && phaseVariant === "night"
      ? "shadow-[0_24px_80px_rgba(76,29,149,0.35)]"
    : isInitialized && phaseVariant === "day"
        ? "shadow-[0_24px_80px_rgba(194,65,12,0.28)]"
        : "shadow-[0_24px_80px_rgba(120,53,15,0.24)]"

  const bannerCopy =
    heroBanner ?? {
      kicker: currentRound > 0 ? `第 ${currentRound} 轮 · ${phaseLabel}` : "牌局待命",
      title:
        phaseVariant === "night"
          ? "夜幕降临，主舞台切入夜间回合"
          : phaseVariant === "ended"
            ? winnerLabel || "牌局已结束，等待最终结算"
            : isInitialized
              ? "白天讨论开始，留意每一次发言"
              : "牌局待命，等待主持人开局",
      description:
        phaseVariant === "ended"
          ? winnerLabel || "本局对抗已经结束，等待结果同步。"
          : isInitialized
            ? "顶部横幅会持续聚焦当前阶段与主叙事，让观战视线先落在最重要的局势变化上。"
            : "服务已连接，点击开始后将在这里进入正式观战节奏。",
    }

  const phaseTextClass =
    phaseVariant === "night"
      ? "text-violet-200"
      : phaseVariant === "ended"
        ? "text-amber-200"
        : phaseVariant === "day"
          ? "text-orange-100"
          : "text-zinc-200"

  const phaseBadgeClass =
    phaseVariant === "night"
      ? "border-violet-400/20 bg-violet-400/10 text-violet-100"
      : phaseVariant === "ended"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
        : phaseVariant === "day"
          ? "border-orange-300/20 bg-orange-300/10 text-orange-50"
          : "border-zinc-400/20 bg-zinc-400/10 text-zinc-100"

  const stateLabel =
    phaseVariant === "ended"
      ? "已结束"
      : isInitialized
        ? "进行中"
        : "未开局"

  const stateDotClass =
    phaseVariant === "ended"
      ? "bg-amber-400"
      : isInitialized
        ? "animate-pulse bg-emerald-400"
        : "bg-zinc-500"

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border px-6 py-7 transition-all duration-500 md:px-8 md:py-9 ${heroBg} ${statusPulse}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.04),transparent)] opacity-60" />
      <div className="absolute -top-16 right-0 h-40 w-40 rounded-full bg-white/6 blur-3xl" />
      <div className="absolute bottom-0 left-10 h-24 w-24 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.28em] uppercase">
              <span className="text-white/65">狼人杀观战台</span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className={phaseTextClass}>{bannerCopy.kicker}</span>
            </div>
            <h1 className="mt-4 max-w-3xl font-heading text-3xl font-semibold tracking-tight text-white md:text-4xl xl:text-[2.8rem] xl:leading-[1.08]">
              {bannerCopy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
              {bannerCopy.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px] xl:max-w-[460px] xl:flex-1">
            <div className="rounded-[20px] border border-white/10 bg-black/18 p-4 backdrop-blur-md">
              <span className="text-[11px] tracking-[0.2em] text-white/45 uppercase">
                当前阶段
              </span>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${phaseBadgeClass}`}
                >
                  {phaseLabel}
                </span>
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/18 p-4 backdrop-blur-md">
              <span className="text-[11px] tracking-[0.2em] text-white/45 uppercase">
                当前回合
              </span>
              <div className="mt-3 text-lg font-semibold text-white/92">
                {currentRound > 0 ? `第 ${currentRound} 轮` : "未开始"}
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/18 p-4 backdrop-blur-md">
              <span className="text-[11px] tracking-[0.2em] text-white/45 uppercase">
                牌局状态
              </span>
              <div className="mt-3 flex items-center gap-2 text-sm text-white/86">
                <span className={`inline-block size-2 rounded-full ${stateDotClass}`} />
                <span className="font-medium">{stateLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {winnerLabel ? (
          <div className="relative overflow-hidden rounded-[22px] border border-amber-400/20 bg-amber-500/12 px-5 py-4 text-sm text-amber-50 backdrop-blur-md">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="text-[11px] tracking-[0.22em] text-amber-100/70 uppercase">
                  终局播报
                </span>
                <p className="mt-2 text-base font-semibold">{winnerLabel}</p>
              </div>
              <p className="max-w-xl text-sm leading-6 text-amber-50/78">
                游戏圆满落幕，主舞台已切换到结算视图。
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
