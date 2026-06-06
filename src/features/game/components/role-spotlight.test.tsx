import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { RoleSpotlight } from "./role-spotlight"

describe("RoleSpotlight", () => {
  it("renders as a stable night-focus card inside the situation region", () => {
    const html = renderToStaticMarkup(
      <RoleSpotlight
        spotlight={{
          title: "夜间焦点",
          highlight: "昨夜 5 号倒在古堡门前。",
          supporting: "天亮后请优先核对投票和发言变化。",
        }}
      />,
    )

    expect(html).toContain("night-focus-card")
    expect(html).toContain("xl:h-full")
    expect(html).toContain("xl:overflow-hidden")
    expect(html).toContain("夜间焦点")
  })
})
