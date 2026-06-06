## 1. Layout Contract Tests

- [x] 1.1 Update `GameShell` tests to assert the desktop layout exposes bounded main, side, and situation regions without relying on competing overflow rules.
- [x] 1.2 Add focused component coverage for `SpeechLedger` and `GameSummary` so the newest speech and summary metrics remain present in constrained containers.
- [x] 1.3 Add or update coverage for bottom situation composition so night focus and guest seat regions use a single predictable overflow boundary.

## 2. Main Stage And Side Rail

- [x] 2.1 Adjust `GameShell` desktop row sizing, min-height, and overflow rules to preserve a readable middle row and stable bottom situation area.
- [x] 2.2 Tune `NarrativeLog` spacing and minimum-height behavior so the current focus/current speech summary stays visible before the historical list scrolls.
- [x] 2.3 Tune `SpeechLedger` height/flex behavior so the latest speech record is not squeezed out by the summary or status strip.
- [x] 2.4 Refactor `GameSummary` into a compact right-rail layout that keeps metrics aligned at the existing side-rail width.

## 3. Bottom Situation Region

- [x] 3.1 Adjust `App.tsx`, `RoleSpotlight`, and `PlayerGrid` composition so night focus remains visible and guest seats scroll only within the intended region when needed.
- [x] 3.2 Verify mobile and narrow desktop layouts continue to use natural vertical flow without desktop-only clipping.

## 4. Verification

- [x] 4.1 Run focused tests for game layout components and app composition.
- [x] 4.2 Run `npm run typecheck`, `npm run lint`, and the relevant Vitest suite.
- [x] 4.3 Use browser verification at 1920x1080 and one shorter desktop viewport to confirm current speech visibility, organized summary layout, and normal scrollbars for night focus and guest seats.
