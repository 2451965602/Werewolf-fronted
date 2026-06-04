import type { ComponentProps } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("../../../components/ui/button", () => ({
  Button: ({ children, ...props }: ComponentProps<"button">) => (
    <button {...props}>{children}</button>
  ),
}))

import { CurrentGameCard } from "./current-game-card"

describe("CurrentGameCard", () => {
  it("renders continue action when active game summary exists", () => {
    const html = renderToStaticMarkup(
      <CurrentGameCard
        summary={{ round: 3, phaseLabel: "白天", aliveCount: 6, winnerLabel: "" }}
        onContinue={vi.fn()}
        onRestart={vi.fn()}
      />,
    )

    expect(html).toContain("有一局正在进行")
    expect(html).toContain("第 3 轮 · 白天")
    expect(html).toContain("继续当前对局")
    expect(html).toContain("重新开始")
  })

  it("renders empty state when no active game summary exists", () => {
    const html = renderToStaticMarkup(
      <CurrentGameCard summary={null} onContinue={vi.fn()} onRestart={vi.fn()} />,
    )

    expect(html).toContain("当前暂无进行中对局")
    expect(html).toContain("开始游戏")
  })
})
