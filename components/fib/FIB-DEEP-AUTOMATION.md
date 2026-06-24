# Fill in the Blank (FIB) — Deep Automation

## Architecture

Standard **FIB** is an **assessment widget** (`dataType = "fill-in-the-blank"`) that must be
dropped into a **Generic Step column** (same rule as MCQ / Extended Response). It is the
`templates/fib/` template running in its default mode — **no image/media options** (that is the
separate **FIB Media** suite, which is the same template in `fibWithImage` mode).

The reusable FIB workflow commands already live in `support/commands.ts` (globally loaded via
`support/index.ts`) and are **reused, not duplicated**, by this suite:

- `cy.ensureFibDeepSetup({ through, skipStepCreation })`
- `cy.dropFibIntoGenericStepColumn()`
- `cy.fillFibDummyContent()`
- `cy.waitForFibWidgetReady()`
- `cy.openFibSettings()`
- `cy.insertFibBlank()`
- `cy.pasteFibIntoNextGenericStepSlot()`

`components/fib/commands.ts` is an intentional no-op kept for structural parity with the other
`components/<slug>/` suites.

## Source authority

- `closify/KITABOO_Authoring/templates/fib/fib.html`
- `closify/KITABOO_Authoring/templates/fib/fib-settings-panel.html`

## QC authority

`Author Test Cases - FIB test cases.pdf` — **59 cases** (`TC_01`–`TC_59`).
Catalog: `fib-testcases.json`. Traceability: `fib-mapping.json`.

## Files

| File | Purpose |
|------|---------|
| `13-fib-deep.spec.ts` | Deep component spec (Suites 13-A … 13-I + deferred 13-Z) |
| `selectors.ts` | Source-verified canvas + `#fib-settings-panel` selectors |
| `testdata.ts` | Reusable header/sentence/feedback/dropdown/XSS data |
| `commands.ts` | No-op (reuses shared FIB commands from `support/`) |
| `fib-mapping.json` | QC → automated/deferred traceability (coverage page) |
| `component.json` | Component metadata + coverage summary |
| `fib-testcases.json` | Verbatim QC catalog extracted from the PDF |

## Automated (authoring-side) — 30 cases

Drop & content (TC_02), copy/paste & isolation (TC_03/04/23/58), styles (TC_05/06/59),
label types (TC_08–TC_13), visibility toggles (TC_14), option types (TC_15/53/54),
blanks (TC_16/17/48), dropdown options & shuffle (TC_49/51/56), feedback & advanced toggles
(TC_25/35), delete isolation (TC_24), no-media rule (TC_28), and script-injection
sanitisation (TC_37).

## Deferred — 29 cases (suite 13-Z, `it.skip`)

These require capabilities not assertable from the authoring DOM with Cypress alone:

- **Preview / Reader runtime**: TC_22, TC_29, TC_30, TC_44, TC_45, TC_52, TC_57.
- **Save + refresh persistence**: TC_40, TC_41.
- **Save-flow validation / limits**: TC_26, TC_33, TC_38, TC_39, TC_50.
- **File picker**: TC_55 (upload image inside a blank).
- **Undo/redo & keyboard/screen-reader a11y**: TC_19, TC_20, TC_21, TC_36, TC_43, TC_46.
- **Internal-state / runtime caps**: TC_18, TC_27, TC_31, TC_32, TC_34, TC_42, TC_47.
- **Environment bootstrap**: TC_01 (launch URL + login).

Faking DOM assertions for these would be false coverage; they are skipped with explicit reasons.

## Status

`generated-unverified` — built from QC PDF + source. Pending a live run with
`AUTHORING_LAUNCH_URL` set (deferred per the build-all-first strategy).
