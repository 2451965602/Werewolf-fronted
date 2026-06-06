---
comet_change: fix-game-console-scroll-layout
role: technical-design
canonical_spec: openspec
---

# Fix Game Console Scroll Layout Design

## Context

OpenSpec change `fix-game-console-scroll-layout` is the canonical source for requirements. This design only defines the implementation strategy for the current UI regression: the narrative timeline and latest speech ledger are too short to show the current speech, the game summary is visually disorganized in the side rail, and the night focus plus guest seat region has unstable scroll behavior.

The current console is composed in `App.tsx`:

- `GameShell` owns the desktop viewport budget and splits the page into banner, middle content, and bottom situation regions.
- `SeatRing` wraps `NarrativeLog` in the main column.
- The side rail stacks `SpeechLedger`, `GameSummary`, and `StatusStrip`.
- The bottom situation region combines `RoleSpotlight` and `PlayerGrid`.

The failure mode is mostly structural. Parent containers use fixed viewport height and overflow clipping while child cards also set fixed or minimum heights and internal scroll areas. When the viewport height is constrained, several components compete for the same vertical budget.

## Recommended Approach

Use a viewport-budget layout with one vertical scroll owner per region.

Keep the desktop goal of fitting primary spectator information into the target 1920x1080 viewport, but make the scroll boundaries explicit:

- `GameShell` distributes the available height.
- The main narrative history scrolls inside `NarrativeLog`, after the current focus area remains visible.
- `SpeechLedger` owns its own speech-list overflow and receives priority height in the side rail.
- The bottom situation area owns overflow for `RoleSpotlight` and `PlayerGrid`; child cards should not introduce competing page-level scrollbars.

This preserves the previous one-window spectator goal while fixing the source of nested and unstable scroll behavior.

## Component Design

### GameShell

`GameShell` should remain the top-level desktop layout boundary. Its grid rows should be tuned so the middle row is not starved by the bottom row:

- Banner: natural height.
- Middle: `minmax(0, 1fr)` and must keep both main stage and side rail at `min-h-0`.
- Situation: bounded height with a stable min/max range; this region may scroll locally when content exceeds its budget.

The outer desktop container can keep `lg:h-screen lg:overflow-hidden`, but only if all inner regions have a clear overflow owner. Mobile and smaller layouts should stay in natural document flow.

### NarrativeLog

`NarrativeLog` should prioritize the current focus before history:

- Reduce desktop header padding and large statistic block height.
- Keep the current focus/current speech summary outside the historical scroll area.
- Let only the historical list scroll.
- Avoid fixed `min-h` values on desktop that exceed the parent row budget.

The visual hierarchy should still make the timeline the main stage, but the current speech must not be hidden below a compressed card body.

### SpeechLedger And Side Rail

The side rail should use a flex contract that gives `SpeechLedger` priority:

- `SpeechLedger` should have a minimum readable height and flex growth.
- `GameSummary` should be compact and should not consume unbounded height.
- `StatusStrip` should stay as a small fixed-height status block.

The ledger list may scroll internally, but the card header and newest speech record should remain visible when speech records exist.

### GameSummary

`GameSummary` should be redesigned as a compact side-rail summary rather than a wide dashboard card:

- Use a small header row with the phase pill.
- Replace the current wide two-column nested grid with stable rows or compact metric tiles.
- Keep key data visible: current round, phase, winner state, last night event, alive/dead counts, and living wolf count.
- Prefer predictable wrapping over narrow-column nested grids.

This keeps the summary useful without stealing height from the speech ledger.

### Bottom Situation Region

`RoleSpotlight` and `PlayerGrid` should behave as one situation region:

- The parent situation section owns vertical overflow on desktop.
- `RoleSpotlight` remains visible as the night focus.
- `PlayerGrid` can take the remaining area and scroll within the situation region when player cards exceed the available height.
- Child sections should use `min-h-0` and avoid introducing extra vertical scroll owners unless the parent explicitly delegates one.

This prevents the current multi-scrollbar behavior while preserving access to all guest seats.

## Alternatives Considered

### Natural Page Scroll

Removing the desktop `h-screen` constraint and returning to normal document flow would be the most robust way to avoid clipping. It would also abandon the established requirement that primary spectator regions fit in the 1920x1080 target viewport, so this is not the recommended path.

### Minimal Min-Height Tuning

Only reducing `min-h` and padding values would be low-risk in code size, but it would leave the structural conflict between parent overflow and child scroll areas. This would likely regress again when content length or viewport height changes.

### Component-Level Independent Scroll

Giving every card its own scroll area would make each component self-contained, but it would recreate the weird scrollbar experience users reported. The layout needs fewer scroll owners, not more.

## Testing Strategy

Use tests for contracts that static rendering can reliably verify:

- `GameShell` includes bounded desktop layout classes for main, side, and situation regions.
- `SpeechLedger` renders header, count, and newest speech content with a scrollable body.
- `GameSummary` renders all key metrics in compact markup.
- App composition keeps `RoleSpotlight` and `PlayerGrid` inside a single bottom situation container.

Use browser verification for actual layout behavior:

- 1920x1080 desktop viewport: current focus/current speech, ledger, summary, night focus, and guest seats are visible without page-level discovery scrolling.
- Shorter desktop viewport: no overlap; overflow appears only in the intended local regions.
- Mobile/narrow viewport: natural vertical flow remains readable.

## Risks

- CSS-only layout checks are limited in unit tests. Browser verification is required before completion.
- Compressing the narrative header and summary may reduce visual weight. Current information visibility is the higher-priority requirement.
- If player count grows beyond the assumed design range, the guest list will still need local scrolling. That is acceptable as long as the scroll boundary is predictable.

## Spec Patch

No additional OpenSpec delta spec patch is required. The current delta spec already covers current speech visibility, summary stability, and scroll boundary behavior.
