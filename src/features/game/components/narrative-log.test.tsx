import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { NarrativeLog } from "./narrative-log"

describe("NarrativeLog", () => {
  it("renders latest focus and vote labels in the timeline", () => {
    const html = renderToStaticMarkup(
      <NarrativeLog
        items={[
          {
            id: "1",
            tone: "player",
            speaker: "1号玩家",
            content: "我先发言。",
            round: 1,
            phase: "day",
          },
          {
            id: "2",
            tone: "vote",
            speaker: "系统",
            content: "1号投给3号。",
            round: 1,
            phase: "day",
          },
          {
            id: "3",
            tone: "narrator",
            speaker: "旁白",
            content: "夜幕降临，请闭眼。",
            round: 1,
            phase: "night",
          },
        ]}
        emptyState={{ title: "暂无记录", description: "等待开局" }}
      />,
    )

    expect(html).toContain("当前镜头")
    expect(html).toContain("投票")
    expect(html).toContain("旁白")
    expect(html).toContain("1号投给3号。")
  })
})
