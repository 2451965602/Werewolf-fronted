import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  advancePhase,
  fetchGameState,
  fetchHealth,
  fetchMessages,
  RequestError,
  startGame,
} from "./api"

describe("game api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  it("maps 404 state response to uninitialized result", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "game state is not initialized" }), {
        status: 404,
      })
    )

    await expect(fetchGameState()).resolves.toEqual({ kind: "uninitialized" })
  })

  it("parses ready state responses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          round: 1,
          phase: "day",
          ended: false,
          winner: "",
          players: [],
          inspections: [],
          witchHealUsed: false,
          witchPoisonUsed: false,
        }),
        { status: 200 }
      )
    )

    await expect(fetchGameState()).resolves.toEqual({
      kind: "ready",
      state: {
        round: 1,
        phase: "day",
        ended: false,
        winner: "",
        players: [],
        inspections: [],
        witchHealUsed: false,
        witchPoisonUsed: false,
      },
    })
  })

  it("posts to start endpoint and returns parsed state", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          round: 1,
          phase: "day",
          ended: false,
          winner: "",
          players: [],
          inspections: [],
          witchHealUsed: false,
          witchPoisonUsed: false,
        }),
        { status: 200 }
      )
    )

    const state = await startGame()

    expect(fetch).toHaveBeenCalledWith(
      "/api/game/start",
      expect.objectContaining({ method: "POST" })
    )
    expect(state.round).toBe(1)
    expect(state.phase).toBe("day")
  })

  it("returns parsed messages from the messages endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            speakerId: 0,
            speaker: "系统",
            content: "进入第1夜",
            phase: "night",
            round: 1,
            type: "system",
          },
        ]),
        { status: 200 }
      )
    )

    await expect(fetchMessages()).resolves.toEqual([
      {
        speakerId: 0,
        speaker: "系统",
        content: "进入第1夜",
        phase: "night",
        round: 1,
        type: "system",
      },
    ])
  })

  it("throws request errors for message failures", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

    await expect(fetchMessages()).rejects.toEqual(
      new RequestError("messages request failed: 500", 500)
    )
  })

  it("posts to next endpoint when advancing phase", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          round: 2,
          phase: "night",
          ended: false,
          winner: "",
          players: [],
          inspections: [],
          witchHealUsed: false,
          witchPoisonUsed: false,
        }),
        { status: 200 }
      )
    )

    await expect(advancePhase()).resolves.toMatchObject({
      round: 2,
      phase: "night",
    })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/game/next"),
      expect.objectContaining({ method: "POST" })
    )
  })

  it("fetches health status", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ status: "ok" }), { status: 200 })
    )

    await expect(fetchHealth()).resolves.toEqual({ status: "ok" })
  })
})
