import type { ComponentProps } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { GameShell } from "./game-shell"

describe("GameShell", () => {
  it("renders bounded desktop regions with one situation overflow owner", () => {
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
    expect(html).toContain("lg:overflow-hidden")
    expect(html).toContain("lg:grid")
    expect(html).toContain("lg:grid-rows-[auto_minmax(0,1fr)_clamp(160px,24vh,230px)]")
    expect(html).toContain("lg:grid-cols-[minmax(0,1fr)_340px]")
    expect(html).toContain("xl:grid-cols-[minmax(0,1fr)_360px]")
    expect(html).toContain("lg:overflow-hidden")
    expect(html).toContain("lg:overflow-y-auto")
    expect(html).toContain("Banner Content")
    expect(html).toContain("Main Log Content")
    expect(html).toContain("Side Rail Content")
    expect(html).toContain("Situation Content")
  })
})
