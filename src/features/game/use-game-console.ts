import { useCallback, useEffect, useRef, useState } from "react"

import {
  advanceConsole,
  loadConsoleSnapshot,
  startConsole,
} from "./console-operations"
import { createRequestCoordinator } from "./request-coordinator"
import { createUninitializedViewModel } from "./view-model"

type RequestState = {
  isStarting: boolean
  isAdvancing: boolean
  isRefreshing: boolean
  error: string
}

const initialRequestState: RequestState = {
  isStarting: false,
  isAdvancing: false,
  isRefreshing: false,
  error: "",
}

const AUTO_SYNC_MS = 5000

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error"
}

export function useGameConsole() {
  const [viewModel, setViewModel] = useState(createUninitializedViewModel)
  const [requestState, setRequestState] = useState(initialRequestState)
  const requestCoordinatorRef = useRef(createRequestCoordinator())

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const requestId = requestCoordinatorRef.current.beginSnapshot(
      options?.silent === true
    )

    if (requestId == null) {
      return
    }

    if (!options?.silent) {
      setRequestState((prev) => ({ ...prev, isRefreshing: true, error: "" }))
    }

    try {
      const snapshot = await loadConsoleSnapshot()

      if (!requestCoordinatorRef.current.shouldApply(requestId)) {
        return
      }

      setViewModel(snapshot.viewModel)
      setRequestState((prev) => ({ ...prev, error: snapshot.error }))
    } catch (error) {
      if (!requestCoordinatorRef.current.shouldApply(requestId)) {
        return
      }

      setRequestState((prev) => ({
        ...prev,
        error: toErrorMessage(error),
      }))
    } finally {
      if (!options?.silent) {
        setRequestState((prev) => ({ ...prev, isRefreshing: false }))
      }
    }
  }, [])

  const start = useCallback(async () => {
    const requestId = requestCoordinatorRef.current.beginMutation()
    setRequestState((prev) => ({ ...prev, isStarting: true, error: "" }))

    try {
      const snapshot = await startConsole()

      if (!requestCoordinatorRef.current.shouldApply(requestId)) {
        return false
      }

      setViewModel(snapshot.viewModel)
      setRequestState((prev) => ({ ...prev, error: snapshot.error }))
      return true
    } catch (error) {
      if (!requestCoordinatorRef.current.shouldApply(requestId)) {
        return false
      }

      setRequestState((prev) => ({
        ...prev,
        error: toErrorMessage(error),
      }))
      return false
    } finally {
      requestCoordinatorRef.current.endMutation()
      setRequestState((prev) => ({ ...prev, isStarting: false }))
    }
  }, [])

  const advance = useCallback(async () => {
    const requestId = requestCoordinatorRef.current.beginMutation()
    setRequestState((prev) => ({ ...prev, isAdvancing: true, error: "" }))

    try {
      const snapshot = await advanceConsole()

      if (!requestCoordinatorRef.current.shouldApply(requestId)) {
        return
      }

      setViewModel(snapshot.viewModel)
      setRequestState((prev) => ({ ...prev, error: snapshot.error }))
    } catch (error) {
      if (!requestCoordinatorRef.current.shouldApply(requestId)) {
        return
      }

      setRequestState((prev) => ({
        ...prev,
        error: toErrorMessage(error),
      }))
    } finally {
      requestCoordinatorRef.current.endMutation()
      setRequestState((prev) => ({ ...prev, isAdvancing: false }))
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refresh({ silent: true })
    }, AUTO_SYNC_MS)

    return () => window.clearInterval(timer)
  }, [refresh])

  return {
    requestState,
    viewModel,
    refresh,
    start,
    advance,
  }
}
