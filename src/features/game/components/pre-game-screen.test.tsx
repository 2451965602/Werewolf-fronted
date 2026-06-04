import type { ComponentProps } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("../../../components/ui/button", () => ({
  Button: ({ children, ...props }: ComponentProps<"button">) => (
    <button {...props}>{children}</button>
  ),
}))

import { PreGameScreen } from "./pre-game-screen"

type PreGameScreenProps = Parameters<typeof PreGameScreen>[0]

function renderScreen(
  overrides: Partial<PreGameScreenProps> = {},
) {
  return renderToStaticMarkup(
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
      {...overrides}
    />,
  )
}

describe("PreGameScreen", () => {
  it("renders user-facing stage copy, service guidance and primary actions", () => {
    const html = renderScreen()

    expect(html).toContain("Werewolf Command Stage")
    expect(html).toContain("先确认联机，再点亮第一夜。")
    expect(html).toContain("开始游戏")
    expect(html).toContain("服务正常")
    expect(html).toContain("检查服务状态")
    expect(html).toContain("服务接入面板")
    expect(html).toContain("进入游戏前先完成服务自检")
    expect(html).toContain("沉浸舞台 / 联机驱动")
    expect(html).toContain("确认服务就绪后，直接开始一局新游戏。")
    expect(html).toContain("使用 `开始游戏` 后，会立即创建新对局并同步当前进度。")
  })

  it("disables both actions while advancing the game flow", () => {
    const html = renderScreen({
      requestState: {
        isStarting: false,
        isAdvancing: true,
        isRefreshing: false,
        error: "",
      },
    })

    expect(html.match(/disabled=""/g) ?? []).toHaveLength(2)
  })

  it("renders service status copy and request errors", () => {
    const html = renderScreen({
      serviceHealth: { label: "服务异常", tone: "error" },
      requestState: {
        isStarting: false,
        isAdvancing: false,
        isRefreshing: false,
        error: "暂时无法连接服务，请稍后再试。",
      },
    })

    expect(html).toContain("当前状态")
    expect(html).toContain("服务异常")
    expect(html).toContain("暂时无法连接服务，请稍后再试。")
  })
})
