## MODIFIED Requirements

### Requirement: Dual-mode werewolf web experience

The web frontend SHALL render a lobby-first entry and, once the user enters the control console, SHALL keep the desktop spectator layout readable without collapsing its primary stage regions.

#### Scenario: Desktop control console keeps stable stage regions

- **GIVEN** the user has entered the in-game control console on a desktop-width viewport
- **WHEN** the frontend renders synchronized game state and messages
- **THEN** the primary narrative stage remains visible and scrollable
- **AND** supporting regions for compact stage status, seat overview, and detailed player context do not collapse to zero height

### Requirement: Readable spectator timeline

The web frontend SHALL present spectator-visible message flow as a structured timeline that distinguishes AI/player speech, system announcements, and vote-related events, and SHALL expose a separate current-round speech record view for player speech.

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

#### Scenario: Current-round speech record stays synchronized with timeline

- **GIVEN** synchronized game messages include player speech for the active round
- **WHEN** the control console renders the desktop spectator view
- **THEN** the frontend shows a dedicated speech record region for player speech from the current round
- **AND** each speech record identifies the speaker and preserves message order
- **AND** the dedicated speech record updates when new synchronized player speech arrives for that round

### Requirement: Spectator seat awareness on desktop

The desktop spectator console SHALL provide a compact seat overview around the main stage that identifies seat number, role, and living status without requiring the detailed player card grid to remain in the primary focus area.

#### Scenario: Compact desktop seat overview weakens eliminated players

- **GIVEN** the user is viewing the desktop spectator console
- **AND** synchronized player state includes both living and eliminated players
- **WHEN** the compact seat overview renders around the main narrative stage
- **THEN** each seat overview node identifies seat number and role
- **AND** eliminated players are visually weakened compared to living players
