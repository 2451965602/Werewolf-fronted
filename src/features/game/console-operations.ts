import {
  advancePhase,
  fetchGameState,
  fetchHealth,
  fetchMessages,
  startGame,
} from "./api"
import { buildGameViewModel, createUninitializedViewModel } from "./view-model"

type ServiceHealth = {
  label: string
  tone: "ok" | "warning" | "error"
}

type LoadDeps = {
  fetchHealth: typeof fetchHealth
  fetchGameState: typeof fetchGameState
  fetchMessages: typeof fetchMessages
}

type StartDeps = {
  startGame: typeof startGame
  fetchGameState: typeof fetchGameState
  fetchMessages: typeof fetchMessages
}

type AdvanceDeps = {
  advancePhase: typeof advancePhase
  fetchGameState: typeof fetchGameState
  fetchMessages: typeof fetchMessages
}

function mapServiceHealth(status: string | null): ServiceHealth {
  if (status === "ok") {
    return { label: "服务正常", tone: "ok" }
  }

  return { label: "服务异常", tone: "error" }
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error"
}

async function readMessages(fetchMessagesImpl: typeof fetchMessages) {
  try {
    return { messages: await fetchMessagesImpl(), error: "" }
  } catch (error) {
    return { messages: [], error: toErrorMessage(error) }
  }
}

async function readReadyState(
  fetchGameStateImpl: typeof fetchGameState,
  fallbackState: Awaited<ReturnType<typeof startGame>>
) {
  const result = await fetchGameStateImpl()

  if (result.kind === "ready") {
    return result.state
  }

  return fallbackState
}

export async function loadConsoleSnapshot(
  deps: LoadDeps = {
    fetchHealth,
    fetchGameState,
    fetchMessages,
  }
) {
  const healthStatus = await deps
    .fetchHealth()
    .then((result) => result.status)
    .catch(() => null)

  const stateResult = await deps.fetchGameState()
  const serviceHealth = mapServiceHealth(healthStatus)

  if (stateResult.kind === "uninitialized") {
    return {
      viewModel: {
        ...createUninitializedViewModel(),
        serviceHealth,
      },
      error: "",
    }
  }

  const { messages, error } = await readMessages(deps.fetchMessages)

  return {
    viewModel: {
      ...buildGameViewModel(stateResult.state, messages),
      serviceHealth,
    },
    error,
  }
}

export async function startConsole(
  deps: StartDeps = {
    startGame,
    fetchGameState,
    fetchMessages,
  }
) {
  const state = await deps.startGame()
  const refreshedState = await readReadyState(deps.fetchGameState, state)
  const { messages, error } = await readMessages(deps.fetchMessages)

  return {
    viewModel: buildGameViewModel(refreshedState, messages),
    error,
  }
}

export async function advanceConsole(
  deps: AdvanceDeps = {
    advancePhase,
    fetchGameState,
    fetchMessages,
  }
) {
  const state = await deps.advancePhase()
  const refreshedState = await readReadyState(deps.fetchGameState, state)
  const { messages, error } = await readMessages(deps.fetchMessages)

  return {
    viewModel: buildGameViewModel(refreshedState, messages),
    error,
  }
}
