import React from "react"

interface GameShellProps {
  banner: React.ReactNode
  mainLog: React.ReactNode
  sideRail: React.ReactNode
  situation: React.ReactNode
}

export function GameShell({
  banner,
  mainLog,
  sideRail,
  situation,
}: GameShellProps) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-all duration-300 lg:h-screen lg:overflow-hidden">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-6 lg:grid lg:h-full lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)_minmax(180px,260px)] lg:px-6 lg:py-4 xl:max-w-[1800px] 2xl:max-w-[1840px]">
        {/* 顶部：状态条 */}
        <header aria-label="banner" className="min-w-0 w-full">
          {banner}
        </header>

        {/* 中部：主副双列布局 */}
        <section className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* 左侧：主舞台（时间线 + 发言记录） */}
          <div
            aria-label="main log"
            className="flex min-h-0 min-w-0 flex-col"
          >
            {mainLog}
          </div>

          {/* 右侧：圆桌席位指示器 */}
          <aside
            aria-label="side rail"
            className="min-h-0 min-w-0 overflow-hidden"
          >
            {sideRail}
          </aside>
        </section>

        {/* 底部：详细席位网格（次级视图） */}
        <section
          aria-label="situation"
          className="min-h-0 w-full overflow-hidden lg:overflow-auto"
        >
          {situation}
        </section>
      </main>
    </div>
  )
}
