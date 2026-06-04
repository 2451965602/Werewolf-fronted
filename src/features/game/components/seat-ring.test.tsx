import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SeatRing } from "./seat-ring"

describe("SeatRing", () => {
  it("renders dead seats in a weakened style", () => {
    const html = renderToStaticMarkup(
      <SeatRing
        items={[
          { seat: 1, name: "李明", role: "werewolf", alive: true, team: "wolf" },
          { seat: 2, name: "王芳", role: "villager", alive: false, team: "village" }
        ]}
      />
    )

    expect(html).toContain("1")
    expect(html).toContain("狼人")
    expect(html).toContain("2")
    expect(html).toContain("村民")
    // 应该包含置灰或弱化的样式，例如 opacity- 或 text-muted-foreground 或 grayscale 等
    expect(html).toContain("opacity-")
  })

  it("renders the children stage path and keeps seat markers around it", () => {
    const html = renderToStaticMarkup(
      <SeatRing
        items={[
          { seat: 1, name: "李明", role: "seer", alive: true, team: "village" },
          { seat: 2, name: "王芳", role: "villager", alive: false, team: "village" },
        ]}
      >
        <div>Central Narrative Stage</div>
      </SeatRing>,
    )

    expect(html).toContain("Central Narrative Stage")
    expect(html).toContain("left:")
    expect(html).toContain("top:")
    expect(html).toContain("1号 · 预言家 · 存活")
    expect(html).not.toContain("李明")
  })

  it("renders a clear empty state when there are no seats", () => {
    const html = renderToStaticMarkup(
      <SeatRing items={[]}>
        <div>Central Narrative Stage</div>
      </SeatRing>,
    )

    expect(html).toContain("暂无席位数据")
    expect(html).toContain("0 存活 / 0 总数")
  })
})
