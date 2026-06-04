interface StatusStripProps {
  error: string
  isInitialized: boolean
}

export function StatusStrip({ error, isInitialized }: StatusStripProps) {
  if (!error && isInitialized) {
    return null
  }

  return (
    <div className="space-y-2">
      {error && (
        <article className="animate-fade-in rounded-2xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-xs text-destructive backdrop-blur-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-sm">
                ⚠
              </span>
              <div>
                <h4 className="font-semibold tracking-[0.14em] text-destructive/90 uppercase">
                  系统同步异常
                </h4>
                <p className="mt-1 leading-relaxed opacity-90">{error}</p>
              </div>
            </div>

            <span className="rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-destructive/80">
              异常通道
            </span>
          </div>
        </article>
      )}

      {!isInitialized && !error && (
        <article className="rounded-2xl border border-dashed border-violet-400/20 bg-violet-500/[0.04] px-4 py-3 text-xs text-violet-200/90">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-sm">
                🏰
              </span>
              <div>
                <h4 className="font-semibold tracking-[0.14em] uppercase text-violet-100">
                  待开局
                </h4>
                <p className="mt-1 leading-relaxed opacity-80">
                  古堡仍在候场，请在导演台点击“开始游戏”完成首次发牌。
                </p>
              </div>
            </div>

            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-violet-200/80">
              等待开局
            </span>
          </div>
        </article>
      )}
    </div>
  )
}
