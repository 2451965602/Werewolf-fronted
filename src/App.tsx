import { useEffect, useState } from "react"
import { useGameConsole } from "./features/game/use-game-console"
import { GameShell } from "./features/game/components/game-shell"
import { StageStatusStrip } from "./features/game/components/stage-status-strip"
import { NarrativeLog } from "./features/game/components/narrative-log"
import { SpeechLedger } from "./features/game/components/speech-ledger"
import { SeatRing } from "./features/game/components/seat-ring"
import { GameSummary } from "./features/game/components/game-summary"
import { StatusStrip } from "./features/game/components/status-strip"
import { PlayerGrid } from "./features/game/components/player-grid"
import { RoleSpotlight } from "./features/game/components/role-spotlight"
import { PreGameScreen } from "./features/game/components/pre-game-screen"

export function App() {
  const { viewModel, requestState, refresh, start } = useGameConsole()
  const [entryMode, setEntryMode] = useState<"lobby" | "console">("lobby")
  const isConsoleReady =
    entryMode === "console" && viewModel.screenMode === "console"

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (!isConsoleReady) {
    return (
      <PreGameScreen
        heroIntro={viewModel.heroIntro}
        serviceHealth={viewModel.serviceHealth}
        requestState={requestState}
        currentGameSummary={viewModel.currentGameSummary}
        onContinue={async () => {
          setEntryMode("console")
        }}
        onStart={async () => {
          const didStart = await start()

          if (didStart) {
            setEntryMode("console")
          } else {
            setEntryMode("lobby")
          }
        }}
        onRefresh={refresh}
      />
    )
  }

  return (
    <GameShell
      banner={
        <StageStatusStrip
          isInitialized={viewModel.isInitialized}
          currentRound={viewModel.currentRound}
          phaseLabel={viewModel.phaseLabel}
          phaseVariant={viewModel.phaseVariant}
          winnerLabel={viewModel.winnerLabel}
        />
      }
      mainLog={
        <SeatRing items={viewModel.seatRing}>
          <NarrativeLog
            items={viewModel.timeline}
            emptyState={viewModel.emptyState}
          />
        </SeatRing>
      }
      sideRail={
        <div className="flex h-full min-h-0 flex-col gap-4">
          <SpeechLedger ledger={viewModel.speechLedger} />
          <GameSummary summary={viewModel.summary} />
          <StatusStrip
            error={requestState.error}
            isInitialized={viewModel.isInitialized}
          />
        </div>
      }
      situation={
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
          <RoleSpotlight spotlight={viewModel.roleSpotlight} />
          <PlayerGrid players={viewModel.players} />
        </div>
      }
    />
  )
}

export default App
