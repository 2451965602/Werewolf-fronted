import type { ApiGameState, ApiMessage } from "./types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""

export class RequestError extends Error {
  public readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = "RequestError"
  }
}

export type GameStateResult =
  | { kind: "ready"; state: ApiGameState }
  | { kind: "uninitialized" }

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

export async function fetchGameState(): Promise<GameStateResult> {
  const response = await fetch(`${API_BASE_URL}/api/game/state`)

  if (response.status === 404) {
    return { kind: "uninitialized" }
  }

  if (!response.ok) {
    throw new RequestError(
      `state request failed: ${response.status}`,
      response.status
    )
  }

  return { kind: "ready", state: await parseJson<ApiGameState>(response) }
}

export async function fetchMessages(): Promise<ApiMessage[]> {
  const response = await fetch(`${API_BASE_URL}/api/game/messages`)

  if (!response.ok) {
    throw new RequestError(
      `messages request failed: ${response.status}`,
      response.status
    )
  }

  return parseJson<ApiMessage[]>(response)
}

export async function fetchHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/api/game/health`)

  if (!response.ok) {
    throw new RequestError(
      `health request failed: ${response.status}`,
      response.status
    )
  }

  return parseJson<{ status: string }>(response)
}

export async function startGame(): Promise<ApiGameState> {
  const response = await fetch(`${API_BASE_URL}/api/game/start`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new RequestError(
      `start request failed: ${response.status}`,
      response.status
    )
  }

  return parseJson<ApiGameState>(response)
}

export async function advancePhase(): Promise<ApiGameState> {
  const response = await fetch(`${API_BASE_URL}/api/game/next`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new RequestError(
      `next request failed: ${response.status}`,
      response.status
    )
  }

  return parseJson<ApiGameState>(response)
}
