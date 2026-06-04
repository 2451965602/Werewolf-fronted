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
    <div className="min-h-screen w-full bg-background text-foreground transition-all duration-300">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <header aria-label="banner" className="w-full">
          {banner}
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_360px]">
          <div
            aria-label="main log"
            className="order-2 flex min-w-0 flex-col lg:order-1"
          >
            {mainLog}
          </div>

          <aside
            aria-label="side rail"
            className="order-1 flex flex-col gap-6 lg:order-2"
          >
            {sideRail}
          </aside>
        </section>

        <section aria-label="situation" className="mt-2 w-full">
          {situation}
        </section>
      </main>
    </div>
  )
}
