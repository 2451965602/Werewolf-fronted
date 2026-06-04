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
    <div className="min-h-screen w-full bg-background text-foreground transition-all duration-300 pb-12">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 lg:px-8">
        {/* 顶部：状态条 */}
        <header aria-label="banner" className="w-full">
          {banner}
        </header>

        {/* 中部：主副双列布局 */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* 左侧：主舞台（时间线 + 发言记录） */}
          <div
            aria-label="main log"
            className="flex min-w-0 flex-col gap-6"
          >
            {mainLog}
          </div>

          {/* 右侧：圆桌席位指示器 */}
          <aside
            aria-label="side rail"
            className="flex flex-col gap-6"
          >
            {sideRail}
          </aside>
        </section>

        {/* 底部：详细席位网格（次级视图） */}
        <section aria-label="situation" className="w-full mt-2">
          {situation}
        </section>
      </main>
    </div>
  )
}
