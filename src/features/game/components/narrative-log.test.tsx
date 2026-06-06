import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { NarrativeLog } from "./narrative-log"

describe("NarrativeLog", () => {
  it("renders latest focus and vote labels in the timeline", () => {
    const html = renderToStaticMarkup(
      <NarrativeLog
        items={[
          {
            id: "3",
            tone: "narrator",
            speaker: "旁白",
            content: "夜幕降临，请闭眼。",
            round: 1,
            phase: "night",
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
            id: "1",
            tone: "player",
            speaker: "1号玩家",
            content: "我先发言。",
            round: 1,
            phase: "day",
          },
        ]}
        emptyState={{ title: "暂无记录", description: "等待开局" }}
      />,
    )

    expect(html).toContain("当前镜头")
    expect(html).toContain("投票")
    expect(html).toContain("旁白")
    expect(html).toContain("1号投给3号。")
    expect(html.indexOf("夜幕降临，请闭眼。")).toBeLessThan(
      html.indexOf("我先发言。"),
    )
    expect(html.indexOf("夜幕降临，请闭眼。")).toBeLessThan(
      html.indexOf("1号投给3号。"),
    )
  })

  it("keeps the current focus visible before the historical list scrolls", () => {
    const html = renderToStaticMarkup(
      <NarrativeLog
        items={[
          {
            id: "latest",
            tone: "player",
            speaker: "3号玩家",
            content: "我现在重点怀疑 5 号。",
            round: 2,
            phase: "day",
          },
        ]}
        emptyState={{ title: "暂无记录", description: "等待开局" }}
      />,
    )

    expect(html).toContain("当前镜头")
    expect(html).toContain("我现在重点怀疑 5 号。")
    expect(html).toContain("lg:min-h-0")
    expect(html).toContain("lg:p-4")
    expect(html).toContain("timeline-history-scroll")
    expect(html.indexOf("当前镜头")).toBeLessThan(
      html.indexOf("timeline-history-scroll"),
    )
  })
})
