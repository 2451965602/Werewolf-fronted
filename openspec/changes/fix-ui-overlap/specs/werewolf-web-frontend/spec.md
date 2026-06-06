## MODIFIED Requirements

### Requirement: Dual-mode werewolf web experience

The web frontend SHALL render a lobby-first entry and, once the user enters the control console, SHALL keep the desktop spectator layout readable without collapsing its primary stage regions.

#### Scenario: Desktop control console keeps stable stage regions

- **GIVEN** the user has entered the in-game control console on a desktop-width viewport
- **WHEN** the frontend renders synchronized game state and messages
- **THEN** the primary narrative stage remains visible and scrollable
- **AND** supporting regions for compact stage status, seat overview, and detailed player context do not collapse to zero height

#### Scenario: Desktop seat overview preserves stage-first focus

- **GIVEN** the user is viewing the desktop spectator console
- **WHEN** the seat overview renders beside or around the primary narrative stage
- **THEN** the layout preserves a clear primary focus on the main narrative stage
- **AND** the seat overview remains readable without relying on absolute-positioned ring geometry that can overlap adjacent regions

### Requirement: Readable spectator timeline

The web frontend SHALL present spectator-visible message flow as a structured timeline that distinguishes AI/player speech, system announcements, and vote-related events, and SHALL expose a separate speech ledger view for player speech.

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

#### Scenario: Current-round speech ledger stays synchronized when current-round speech exists

- **GIVEN** synchronized game messages include player speech for the active round
- **WHEN** the frontend renders the speech ledger
- **THEN** the speech ledger shows the active round's player speech in order
- **AND** each speech record identifies the speaker and round context

#### Scenario: Speech ledger falls back to the latest available round

- **GIVEN** the active round currently has no player speech
- **AND** earlier rounds contain player speech records
- **WHEN** the frontend renders the speech ledger
- **THEN** the speech ledger shows the most recent round that has player speech
- **AND** the UI indicates that the displayed records are a fallback from that earlier round
