import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("../../../components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

import { PreGameScreen } from "./pre-game-screen"

describe("PreGameScreen", () => {
  it("renders hero copy, primary action and service status", () => {
    const html = renderToStaticMarkup(
      <PreGameScreen
        heroIntro={{
          title: "Werewolf Command Stage",
          description: "连接服务后可直接开始一局新的狼人杀演示。",
          primaryActionLabel: "开始游戏",
        }}
        serviceHealth={{ label: "服务正常", tone: "ok" }}
        requestState={{
          isStarting: false,
          isAdvancing: false,
          isRefreshing: false,
          error: "",
        }}
        onStart={vi.fn()}
        onRefresh={vi.fn()}
      />
    )

    expect(html).toContain("Werewolf Command Stage")
    expect(html).toContain("开始游戏")
    expect(html).toContain("服务正常")
    expect(html).toContain("检查服务状态")
  })
})
