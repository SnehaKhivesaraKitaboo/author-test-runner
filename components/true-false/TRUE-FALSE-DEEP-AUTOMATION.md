# True or False — Deep Automation

## Source authority

- `templates/truefalse/truefalse-template-auth.html`
- `templates/truefalse/truefalse-template-settings.html`
- `templates/truefalse/default/truefalse.json`

`dataType` = `true-false-template`; directive attribute = `true-false-data`. Dropped as an **assessment widget** into a Generic Step column (already registered in `support/module-setup.ts`).

## QC authority

`Author Test Cases - True or False.pdf` — 90 cases (`TC_01`–`TC_90`). Catalog: `true-false-testcases.json`.

## Important source facts (why some cases are deferred as "absent")

The True/False settings template **reuses the MCQ panel id `#mcq-settings-panel`**, but several MCQ controls are **commented out** in the True/False source and therefore **not rendered**:

| Control | Status in True/False source |
|---|---|
| Answer-type radios (single/multiple) | commented out — not rendered |
| Style cards (card-style1/2/3, full-bleed) | commented out — not rendered |
| Label types (A/B/C, roman, numeric…) | commented out (`ng-if isShowme` block) — not rendered |
| Action-Assets colour input | commented out — not rendered |
| **Add Option** button | commented out — component is **fixed at 2 options** (A/B) |

Tests do **not** assert these controls. Their QC cases are listed under the deferred suite with the reason, rather than producing false coverage against non-existent DOM.

## What IS rendered (and automated)

- Content: `#header-input`, `#instruction-input`, `#question-input`, option spans `#option-input-{i}` / `.option-content`.
- Option select: clicking `.tf-option-box` marks `.selected-tfoption`.
- Settings: Show Header (`#header-visibility`), Show Instruction (`#instr-visibility`), Add Media (`#add-media`) + image/video/audio radios + align, Generic Feedback (`#add-generic-feedback`) + Individual (`#add-feedback`) under `ng-if isShowme`, Try Again (`#add-activity-restart` + `#try-again-count`), Add Show Me (`#add-show-me`), Shuffle (`#add-shuftle-choices`), Reset (`#reset`).
- Delete disabled at the 2-option minimum (`.row-delete.btn-disabled`).

## Coverage

- **Automated (authoring-side):** ~30 cases.
- **Deferred:** ~60 cases — Reader/Preview submit feedback, shuffle randomization, publish, persistence, file-picker uploads, drag-reorder, accessibility audits, and the commented-out controls above.

See `true-false-mapping.json` for QC-ID → `it()` → selector traceability.

## How to run

```bash
npm run cypress:open   # pick "13-true-false-deep.spec.ts"
npx cypress run --spec "components/true-false/13-true-false-deep.spec.ts"
```

If `AUTHORING_LAUNCH_URL` is not set, the spec is skipped via the top-level `before()` guard.

## Status

`generated-unverified` — source-verified and lint-clean; not yet run against a live `AUTHORING_LAUNCH_URL`.
