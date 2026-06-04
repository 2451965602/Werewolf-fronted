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
    <div className="min-h-screen w-full overflow-hidden bg-background text-foreground transition-all duration-300">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 overflow-hidden px-4 py-5 md:px-6 lg:h-screen lg:max-h-screen lg:px-8">
        <header aria-label="banner" className="w-full">
          {banner}
        </header>

        <section className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1.65fr)_340px]">
          <div
            aria-label="main log"
            className="order-2 flex min-h-0 min-w-0 flex-col lg:order-1"
          >
            {mainLog}
          </div>

          <aside
            aria-label="side rail"
            className="order-1 flex min-h-0 flex-col gap-4 overflow-y-auto pr-1 lg:order-2"
          >
            {sideRail}
          </aside>
        </section>

        <section aria-label="situation" className="min-h-0 w-full overflow-y-auto pr-1">
          {situation}
        </section>
      </main>
    </div>
  )
}
