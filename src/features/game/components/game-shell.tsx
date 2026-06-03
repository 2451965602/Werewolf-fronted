import React from "react"

interface GameShellProps {
  hero: React.ReactNode
  log: React.ReactNode
  rail: React.ReactNode
  players: React.ReactNode
}

export function GameShell({ hero, log, rail, players }: GameShellProps) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-all duration-300">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        {/* Top Hero Section */}
        <header className="w-full">{hero}</header>

        {/* Main Split Area */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_360px]">
          {/* Right Side Rail on mobile, left rail on desktop remains aside */}
          <aside className="order-1 flex flex-col gap-6 lg:order-2">
            {rail}
          </aside>

          {/* Left Narrative Log - Main Character */}
          <div className="order-2 flex min-w-0 flex-col lg:order-1">{log}</div>
        </section>

        {/* Bottom Player Grid */}
        <section className="mt-2 w-full">{players}</section>
      </main>
    </div>
  )
}
