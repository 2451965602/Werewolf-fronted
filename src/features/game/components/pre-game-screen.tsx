import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import { Separator } from "../../../components/ui/separator"
import { CurrentGameCard } from "./current-game-card"

type PreGameScreenProps = {
  heroIntro: {
    title: string
    description: string
    primaryActionLabel: string
  }
  serviceHealth: {
    label: string
    tone: "ok" | "warning" | "error"
  }
  requestState: {
    isStarting: boolean
    isAdvancing: boolean
    isRefreshing: boolean
    error: string
  }
  currentGameSummary?: {
    round: number
    phaseLabel: string
    aliveCount: number
    winnerLabel: string
  } | null
  onContinue?: () => Promise<void>
  onStart: () => Promise<void>
  onRefresh: () => Promise<void>
}

const toneStyles = {
  ok: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  warning: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  error: "border-rose-400/30 bg-rose-500/10 text-rose-100",
} as const

export function PreGameScreen({
  heroIntro,
  serviceHealth,
  requestState,
  currentGameSummary,
  onContinue,
  onStart,
  onRefresh,
}: PreGameScreenProps) {
  const isBusy =
    requestState.isStarting ||
    requestState.isAdvancing ||
    requestState.isRefreshing

  return (
    <main className="min-h-screen px-4 py-6 text-foreground md:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.45fr)_380px]">
        <Card className="border-border/60 bg-[linear-gradient(180deg,rgba(10,18,34,0.95),rgba(8,14,24,0.98))] shadow-[0_32px_120px_rgba(4,8,18,0.55)]">
          <CardHeader className="gap-4">
            <Badge variant="outline">沉浸式观战大厅</Badge>
            <div className="space-y-3">
              <CardTitle className="text-4xl tracking-tight md:text-6xl">
                {heroIntro.title}
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7 md:text-lg">
                {heroIntro.description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={onStart}
                disabled={isBusy}
                className="h-12 rounded-2xl px-6 font-semibold"
              >
                {requestState.isStarting ? "正在召集村民..." : heroIntro.primaryActionLabel}
              </Button>
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={isBusy}
                className="h-12 rounded-2xl"
              >
                {requestState.isRefreshing ? "检查中..." : "检查服务状态"}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card size="sm" className="bg-white/5 ring-white/10">
                <CardHeader>
                  <CardTitle>进入方式</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  确认服务可用后，直接开始新一局，或从右侧卡片返回仍在推进中的牌局。
                </CardContent>
              </Card>
              <Card size="sm" className="bg-white/5 ring-white/10">
                <CardHeader>
                  <CardTitle>观战重点</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  先确认当前阶段，再沿着时间线追踪发言、投票和系统播报的变化。
                </CardContent>
              </Card>
              <Card size="sm" className="bg-white/5 ring-white/10">
                <CardHeader>
                  <CardTitle>进入控制台</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  进入对局后，会切换到时间线主舞台、阶段焦点和玩家态势控制台。
                </CardContent>
              </Card>
            </div>

            <Separator />

            <p className="text-sm leading-7 text-muted-foreground">
              如果已有牌局，你可以从右侧卡片继续返回观战控制台。
            </p>
          </CardContent>
        </Card>

        <aside className="flex flex-col gap-4">
          <CurrentGameCard
            summary={currentGameSummary ?? null}
            onContinue={onContinue}
            onRestart={onStart}
            disabled={isBusy}
          />

          <Card className="border-border/60 bg-black/15 backdrop-blur-md">
            <CardHeader>
              <CardTitle>服务状态</CardTitle>
              <CardDescription>
                先做服务自检，再决定继续当前牌局还是重新开始。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className={`rounded-2xl border px-4 py-4 ${toneStyles[serviceHealth.tone]}`}>
                <p className="text-xs uppercase tracking-[0.24em] opacity-70">当前状态</p>
                <p className="mt-2 text-lg font-semibold">{serviceHealth.label}</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 text-sm leading-7 text-muted-foreground">
                使用开始游戏后，会立即创建新对局并同步进度；若已有对局，可优先从上方卡片继续进入。
              </div>

              {requestState.error ? (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm leading-7 text-rose-100">
                  {requestState.error}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  )
}
