## ADDED Requirements

### Requirement: Dual-mode werewolf web experience

The web frontend SHALL render a single application entry that switches between a pre-game presentation screen and an in-game control console based on server game state.

#### Scenario: Uninitialized game shows pre-game screen

- **GIVEN** the frontend can reach the game service
- **AND** the current game state indicates no active game has been initialized
- **WHEN** the application finishes its initial state fetch
- **THEN** it renders a pre-game screen with a primary start action
- **AND** it does not render controls that require an active game session

#### Scenario: Active game shows control console

- **GIVEN** the current game state represents an active or completed game session
- **WHEN** the application renders the main experience
- **THEN** it shows the control console with phase information, summary information, player grid, and narrative log

### Requirement: Server-driven game controls

The web frontend SHALL drive game progression only through the existing game service APIs and SHALL not maintain a separate local game engine.

#### Scenario: Starting a game transitions from pre-game to console

- **GIVEN** the application is showing the pre-game screen
- **WHEN** the user triggers the primary start action
- **THEN** the frontend calls `POST /api/game/start`
- **AND** on success it refreshes game state and messages before rendering the in-game console

#### Scenario: Advancing the game uses server state as source of truth

- **GIVEN** the application is showing the in-game console
- **WHEN** the user triggers the advance action
- **THEN** the frontend calls `POST /api/game/next`
- **AND** it refreshes game state and messages after the action completes
- **AND** it renders only the state returned by the service

### Requirement: Hybrid synchronization for status and messages

The web frontend SHALL refresh state and messages immediately after key user actions and MAY also perform lightweight background synchronization to keep the display current.

#### Scenario: Manual actions force immediate refresh

- **GIVEN** a user triggers `start`, `next`, or explicit manual refresh
- **WHEN** the action request succeeds
- **THEN** the frontend immediately fetches both current game state and messages

#### Scenario: Background synchronization keeps the console current

- **GIVEN** the application is idle on either the pre-game screen or the in-game console
- **WHEN** lightweight background synchronization runs
- **THEN** the frontend refreshes status information without requiring a user click
- **AND** a background sync failure does not crash the entire page

### Requirement: Degraded failures remain operable

The web frontend SHALL degrade individual panels on partial API failure while keeping the main experience operable whenever possible.

#### Scenario: Message fetch failure does not block core controls

- **GIVEN** the game state request succeeds
- **AND** the message request fails
- **WHEN** the application updates the console
- **THEN** the phase, summary, and player controls remain usable
- **AND** the log area shows an error or retry affordance

#### Scenario: Action failure preserves current view

- **GIVEN** the user is viewing either the pre-game screen or the control console
- **WHEN** a `start` or `next` action request fails
- **THEN** the frontend keeps the current stable view visible
- **AND** it shows a user-readable error message without fabricating local progress
