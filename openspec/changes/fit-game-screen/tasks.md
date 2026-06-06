## 1. Data Ordering

- [x] 1.1 Update `view-model.ts` so `timeline` is derived with newest records first while preserving latest-focus metadata.
- [x] 1.2 Update `buildSpeechLedger` so current-round and fallback speech records are returned newest first.
- [x] 1.3 Update view-model tests to assert newest-first timeline and speech ledger ordering.

## 2. Console Simplification

- [x] 2.1 Remove `ControlPanel` from the in-game `sideRail` composition in `App.tsx`.
- [x] 2.2 Delete the unused `control-panel.tsx` component and its tests after confirming no remaining imports.
- [x] 2.3 Update app-level tests and mocks so the console no longer expects director controls.

## 3. 1920x1080 Layout Fit

- [ ] 3.1 Adjust `GameShell` desktop layout to use a bounded 1920x1080-friendly viewport budget with stable grid/flex rows.
- [ ] 3.2 Tune `NarrativeLog`, `SpeechLedger`, summary, and situation region heights/gaps so primary content is visible without default page scrolling at 1920x1080.
- [ ] 3.3 Keep mobile and smaller desktop layouts readable with normal vertical flow where the 1920x1080 budget does not apply.

## 4. Verification

- [ ] 4.1 Run focused unit tests for view-model, app shell, narrative log, and speech ledger.
- [ ] 4.2 Run typecheck and lint.
- [ ] 4.3 Use browser verification at 1920x1080 to confirm the primary console regions are visible, the director console is absent, and timeline/speech ledger lists show newest records first.
