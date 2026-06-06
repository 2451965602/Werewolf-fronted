import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { GameSummary } from "./game-summary"

describe("GameSummary", () => {
  it("renders a compact side-rail summary with stable metric labels", () => {
    const html = renderToStaticMarkup(
      <GameSummary
        summary={{
          currentRound: 3,
          phaseLabel: "夜晚",
          winnerLabel: "",
          aliveCount: 6,
          deadCount: 2,
          wolfCountAlive: 2,
          lastNightKilled: 5,
          lastNightKilledPlayer: "王芳",
        }}
      />,
    )

    expect(html).toContain("compact-game-summary")
    expect(html).toContain("局势摘要")
    expect(html).toContain("第 3 轮")
    expect(html).toContain("夜晚")
    expect(html).toContain("5 号 王芳 出局")
    expect(html).toContain("存活")
    expect(html).toContain("出局")
    expect(html).toContain("存活狼人")
    expect(html).toContain("grid-cols-3")
  })
})
