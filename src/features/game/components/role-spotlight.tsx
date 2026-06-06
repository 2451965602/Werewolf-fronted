export interface RoleSpotlightContent {
  title: string
  highlight: string
  supporting: string
}

interface RoleSpotlightProps {
  spotlight: RoleSpotlightContent
}

export function RoleSpotlight({ spotlight }: RoleSpotlightProps) {
  return (
    <section className="night-focus-card min-h-0 shrink-0 rounded-[20px] border border-border/50 bg-card/35 p-4 backdrop-blur-md xl:h-full xl:overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/30 pb-3">
        <span className="text-lg">🎯</span>
        <h3 className="font-heading text-sm font-semibold tracking-wide">
          {spotlight.title}
        </h3>
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-lg font-semibold leading-snug text-foreground">
          {spotlight.highlight}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {spotlight.supporting}
        </p>
      </div>
    </section>
  )
}
