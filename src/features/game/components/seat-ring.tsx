import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import type { SeatRingItem } from "../types"

interface SeatRingProps {
  items: SeatRingItem[]
  children?: React.ReactNode
}

export function SeatRing({ items, children }: SeatRingProps) {
  const total = items.length
  const geometryTotal = Math.max(items.length, 1)
  const aliveCount = items.filter((item) => item.alive).length
  const hasItems = items.length > 0

  if (!children) {
    return (
      <Card className="w-full bg-zinc-950/20 backdrop-blur-md border-zinc-800/60 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              圆桌席位态势
            </CardTitle>
            <Badge variant="outline" className="text-[10px] px-1.5 h-4.5 text-zinc-400 border-zinc-800 bg-zinc-900/30">
              {aliveCount} 存活 / {total} 总数
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center py-6">
          {!hasItems ? (
            <div className="flex min-h-44 w-full items-center justify-center rounded-[22px] border border-dashed border-zinc-800/60 bg-zinc-950/10 px-6 text-center text-sm text-zinc-500">
              暂无席位数据
            </div>
          ) : null}

          {/* 圆桌容器 */}
          <div
            className={`relative aspect-square w-full max-w-[240px] xs:max-w-[280px] rounded-full border border-dashed border-zinc-800/40 bg-zinc-950/10 flex items-center justify-center ${
              hasItems ? "" : "hidden"
            }`}
          >
            
            {/* 中央圆桌内核装饰 */}
            <div className="absolute size-20 xs:size-24 rounded-full border border-zinc-800 bg-[radial-gradient(circle_at_center,_rgba(39,39,42,0.6),_transparent)] flex flex-col items-center justify-center text-center p-1 pointer-events-none z-0">
              <span className="text-[9px] font-bold tracking-[0.15em] text-zinc-500 uppercase">ROUND TABLE</span>
              <span className="text-[8px] text-zinc-600 mt-0.5">WEREWOLF</span>
            </div>

            {/* 绝对定位玩家环绕席位节点 */}
            {items.map((player, index) => {
              const angleDeg = (index / geometryTotal) * 360 - 90
              const angleRad = (angleDeg * Math.PI) / 180
              
              const radius = 38
              const left = 50 + radius * Math.cos(angleRad)
              const top = 50 + radius * Math.sin(angleRad)

              const containerClass = player.alive
                ? player.team === "wolf"
                  ? "border-red-500/50 bg-red-950/20 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.15)] hover:scale-105"
                  : "border-blue-500/40 bg-blue-950/10 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:scale-105"
                : "opacity-35 grayscale border-dashed border-zinc-800 bg-zinc-900/10 text-zinc-500 scale-95"

              const roleLabel = mapRoleLabel(player.role)

              return (
                <div
                  key={player.seat}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-300"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                  }}
                >
                  {/* 席位圆圈 */}
                  <div
                    className={`size-10 xs:size-11 rounded-full border flex flex-col items-center justify-center font-heading text-xs font-bold transition-all duration-300 ${containerClass}`}
                    title={`${player.seat}号 · ${roleLabel} · ${player.alive ? "存活" : "死亡"}`}
                  >
                    <span className="text-sm font-bold leading-none">{player.seat}</span>
                  </div>

                  {/* 角色与状态挂饰 */}
                  <span className={`mt-1 text-[8px] font-medium tracking-tight px-1 py-0.2 rounded border scale-90 ${
                    player.alive
                      ? player.team === "wolf"
                        ? "bg-red-950/60 text-red-400 border-red-500/20"
                        : "bg-zinc-900/80 text-zinc-400 border-zinc-800"
                      : "bg-zinc-950/40 text-zinc-600 border-transparent"
                  }`}>
                    {roleLabel}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 渲染带有中央舞台 (Children) 的环绕式布局
  return (
    <div className="relative w-full flex flex-col items-center lg:h-[760px]">
      {/* 1. 移动端/小屏幕下的紧凑席位顶栏 (lg以下可见) */}
      <div className="w-full lg:hidden mb-4 bg-zinc-950/20 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">圆桌席位</span>
          <span className="text-[10px] text-zinc-500">
            {aliveCount} 存活 / {total} 总数
          </span>
        </div>
        {!hasItems ? (
          <div className="rounded-2xl border border-dashed border-zinc-800/60 bg-zinc-950/10 px-4 py-6 text-center text-sm text-zinc-500">
            暂无席位数据
          </div>
        ) : null}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 px-1 scrollbar-none">
          {items.map((player) => {
            const containerClass = player.alive
              ? player.team === "wolf"
                ? "border-red-500/50 bg-red-950/20 text-red-100"
                : "border-blue-500/40 bg-blue-950/10 text-blue-100"
              : "opacity-35 grayscale border-dashed border-zinc-800 bg-zinc-900/10 text-zinc-500"

            const roleLabel = mapRoleLabel(player.role)

            return (
              <div key={player.seat} className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`size-9 rounded-full border flex items-center justify-center font-heading text-xs font-bold transition-all ${containerClass}`}
                  title={`${player.seat}号 · ${roleLabel} · ${player.alive ? "存活" : "死亡"}`}
                >
                  {player.seat}
                </div>
                <span className={`mt-1 text-[8px] px-1 rounded scale-90 ${
                  player.alive
                    ? player.team === "wolf"
                      ? "bg-red-950/60 text-red-400 border border-red-500/20"
                      : "bg-zinc-900/80 text-zinc-400 border border-zinc-800"
                    : "bg-zinc-950/40 text-zinc-600"
                }`}>
                  {roleLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. 桌面端大屏幕下 (lg及以上) 的椭圆围绕舞台 */}
      <div className="relative flex w-full items-center justify-center lg:h-full lg:px-28 lg:py-24">
        
        {/* 中间的主舞台叙事日志 */}
        <div className="relative z-10 w-full lg:h-full lg:max-w-[620px]">
          {children}
        </div>

        {!hasItems ? (
          <div className="absolute inset-x-8 top-6 hidden rounded-2xl border border-dashed border-zinc-800/60 bg-zinc-950/40 px-4 py-3 text-center text-sm text-zinc-500 lg:block">
            暂无席位数据
          </div>
        ) : null}

        {/* 仅在 lg 级别以上绝对定位环绕 */}
        <div className={`absolute inset-0 hidden pointer-events-none lg:block ${hasItems ? "" : "hidden"}`}>
          {items.map((player, index) => {
            const angleDeg = (index / geometryTotal) * 360 - 90
            const angleRad = (angleDeg * Math.PI) / 180
            
            // 横向半径 a = 43%，纵向半径 b = 38%
            const rx = 43
            const ry = 38
            const left = 50 + rx * Math.cos(angleRad)
            const top = 50 + ry * Math.sin(angleRad)

            const containerClass = player.alive
              ? player.team === "wolf"
                ? "border-red-500/50 bg-red-950/20 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.15)] hover:scale-105"
                : "border-blue-500/40 bg-blue-950/10 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:scale-105"
              : "opacity-35 grayscale border-dashed border-zinc-800 bg-zinc-900/10 text-zinc-500 scale-95"

            const roleLabel = mapRoleLabel(player.role)

            return (
              <div
                key={player.seat}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto transition-all duration-300"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                }}
              >
                {/* 席位圆圈 */}
                <div
                  className={`size-11 rounded-full border flex items-center justify-center font-heading text-sm font-extrabold transition-all duration-300 ${containerClass}`}
                  title={`${player.seat}号 · ${roleLabel} · ${player.alive ? "存活" : "死亡"}`}
                >
                  <span className="leading-none">{player.seat}</span>
                </div>

                {/* 角色与状态挂饰 */}
                <span className={`mt-1.5 text-[8px] font-semibold tracking-tight px-1.5 py-0.2 rounded border scale-95 ${
                  player.alive
                    ? player.team === "wolf"
                      ? "bg-red-950/60 text-red-400 border-red-500/20"
                      : "bg-zinc-900/80 text-zinc-400 border-zinc-800"
                    : "bg-zinc-950/40 text-zinc-600 border-transparent"
                }`}>
                  {roleLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function mapRoleLabel(role: SeatRingItem["role"]): string {
  switch (role) {
    case "werewolf":
      return "狼人"
    case "seer":
      return "预言家"
    case "witch":
      return "女巫"
    case "hunter":
      return "猎人"
    case "villager":
    default:
      return "村民"
  }
}
