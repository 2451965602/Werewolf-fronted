## MODIFIED Requirements

### Requirement: Dual-mode werewolf web experience

The web frontend SHALL render a lobby-first entry and, once the user enters the spectator game view, SHALL keep the desktop spectator layout readable within the target 1920x1080 viewport without relying on default document-level scrolling for primary content.

#### Scenario: Desktop spectator view fits the 1920x1080 target viewport

- **GIVEN** the user has entered the in-game spectator view on a 1920x1080 desktop viewport
- **WHEN** the frontend renders synchronized game state and messages
- **THEN** the primary narrative stage, latest speech ledger, compact status, game summary, and player situation remain visible in one window as the default layout
- **AND** the page does not require document-level vertical scrolling to discover those primary regions

#### Scenario: Desktop historical overflow stays local

- **GIVEN** the user is viewing the desktop spectator view
- **AND** the message or speech history exceeds the space available in the target viewport
- **WHEN** the frontend renders historical records
- **THEN** overflowing history is constrained to the relevant local list area
- **AND** the surrounding status, summary, and player situation regions remain visible and do not collapse to zero height

#### Scenario: Director control panel is removed from the spectator view

- **GIVEN** the user has entered the in-game spectator view
- **WHEN** the frontend renders the right-side or supporting information area
- **THEN** it does not render the director control panel or director console card
- **AND** it does not expose start, advance, or refresh controls as a director operation panel in that view

#### Scenario: Desktop seat overview preserves stage-first focus

- **GIVEN** the user is viewing the desktop spectator view
- **WHEN** the seat overview renders beside or around the primary narrative stage
- **THEN** the layout preserves a clear primary focus on the main narrative stage
- **AND** the seat overview remains readable without relying on absolute-positioned ring geometry that can overlap adjacent regions

### Requirement: Readable spectator timeline

The web frontend SHALL present spectator-visible message flow as a structured timeline that distinguishes AI/player speech, system announcements, and vote-related events, SHALL expose a separate speech ledger view for player speech, and SHALL render both the timeline and speech ledger with the newest records first.

#### Scenario: Timeline distinguishes message categories

- **GIVEN** synchronized game messages are available
- **WHEN** the spectator view renders the narrative timeline
- **THEN** the frontend visually distinguishes speech, system, and vote-related entries
- **AND** each timeline item shows enough context to identify its round and phase

#### Scenario: Latest timeline item is emphasized first

- **GIVEN** synchronized game messages are available
- **WHEN** the spectator view renders the narrative timeline
- **THEN** the newest relevant item is highlighted as the current focal point
- **AND** the historical timeline list starts with the newest record before earlier records

#### Scenario: Current-round speech ledger stays synchronized when current-round speech exists

- **GIVEN** synchronized game messages include player speech for the active round
- **WHEN** the frontend renders the speech ledger
- **THEN** the speech ledger shows the active round's player speech with the newest speech first
- **AND** each speech record identifies the speaker and round context

#### Scenario: Speech ledger falls back to the latest available round

- **GIVEN** the active round currently has no player speech
- **AND** earlier rounds contain player speech records
- **WHEN** the frontend renders the speech ledger
- **THEN** the speech ledger shows the most recent round that has player speech
- **AND** the displayed fallback speech records are ordered newest first
- **AND** the UI indicates that the displayed records are a fallback from that earlier round
