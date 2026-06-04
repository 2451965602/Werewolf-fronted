## MODIFIED Requirements

### Requirement: Dual-mode werewolf web experience

The web frontend SHALL render a single application entry that defaults to a lobby homepage and only enters the in-game control console through an explicit user action.

#### Scenario: Uninitialized game shows lobby homepage

- **GIVEN** the frontend can reach the game service
- **AND** the current game state indicates no active game has been initialized
- **WHEN** the application finishes its initial state fetch
- **THEN** it renders a lobby homepage with a primary start action
- **AND** it does not render controls that require an active game session

#### Scenario: Active game does not auto-enter console

- **GIVEN** the current game state represents an active or completed game session
- **WHEN** the application finishes its initial state fetch
- **THEN** it still renders the lobby homepage
- **AND** it offers a continue-current-game action instead of automatically entering the control console

#### Scenario: User explicitly enters the control console

- **GIVEN** the application is rendering the lobby homepage
- **AND** the current game state represents an active or completed game session
- **WHEN** the user chooses to continue the current game
- **THEN** the frontend renders the control console with the synchronized game state and messages

### Requirement: Server-driven game controls

The web frontend SHALL drive game progression only through the existing game service APIs and SHALL not maintain a separate local game engine.

#### Scenario: Starting a game transitions from lobby to console

- **GIVEN** the application is showing the lobby homepage
- **WHEN** the user triggers the primary start action
- **THEN** the frontend calls `POST /api/game/start`
- **AND** on success it refreshes game state and messages before rendering the in-game console

### Requirement: Hybrid synchronization for status and messages

The web frontend SHALL refresh state and messages immediately after key user actions and MAY also perform lightweight background synchronization to keep the display current.

#### Scenario: Background synchronization updates lobby summary without forcing navigation

- **GIVEN** the application is idle on the lobby homepage
- **WHEN** lightweight background synchronization runs
- **THEN** the frontend refreshes current game summary information
- **AND** it does not automatically switch from the lobby homepage into the control console

### Requirement: Readable spectator timeline

The web frontend SHALL present spectator-visible message flow as a structured timeline that distinguishes AI/player speech, system announcements, and vote-related events.

#### Scenario: Timeline distinguishes message categories

- **GIVEN** synchronized game messages are available
- **WHEN** the control console renders the narrative timeline
- **THEN** the frontend visually distinguishes speech, system, and vote-related entries
- **AND** each timeline item shows enough context to identify its round and phase

#### Scenario: Latest timeline item is emphasized

- **GIVEN** synchronized game messages are available
- **WHEN** the control console renders the narrative timeline
- **THEN** the frontend highlights the latest relevant item as the current focal point
- **AND** keeps earlier entries browsable in the historical timeline
