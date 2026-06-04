import type { ComponentProps } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { GameShell } from "./game-shell"

describe("GameShell", () => {
  it("renders banner, main log, side rail and situation sections", () => {
    const props: ComponentProps<typeof GameShell> = {
      banner: <div>Banner Content</div>,
      mainLog: <div>Main Log Content</div>,
      sideRail: <div>Side Rail Content</div>,
      situation: <div>Situation Content</div>,
    }

    const html = renderToStaticMarkup(
      <GameShell {...props} />
    )

    expect(html).toContain('aria-label="banner"')
    expect(html).toContain('aria-label="main log"')
    expect(html).toContain('aria-label="side rail"')
    expect(html).toContain('aria-label="situation"')
    expect(html).toContain("lg:h-screen")
    expect(html).toContain("Banner Content")
    expect(html).toContain("Main Log Content")
    expect(html).toContain("Side Rail Content")
    expect(html).toContain("Situation Content")
  })
})
