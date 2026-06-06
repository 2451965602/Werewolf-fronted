import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { PlayerGrid } from "./player-grid"

describe("PlayerGrid", () => {
  it("renders guest seats inside a locally scrollable situation card", () => {
    const html = renderToStaticMarkup(
      <PlayerGrid
        players={[
          {
            id: 1,
            name: "李明",
            role: "villager",
            alive: true,
            team: "village",
          },
          {
            id: 2,
            name: "王芳",
            role: "werewolf",
            alive: false,
            team: "wolf",
          },
        ]}
      />,
    )

    expect(html).toContain("guest-seat-card")
    expect(html).toContain("overflow-y-auto")
    expect(html).toContain("古堡宾客席")
    expect(html).toContain("李明")
    expect(html).toContain("王芳")
  })
})
