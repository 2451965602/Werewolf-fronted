export function createRequestCoordinator() {
  let latestRequestId = 0
  let activeMutations = 0

  return {
    beginSnapshot(isSilent: boolean) {
      if (isSilent && activeMutations > 0) {
        return null
      }

      latestRequestId += 1
      return latestRequestId
    },
    beginMutation() {
      activeMutations += 1
      latestRequestId += 1
      return latestRequestId
    },
    endMutation() {
      activeMutations = Math.max(0, activeMutations - 1)
    },
    shouldApply(requestId: number) {
      return requestId === latestRequestId
    },
  }
}
