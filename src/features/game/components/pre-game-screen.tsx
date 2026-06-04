import { Button } from "../../../components/ui/button"

type PreGameScreenProps = {
  heroIntro: {
    title: string
    description: string
    primaryActionLabel: string
  }
  serviceHealth: {
    label: string
    tone: "ok" | "warning" | "error"
  }
  requestState: {
    isStarting: boolean
    isAdvancing: boolean
    isRefreshing: boolean
    error: string
  }
  onStart: () => Promise<void>
  onRefresh: () => Promise<void>
}

const toneStyles = {
  ok: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  warning: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  error: "border-rose-400/30 bg-rose-500/10 text-rose-100",
} as const

export function PreGameScreen({
  heroIntro,
  serviceHealth,
  requestState,
  onStart,
  onRefresh,
}: PreGameScreenProps) {
  return (
    <main className="min-h-screen px-4 py-6 text-foreground md:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl gap-6 overflow-hidden rounded-[32px] border border-border/50 bg-card/45 p-6 shadow-[0_32px_120px_rgba(4,8,18,0.55)] backdrop-blur-xl lg:grid-cols-[minmax(0,1.55fr)_360px] lg:p-10">
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.14),transparent_22%),linear-gradient(180deg,rgba(10,18,34,0.94),rgba(8,14,24,0.99))] p-8 lg:p-10">
          <div className="absolute inset-y-10 right-8 hidden w-px bg-gradient-to-b from-transparent via-white/12 to-transparent lg:block" />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:gap-8">
            <div className="space-y-8">
              <div className="space-y-5">
                <span className="inline-flex w-fit items-center rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-sky-100/80">
                  沉浸舞台 / 联机驱动
                </span>

                <div className="space-y-4">
                  <h1 className="max-w-3xl font-heading text-5xl leading-none tracking-tight md:text-7xl">
                    {heroIntro.title}
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                    {heroIntro.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={onStart}
                  disabled={
                    requestState.isStarting ||
                    requestState.isAdvancing ||
                    requestState.isRefreshing
                  }
                  className="h-12 rounded-2xl border-none bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-6 font-semibold text-slate-950 shadow-lg shadow-orange-950/20 hover:from-amber-300 hover:to-rose-300"
                >
                  {requestState.isStarting ? "正在召集村民..." : heroIntro.primaryActionLabel}
                </Button>
                <Button
                  variant="outline"
                  onClick={onRefresh}
                  disabled={
                    requestState.isStarting ||
                    requestState.isAdvancing ||
                    requestState.isRefreshing
                  }
                  className="h-12 rounded-2xl border-border/70 bg-black/20 px-5 text-foreground/85 hover:bg-black/35"
                >
                  {requestState.isRefreshing ? "检查中..." : "检查服务状态"}
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-100/60">
                    启动方式
                  </p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    确认服务就绪后，直接开始一局新游戏。
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-100/60">
                    演示重点
                  </p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    优先保持开局顺畅，再逐步展开舞台氛围和信息节奏。
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-100/60">
                    状态切换
                  </p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    开局成功后，页面会自动切换到控制台视图。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-black/20 p-5 lg:min-h-full">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.26em] text-sky-100/60">
                  开场流程
                </p>
                <h2 className="font-heading text-3xl leading-tight text-foreground">
                  先确认联机，再点亮第一夜。
                </h2>
              </div>

              <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-100/60">
                    01 检查服务
                  </p>
                  <p className="mt-2">先检查服务状态，避免开局后才发现服务未就绪。</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-100/60">
                    02 发起开局
                  </p>
                  <p className="mt-2">点击 `开始游戏` 后，会立即进入本局开场并加载当前阶段所需信息。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4 rounded-[28px] border border-border/40 bg-black/15 p-6 backdrop-blur-md">
          <div className="space-y-3 border-b border-border/30 pb-5">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              服务接入面板
            </p>
            <h2 className="font-heading text-2xl">进入游戏前先完成服务自检</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              先点一次 `检查服务状态`，确认服务可用后，再点击 `开始游戏` 进入第一夜。
            </p>
          </div>

          <div className={`rounded-2xl border px-4 py-4 ${toneStyles[serviceHealth.tone]}`}>
            <p className="text-xs uppercase tracking-[0.24em] opacity-70">当前状态</p>
            <p className="mt-2 text-lg font-semibold">{serviceHealth.label}</p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-border/40 bg-card/55 p-4 text-sm leading-7 text-muted-foreground">
              使用 `开始游戏` 后，会立即创建新对局并同步当前进度。
            </div>
            <div className="rounded-2xl border border-border/40 bg-card/45 p-4 text-sm leading-7 text-muted-foreground">
              如果状态仍未恢复正常，请优先处理服务异常，再继续进入演示流程。
            </div>
          </div>

          {requestState.error ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm leading-7 text-rose-100">
              {requestState.error}
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  )
}
