## ADDED Requirements

### Requirement: Lobby-first game entry

The frontend SHALL render a lobby-style homepage as the default entry view even when the server reports an active game session.

#### Scenario: Existing active game still opens in lobby

- **GIVEN** the application finishes its initial state fetch
- **AND** the current game state represents an active or completed game session
- **WHEN** the user first lands on the application
- **THEN** the frontend shows the lobby homepage instead of directly entering the in-game console
- **AND** it presents a clear affordance to continue the current game session

### Requirement: Continue-current-game affordance

The frontend SHALL expose a dedicated summary card for an active game session from the lobby homepage.

#### Scenario: Lobby shows current game summary

- **GIVEN** the server reports an active or completed game session
- **WHEN** the lobby homepage renders
- **THEN** the page shows current round, phase, and high-level game status
- **AND** it provides a primary action to continue the current game
- **AND** it provides a secondary action to start a new game

#### Scenario: Lobby shows empty active-game state

- **GIVEN** the server reports no initialized game session
- **WHEN** the lobby homepage renders
- **THEN** the active-game area renders a clear empty state
- **AND** the primary action remains starting a new game
