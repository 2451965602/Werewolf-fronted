import { Button } from "@/components/ui/button"

interface ControlPanelProps {
  requestState: {
    isStarting: boolean
    isAdvancing: boolean
    isRefreshing: boolean
    error: string
  }
  isInitialized: boolean
  onRefresh: () => Promise<void>
  onStart: () => Promise<void>
  onAdvance: () => Promise<void>
}

export function ControlPanel({
  requestState,
  isInitialized,
  onRefresh,
  onStart,
  onAdvance,
}: ControlPanelProps) {
  const { isStarting, isAdvancing, isRefreshing } = requestState

  return (
    <section className="rounded-[24px] border border-border/50 bg-card/40 p-6 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2 border-b border-border/30 pb-3">
        <span className="text-lg">⚙️</span>
        <h3 className="font-heading text-sm font-semibold tracking-wide">
          观战指令台
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {/* Core Manual Progression Actions */}
        {!isInitialized ? (
          <Button
            onClick={onStart}
            disabled={isStarting || isRefreshing}
            className="h-11 w-full rounded-xl border-none bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 font-medium text-white shadow-lg shadow-indigo-950/20 transition-all hover:from-purple-600 hover:to-indigo-700 active:translate-y-px"
          >
            {isStarting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                正在召唤古堡...
              </span>
            ) : (
              "🎴 开始游戏"
            )}
          </Button>
        ) : (
          <Button
            onClick={onAdvance}
            disabled={isAdvancing || isRefreshing}
            className="h-11 w-full rounded-xl border-none bg-gradient-to-r from-rose-700 to-red-800 font-medium text-white shadow-lg shadow-rose-950/20 transition-all hover:from-rose-600 hover:to-red-700 active:translate-y-px"
          >
            {isAdvancing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                正在轮转日月...
              </span>
            ) : (
              "⏳ 下一阶段"
            )}
          </Button>
        )}

        {/* Sync / Refresh State Action */}
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isStarting || isAdvancing || isRefreshing}
          className="h-10 w-full rounded-xl border-border/60 bg-black/15 text-foreground/80 transition-all hover:bg-black/35 hover:text-foreground"
        >
          {isRefreshing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="size-3 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
              正在感知古堡...
            </span>
          ) : (
            "🔄 刷新状态"
          )}
        </Button>
      </div>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground italic opacity-85">
        * 演示台不保存前端私有状态机，一切状态通过拉取服务端实时更新。
      </p>
    </section>
  )
}
