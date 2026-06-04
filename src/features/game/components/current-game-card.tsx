import { Badge } from "../../../components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"

type CurrentGameCardProps = {
  summary: {
    round: number
    phaseLabel: string
    aliveCount: number
    winnerLabel: string
  } | null
  onContinue?: () => Promise<void>
  onRestart: () => Promise<void>
  disabled?: boolean
}

export function CurrentGameCard({
  summary,
  onContinue,
  onRestart,
  disabled = false,
}: CurrentGameCardProps) {
  if (!summary) {
    return (
      <Card className="border-border/60 bg-black/15 backdrop-blur-md">
        <CardHeader>
          <CardTitle>当前暂无进行中对局</CardTitle>
          <CardDescription>
            开始一局新的狼人杀后，这里会显示你可随时返回的观战入口。
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" disabled={disabled} onClick={onRestart}>
            开始游戏
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-amber-400/25 bg-amber-500/10 backdrop-blur-md">
      <CardHeader>
        <CardTitle>有一局正在进行</CardTitle>
        <CardDescription>{`第 ${summary.round} 轮 · ${summary.phaseLabel}`}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{`存活 ${summary.aliveCount}`}</Badge>
          {summary.winnerLabel ? <Badge variant="outline">{summary.winnerLabel}</Badge> : null}
        </div>
        <p className="text-sm text-foreground/80">
          返回正在推进的牌局，继续查看时间线、阶段焦点与玩家态势。
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row">
        {onContinue ? (
          <Button className="w-full sm:flex-1" disabled={disabled} onClick={onContinue}>
            继续当前对局
          </Button>
        ) : null}
        <Button className="w-full sm:flex-1" disabled={disabled} variant="outline" onClick={onRestart}>
          重新开始
        </Button>
      </CardFooter>
    </Card>
  )
}
