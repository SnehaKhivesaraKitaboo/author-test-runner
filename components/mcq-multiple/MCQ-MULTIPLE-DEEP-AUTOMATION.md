# MCQ Multiple (Multiple Answer) — Deep Automation

## Architecture (read this first)

**MCQ Multiple is NOT a separate component.** It is the **same `multiple-choice-template`** as single-choice MCQ, with the **answer type set to `multiple`**. The only structural difference on the authoring canvas is that option inputs render as **checkboxes** (`input.mcqchkbox`) instead of **radios** (`input.mcqradio`), allowing more than one correct answer.

Because of this, the assets here **extend** the shared MCQ assets rather than duplicating them:

| File | Role |
|---|---|
| `selectors.ts` | Re-exports `../mcq/selectors` + multiple-answer aliases (`optionInput` → checkbox). |
| `testdata.ts` | Extends `../mcq/testdata` with multiple-correct-answer data. |
| `commands.ts` | Imports `../mcq/commands`, adds `ensureMcqMultipleDeepSetup` / `ensureMcqMultipleMode`. |
| `12-mcq-multiple-deep.spec.ts` | The deep spec — verifies multiple-mode authoring behaviour. |

## Source authority

- `templates/multiple-choice-template/multiple-choice-template-settings.html`
- `templates/multiple-choice-template/multiple-choice-template-auth.html`
- `templates/multiple-choice-template/default/multiple-choice-template.json`

## QC authority

`Author Test Cases - MCQ Multiple.pdf` — 108 test cases (`TC_01`–`TC_108`). The catalog is in `mcq-multiple-testcases.json`.

## Coverage

- **Automated (authoring-side):** 40 cases — answer-type switching, checkbox options, multiple correct answers, outline/align/media/feedback/activity controls, label types, options add/delete + max rule, content entry, sample-answer toggles, header/instruction visibility, script sanitization.
- **Deferred:** 64 cases — Reader/Preview rendering, Publish, cross-session persistence, partial/correct answer counting, file-picker uploads, math editor, validation errors that only surface on Save/Publish, and accessibility audits.

See `mcq-multiple-mapping.json` for the exact QC-ID → `it()` → selector traceability.

## Multiple-answer specifics verified here

- `TC_11` — switching to "Multiple" answer type is applied in settings.
- `TC_12` — options render as checkboxes (not radios) in multiple mode.
- `TC_12b` — **more than one** correct option can be marked simultaneously (the defining MCQ-Multiple behaviour).
- `TC_11b` — toggling back to Single restores radio inputs.

## Deferred — why

Partial/correct answer **counting** (`TC_14`, `TC_15`), feedback **messages on submit**, shuffle **randomisation**, sample-answer **read-only behaviour**, and all persistence/publish cases require the **Reader/Preview** runtime, which is outside the authoring tool. These are listed in suite `12-Z` as `it.skip()` with reasons.

## How to run

```bash
# Dashboard: pick "12-mcq-multiple-deep.spec.ts"
npm run cypress:open

# Headless (requires AUTHORING_LAUNCH_URL set)
npx cypress run --spec "components/mcq-multiple/12-mcq-multiple-deep.spec.ts"
```

If `AUTHORING_LAUNCH_URL` is not set, the whole spec is skipped via the top-level `before()` guard.

## Status

`generated-unverified` — assets are source-verified and lint-clean, but have not yet been executed against a live `AUTHORING_LAUNCH_URL`. Run once to confirm and update `coverage.lastVerified` in `component.json`.
