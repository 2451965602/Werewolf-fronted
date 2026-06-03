import { describe, expect, it } from "vitest"

import { createRequestCoordinator } from "./request-coordinator"

describe("createRequestCoordinator", () => {
  it("skips silent refresh while a mutation is running", () => {
    const coordinator = createRequestCoordinator()

    const mutationId = coordinator.beginMutation()

    expect(mutationId).toBe(1)
    expect(coordinator.beginSnapshot(true)).toBeNull()

    coordinator.endMutation()

    expect(coordinator.beginSnapshot(true)).toBe(2)
  })

  it("accepts only the latest request result", () => {
    const coordinator = createRequestCoordinator()

    const firstRefresh = coordinator.beginSnapshot(false)
    const mutation = coordinator.beginMutation()

    expect(firstRefresh).toBe(1)
    expect(mutation).toBe(2)
    expect(coordinator.shouldApply(firstRefresh!)).toBe(false)
    expect(coordinator.shouldApply(mutation)).toBe(true)
  })
})
