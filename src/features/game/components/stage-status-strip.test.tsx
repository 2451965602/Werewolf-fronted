import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { StageStatusStrip } from "./stage-status-strip"

describe("StageStatusStrip", () => {
  it("renders phase-specific stage titles", () => {
    const dayHtml = renderToStaticMarkup(
      <StageStatusStrip
        isInitialized
        currentRound={2}
        phaseLabel="白天"
        phaseVariant="day"
        winnerLabel=""
      />,
    )

    const nightHtml = renderToStaticMarkup(
      <StageStatusStrip
        isInitialized
        currentRound={2}
        phaseLabel="夜晚"
        phaseVariant="night"
        winnerLabel=""
      />,
    )

    const endedHtml = renderToStaticMarkup(
      <StageStatusStrip
        isInitialized
        currentRound={2}
        phaseLabel="已结束"
        phaseVariant="ended"
        winnerLabel="村民阵营获胜"
      />,
    )

    expect(dayHtml).toContain("白天讨论")
    expect(nightHtml).toContain("夜晚行动")
    expect(nightHtml).not.toContain("夜晚讨论")
    expect(endedHtml).toContain("终局结算")
    expect(endedHtml).not.toContain("已结束讨论")
  })
})
