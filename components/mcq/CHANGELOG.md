# MCQ Component — Changelog

## [Unreleased] — Component-centric migration + rewrite

### Added
- `components/mcq/` component folder (self-contained).
- `selectors.ts` — source-verified MCQ selectors + business rules.
- `commands.ts` — `ensureMcqDeepSetup`, `dropMcqIntoGenericStepColumn`, `fillMcqDummyContent`, `openMcqSettings`, `setMcqAnswerType`, `ensureMcqShowmeOn` (reuse existing support/ helpers).
- `testdata.ts` — reusable MCQ strings/values.
- `mcq-testcases.json` — QC catalog extracted from the MCQ PDF (TC_01–102 + Sample Layer).
- `mcq-mapping.json` — QC ↔ `it()` ↔ selector traceability.
- `component.json`, `MCQ-DEEP-AUTOMATION.md`, `source-pdf-reference.md`.

### Changed
- Rewrote `11-mcq-deep.spec.ts`:
  - Real assertions replace prior `if(len){}else{log}` false-coverage no-ops.
  - Selectors corrected to verified IDs/bindings from template source.
  - Step creation now uses `cy.createTestStep()` instead of raw modal selectors.
  - Reset targeted by `ng-model="currSettings.reset"` (avoids duplicate `#add-show-me` id).
  - Label Types / Feedback tests enable Show Me first (`isShowme` gate).
  - Deferred Reader/Publish/Persistence cases marked `it.skip()` with reasons.
- `cypress.config.ts` `specPattern` → `{e2e,components}/**/*.spec.ts` (approved).

### Removed
- `e2e/11-mcq-deep.spec.ts` (moved + rewritten into `components/mcq/`).
