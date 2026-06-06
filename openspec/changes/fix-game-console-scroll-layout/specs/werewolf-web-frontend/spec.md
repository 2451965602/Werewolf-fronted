## MODIFIED Requirements

### Requirement: Dual-mode werewolf web experience

The web frontend SHALL render a lobby-first entry and, once the user enters the spectator game view, SHALL keep the desktop spectator layout readable within the target 1920x1080 viewport without relying on default document-level scrolling for primary content. The desktop layout SHALL preserve visible access to the current narrative focus, latest speech ledger, game summary, night focus, and guest seat overview with stable local overflow boundaries.

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

#### Scenario: Current speech remains visible in constrained desktop height

- **GIVEN** the user is viewing the desktop spectator view
- **AND** synchronized messages include a current or latest speech item
- **WHEN** the available desktop height is constrained by the header, side rail, and player situation regions
- **THEN** the narrative stage still shows the current narrative focus or current speech summary without requiring the user to scroll the page
- **AND** the latest speech ledger keeps enough visible height to show at least the ledger heading and the newest speech record when speech records exist

#### Scenario: Summary and situation regions keep stable overflow boundaries

- **GIVEN** the user is viewing the desktop spectator view
- **WHEN** the right-side game summary, night focus, and guest seat overview render together with the main stage
- **THEN** the game summary remains organized within the side rail without overlapping or visually scrambling its metrics
- **AND** the night focus and guest seat overview do not create competing nested vertical scrollbars for the same content area
- **AND** any required overflow is constrained to the intended local situation or list region
