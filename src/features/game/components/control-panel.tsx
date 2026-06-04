import { Button } from "@/components/ui/button"

interface ControlPanelProps {
  requestState: {
    isStarting: boolean
    isAdvancing: boolean
    isRefreshing: boolean
  }
  isInitialized: boolean
  onRefresh: () => Promise<void>
  onStart: () => Promise<void | boolean>
  onAdvance: () => Promise<void>
}

export function ControlPanel({
  requestState: { isStarting, isAdvancing, isRefreshing },
  isInitialized,
  onRefresh,
  onStart,
  onAdvance,
}: ControlPanelProps) {
  const isBusy = isStarting || isAdvancing || isRefreshing

  return (
    <section className="rounded-[28px] border border-border/50 bg-[linear-gradient(180deg,rgba(8,13,25,0.92)_0%,rgba(8,11,20,0.82)_100%)] p-5 backdrop-blur-md">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground/75">
              <span
                className={`size-2 rounded-full ${isBusy ? "bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.55)]" : "bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.45)]"}`}
              />
              导演席控制
            </div>
          <div>
            <h3 className="font-heading text-base font-semibold tracking-[0.16em] text-foreground">
              导演控制台
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              手动推进局势、轮转昼夜，并在每次动作后同步服务端状态。
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            流程状态
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {isInitialized ? "已接管牌局" : "等待首次发牌"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-[24px] border border-white/10 bg-black/25 p-3">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
            <span>主流程</span>
            <span>{isInitialized ? "推进回合" : "初始化牌局"}</span>
          </div>

          {!isInitialized ? (
            <Button
              onClick={onStart}
              disabled={isStarting || isRefreshing}
              className="h-14 w-full rounded-2xl border-none bg-[linear-gradient(90deg,#5b21b6_0%,#3730a3_55%,#1d4ed8_100%)] px-4 font-medium text-white shadow-[0_16px_36px_rgba(37,99,235,0.25)] transition-all hover:brightness-110 active:translate-y-px"
            >
              {isStarting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  正在召唤古堡...
                </span>
              ) : (
                <span className="flex w-full items-center justify-between gap-3 text-left">
                  <span>
                    <span className="block text-sm font-semibold tracking-[0.14em]">
                      开始游戏
                    </span>
                    <span className="mt-1 block text-[11px] text-white/75">
                      创建首轮状态并发放全部身份
                    </span>
                  </span>
                  <span className="text-lg">🎴</span>
                </span>
              )}
            </Button>
          ) : (
            <Button
              onClick={onAdvance}
              disabled={isAdvancing || isRefreshing}
              className="h-14 w-full rounded-2xl border-none bg-[linear-gradient(90deg,#7f1d1d_0%,#be123c_55%,#ea580c_100%)] px-4 font-medium text-white shadow-[0_16px_36px_rgba(190,24,93,0.22)] transition-all hover:brightness-110 active:translate-y-px"
            >
              {isAdvancing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  正在轮转日月...
                </span>
              ) : (
                <span className="flex w-full items-center justify-between gap-3 text-left">
                  <span>
                    <span className="block text-sm font-semibold tracking-[0.14em]">
                      下一阶段
                    </span>
                    <span className="mt-1 block text-[11px] text-white/75">
                      推进夜晚结算、白天发言与后续轮次
                    </span>
                  </span>
                  <span className="text-lg">⏳</span>
                </span>
              )}
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_152px]">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isStarting || isAdvancing || isRefreshing}
            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-foreground/85 transition-all hover:bg-white/[0.08] hover:text-foreground"
          >
            {isRefreshing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-3 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                正在感知古堡...
              </span>
            ) : (
              <span className="flex w-full items-center justify-between gap-3 text-left">
                <span>
                  <span className="block text-sm font-semibold">刷新状态</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    拉取最新局势快照
                  </span>
                </span>
                <span className="text-base">↻</span>
              </span>
            )}
          </Button>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              通道
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {isBusy ? "执行中" : "待命"}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              所有视图都以服务端返回为准。
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground/80">
        本地不维护私有状态机；每次操作后都建议刷新一次，避免导演台与真实牌局脱节。
      </p>
    </section>
  )
}
