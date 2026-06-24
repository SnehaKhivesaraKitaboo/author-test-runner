# FIB Media (Fill in the Blank with Image) — Deep Automation

## Architecture

FIB Media is **not a separate template**. It is the **FIB template** (`templates/fib/`) running in **"FIB with Image" mode** (`currSettings.fibWithImage === true`). Each statement row can carry an image (`.mediaContainer`), and the settings panel exposes image paragraph media with placement controls. The assets here reuse the existing FIB drop/setup infrastructure (Generic Step column).

## Source authority

- `templates/fib/fib.html`
- `templates/fib/fib-settings-panel.html`

## QC authority

`Author Test Cases - FIBMedia test cases.pdf` — 43 cases (`TC_01`–`TC_43`). Catalog: `fib-media-testcases.json`.

## Coverage reality (important)

This QC suite is **dominated by capabilities Cypress cannot assert from the authoring DOM alone**:

- **File-picker uploads** (TC_02, TC_03, TC_11, TC_12, TC_18, TC_38) — OS dialogs / real file selection.
- **Resize handles** (TC_06, TC_07, TC_15, TC_26, TC_28) — drag-resize of images.
- **Autosave / browser refresh** (TC_27, TC_43) — reload cycles.
- **Network loss / storage quota** (TC_34, TC_35, TC_36) — environment simulation.
- **Undo/redo, keyboard nav** (TC_22, TC_23, TC_29) — editor-history / a11y.
- **Reader / eReader rendering** (most "preview/eReader" expectations).

These are deferred with explicit reasons in suite `14-Z`. Faking DOM assertions for them would be false coverage.

## Automated (authoring-side)

| QC | What is verified |
|---|---|
| TC_DROP | FIB-with-Image drops into the Generic Step column |
| TC_05 / TC_19 | Image media offered; audio/video paragraph media not offered (image-only) |
| TC_08 / TC_16 | Image placement / setting controls present |
| TC_25 | Long statement text can be entered |
| TC_31 / TC_40 | Component renders statement rows |
| TC_37 | Script injection in header is not executed |

**8 automated / 35 deferred.** See `fib-media-mapping.json` for traceability.

## Canvas data-type caveat

Depending on build, a dropped FIB-with-Image may surface as `data-type="fill-in-the-blank"` (with a `data-fib-type` flag) or as `data-type="fib-media"`. The `widget` selector tolerates both; `component` keys off `.fib`. Confirm on the first live run.

## How to run

```bash
npm run cypress:open   # pick "14-fib-media-deep.spec.ts"
npx cypress run --spec "components/fib-media/14-fib-media-deep.spec.ts"
```

## Status

`generated-unverified` — source-verified and lint-clean; not yet run against a live `AUTHORING_LAUNCH_URL`. The drop name ("FIB Media") and canvas data-type should be confirmed on first run.
