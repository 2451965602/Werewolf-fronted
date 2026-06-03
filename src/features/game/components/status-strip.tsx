interface StatusStripProps {
  error: string
  isInitialized: boolean
}

export function StatusStrip({ error, isInitialized }: StatusStripProps) {
  if (!error && isInitialized) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* API / Network Error Alert */}
      {error && (
        <article className="animate-fade-in flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
          <span className="text-sm">⚠️</span>
          <div className="space-y-1">
            <h4 className="font-bold">系统同步异常</h4>
            <p className="leading-relaxed opacity-90">{error}</p>
          </div>
        </article>
      )}

      {/* Uninitialized/Empty State Notice */}
      {!isInitialized && !error && (
        <article className="flex animate-pulse items-start gap-3 rounded-2xl border border-violet-500/15 bg-violet-500/5 p-4 text-xs text-violet-300">
          <span className="text-sm">🏰</span>
          <div className="space-y-1">
            <h4 className="font-bold">月暮微光已现</h4>
            <p className="leading-relaxed opacity-80">
              古堡空无一人，请在指令台点击“开始游戏”进行首次发牌与夜幕召唤。
            </p>
          </div>
        </article>
      )}
    </div>
  )
}
