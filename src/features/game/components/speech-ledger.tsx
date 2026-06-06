import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { ScrollArea } from "../../../components/ui/scroll-area"
import type { SpeechLedger as SpeechLedgerType } from "../types"

interface SpeechLedgerProps {
  ledger: SpeechLedgerType
}

export function SpeechLedger({ ledger }: SpeechLedgerProps) {
  const hasItems = ledger.items && ledger.items.length > 0
  const title = ledger.isFallback ? "最近发言账册" : "本轮发言账册"
  const description = ledger.latestSpeaker
    ? ledger.isFallback && ledger.sourceRound != null
      ? `展示第 ${ledger.sourceRound} 轮最近发言 · 最新发言: ${ledger.latestSpeaker}`
      : `最新发言: ${ledger.latestSpeaker}`
    : "等待本轮首位玩家发言..."

  return (
    <Card className="flex flex-col h-[320px] lg:h-[480px] bg-zinc-950/20 backdrop-blur-md border-zinc-800/60 shadow-lg overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-900/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-violet-400 animate-pulse" />
            {title}
          </CardTitle>
          <Badge variant="outline" className="bg-violet-950/20 text-violet-300 border-violet-500/20 text-[10px] h-4.5 px-1.5 font-bold">
            {ledger.count} 条记录
          </Badge>
        </div>
        <CardDescription className="text-xs text-zinc-400 mt-1 truncate">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 p-0 min-h-0">
        {hasItems ? (
          <ScrollArea className="h-full w-full">
            <div className="p-4 space-y-3.5 pr-5">
              {ledger.items.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col gap-1.5 rounded-xl border border-zinc-800/40 bg-zinc-900/10 p-3 hover:bg-zinc-900/20 hover:border-zinc-800/80 transition-all duration-300"
                >
                  {/* 发言人及徽标栏 */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                      <span className="inline-block size-1.5 rounded-full bg-zinc-600 group-hover:bg-violet-400 transition-colors" />
                      {item.speaker}
                    </span>
                    <div className="flex items-center gap-1.5 scale-90 origin-right">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        R{item.round}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1 h-4 leading-none font-medium ${
                          item.phase === "day"
                            ? "bg-orange-500/5 text-orange-400 border-orange-500/10"
                            : item.phase === "night"
                              ? "bg-violet-500/5 text-violet-400 border-violet-500/10"
                              : "bg-zinc-500/5 text-zinc-400 border-zinc-500/10"
                        }`}
                      >
                        {item.phase === "day" ? "白天" : item.phase === "night" ? "夜晚" : "结算"}
                      </Badge>
                    </div>
                  </div>

                  {/* 发言正文 */}
                  <p className="text-xs leading-5 text-zinc-300 whitespace-pre-wrap break-all pl-3 border-l-2 border-zinc-800/60 group-hover:border-violet-500/30 transition-colors">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="size-8 rounded-full bg-zinc-900/40 border border-zinc-800/40 flex items-center justify-center text-zinc-600 mb-2">
              💭
            </div>
            <p className="text-xs text-zinc-500">本回合暂无玩家发言</p>
            <p className="text-[10px] text-zinc-600 mt-1">如果上一轮已有发言，系统会自动回退展示最近一轮发言记录</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
