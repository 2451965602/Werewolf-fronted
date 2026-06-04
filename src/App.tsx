import { useEffect } from "react"
import { useGameConsole } from "./features/game/use-game-console"
import { GameShell } from "./features/game/components/game-shell"
import { PhaseHero } from "./features/game/components/phase-hero"
import { NarrativeLog } from "./features/game/components/narrative-log"
import { ControlPanel } from "./features/game/components/control-panel"
import { GameSummary } from "./features/game/components/game-summary"
import { StatusStrip } from "./features/game/components/status-strip"
import { PlayerGrid } from "./features/game/components/player-grid"
import { RoleSpotlight } from "./features/game/components/role-spotlight"
import { PreGameScreen } from "./features/game/components/pre-game-screen"

export function App() {
  const { viewModel, requestState, refresh, start, advance } = useGameConsole()

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (viewModel.screenMode === "pregame") {
    return (
      <PreGameScreen
        heroIntro={viewModel.heroIntro}
        serviceHealth={viewModel.serviceHealth}
        requestState={requestState}
        onStart={start}
        onRefresh={refresh}
      />
    )
  }

  return (
    <GameShell
      banner={
        <PhaseHero
          isInitialized={viewModel.isInitialized}
          currentRound={viewModel.currentRound}
          phaseLabel={viewModel.phaseLabel}
          phaseVariant={viewModel.phaseVariant}
          winnerLabel={viewModel.winnerLabel}
          heroBanner={viewModel.heroBanner}
        />
      }
      mainLog={
        <NarrativeLog
          items={viewModel.timeline}
          emptyState={viewModel.emptyState}
        />
      }
      sideRail={
        <div className="space-y-6">
          <ControlPanel
            requestState={requestState}
            isInitialized={viewModel.isInitialized}
            onRefresh={refresh}
            onStart={start}
            onAdvance={advance}
          />
          <GameSummary summary={viewModel.summary} />
          <StatusStrip
            error={requestState.error}
            isInitialized={viewModel.isInitialized}
          />
        </div>
      }
      situation={
        <div className="space-y-6">
          <RoleSpotlight spotlight={viewModel.roleSpotlight} />
          <PlayerGrid players={viewModel.players} />
        </div>
      }
    />
  )
}

export default App
