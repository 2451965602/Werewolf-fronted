import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SpeechLedger } from "./speech-ledger"

describe("SpeechLedger", () => {
  it("renders current-round speech records and latest speaker", () => {
    const html = renderToStaticMarkup(
      <SpeechLedger
        ledger={{
          count: 2,
          latestSpeaker: "王芳",
          items: [
            { id: "1", speaker: "李明", content: "先听大家。", round: 1, phase: "day" },
            { id: "2", speaker: "王芳", content: "我同意继续观察。", round: 1, phase: "day" },
          ],
        }}
      />
    )

    expect(html).toContain("本轮发言账册")
    expect(html).toContain("王芳")
    expect(html).toContain("我同意继续观察。")
  })
})
