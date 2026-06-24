# Correction — Deep Component Automation

> **⚠ NOT YET LIVE-VERIFIED.** Every selector and assertion in this component is
> **derived from the source templates** under
> `closify/KITABOO_Authoring/templates/Correction/` and from `config/config.js`.
> They have **not been executed against a running authoring instance**
> (`AUTHORING_LAUNCH_URL` was not available at authoring time). Expect to confirm
> a few class names / hover-toolbar selectors on first live run and adjust the
> Copy/Delete chrome selectors in `selectors.ts` if needed.

## Component identity (verified against `config/config.js`)

| Field | Value |
| --- | --- |
| Widget name | **Correction** |
| `dataType` | **`correction`** |
| Template URL | `templates/Correction/correction.html` |
| Settings URL | `templates/Correction/correction-settings.html` |
| Default JSON | `templates/Correction/default/correction.json` |
| Directive | `correction-template` (`App.directive('correctionTemplate', …)`) |
| `enableGroupInteractivity` | `true` |

## Drop mechanism

`correction` is listed in `support/module-setup.ts` → `ASSESSMENT_DATA_TYPES`, so
`resolveDropTarget('correction')` returns **`generic-step-column`**. The component
is dropped into a **Generic Step column** via
`cy.dropComponentForModule('Correction', { dataType: 'correction' })` — identical
to the Extended Response (`shortLongAns`) sibling, **not** the canvas-element flow
used by Text (`paragraph`).

Setup command: `cy.ensureCorrectionDeepSetup({ through, skipStepCreation })`
(`step` → just the Generic Step, `dropped` → widget dropped, `content` → dummy
sentence filled). Settings open via `cy.openCorrectionSettings()`.

## Source-derived facts

- **Header / Instruction**: `isHeaderVisible` & `isInstructionVisible` default
  `true` (`correction.json`). Toggled by `#header-visibility` / `#instr-visibility`
  checkboxes; canvas blocks switch `displayBlock` / `displayNone` via `ng-class`.
- **Sentences**: `addSentenceClick` pushes a Text Description into
  `fieldData.settings.correctionInfo`. `correction.js` sets `max_question = 10`,
  `min_question = 1`. Row delete (`.row-delete`) is `.disabled` when
  `correctionInfo.length === 1`.
- **Outline / Action Assets**: radios `outline` (No Outline) / `outlineBg`
  (Outline) bound to `currSettings.outline` (default `outline`); colour via
  `.colorPickerButton` + `.colorPickerInputBox` bound to `currSettings.Appearance`
  (default `#7eb1eb`).
- **Tags**: `<tag-manager>` inside `.tagsContainer`, rendered only when
  `currSettings.showText` (default `true`).
- **Find-and-fix markers**: `.correction-Popup` / `.correction-Popup1` host the
  Strikethrough (`.correction-Strik`) and delete-marker (`.popup-Delete`) buttons,
  activated by selecting a word in the sentence at runtime.

## ⚠ Source ambiguity (flagged)

`correction.html` puts a `btn-disabled` CSS class on the **Add Sentence** label when
`fieldData.TemplateData.correctionInfo.length >= 6`, but the active
`addSentenceClick` handler still pushes rows up to `max_question = 10` using a
**different path** (`fieldData.settings.correctionInfo`). The `>= 6` visual gate
references a `TemplateData` object that the default JSON does not populate, so the
**effective** behaviour is the script cap of **10**. `TC_18` asserts the
script-enforced cap (`<= 10`).

## Flag-gated controls (logged, not asserted)

- `#add-activity-restart` (Allow activity restart) and `#add-show-me` (Add Show Me)
  render only when `!currSettings.isGroupActivity`.
- Copy / Delete component controls come from the shared `add-common-hover` chrome,
  not Correction markup. The spec uses best-effort selectors and **logs + returns
  gracefully** when the hover toolbar is not mounted in the headless DOM.

## QC coverage (29 total → 14 automated, 15 deferred)

### Automated (authoring DOM)

| QC | What is asserted |
| --- | --- |
| TC_01 | Add Header & Add Instruction Text checked by default; both blocks `displayBlock` |
| TC_02 | Add Sentence present; Text Description 1 editable (contenteditable) |
| TC_03 | Multiple sentences added; delete enabled on extras; row deletes |
| TC_04 | No Outline / Outline radios switch; Action Assets colour input updates |
| TC_05 (author) | Sentence text + strikethrough/marker popups present in canvas DOM |
| TC_06 | Uncheck Add Header → Header block becomes `displayNone` |
| TC_07 | Uncheck Add Instruction Text → Instruction block becomes `displayNone` |
| TC_08 | `<tag-manager>` present in settings (graceful if `showText` false) |
| TC_11 | Special characters accepted in Text Description |
| TC_12 | Delete disabled for the only remaining sentence (`min_question = 1`) |
| TC_16 | Action Assets resilient to invalid colour input (panel stays intact) |
| TC_18 | Sentence count capped at `max_question = 10` |
| TC_22/TC_23 | Delete Component control present (red colour is visual) |
| TC_24/TC_25/TC_28 | Copy Component control present/clickable |

### Deferred (`it.skip` in Suite `32-Z`)

| QC | Why deferred |
| --- | --- |
| TC_05 | Strikethrough red line + correct answer in **Preview & Reader** |
| TC_09 | UI responsiveness across viewport sizes (visual) |
| TC_10 | Submit enabled only with required fields filled (Preview submit) |
| TC_13 | Submission works without Header/Instruction (Preview submit) |
| TC_14 | Submit disabled with empty Text Description 1 (Preview validation) |
| TC_15 | Long-text handled without UI break (visual/Preview) |
| TC_17 | Submit disabled when no sentences (Preview validation) |
| TC_19 | Accessibility — keyboard / screen reader |
| TC_20 | Rapid Save/Preview stability |
| TC_21 | Network disconnect error + recovery |
| TC_26 | "Copied successfully" success pop-up after copy (lifecycle) |
| TC_27 | Pop-up on multiple copy actions (lifecycle) |
| TC_29 | Copy control hidden/disabled when no component present (lifecycle) |

> TC_05 appears in **both** lists: its author-side presence is automated; its
> student-facing find-and-fix outcome (red line + correct answer in Preview/Reader)
> is deferred.

## Files

| File | Purpose |
| --- | --- |
| `selectors.ts` | Source-derived canvas + settings selectors and `CORRECTION_RULES` |
| `testdata.ts` | Reusable strings incl. `scriptInjection` |
| `commands.ts` | `ensureCorrectionDeepSetup`, `dropCorrectionIntoGenericStepColumn`, `fillCorrectionDummyContent`, `openCorrectionSettings` |
| `32-correction-deep.spec.ts` | Cypress spec (Suites 32-A … 32-H + deferred 32-Z) |
| `component.json` | Component metadata (`qcCount = 29`) |
| `correction-mapping.json` | TC_01…TC_29 → it() / deferred mapping (each once) |
