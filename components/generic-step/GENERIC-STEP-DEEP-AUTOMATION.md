# Generic Step — Deep Automation

- **Component slug:** `generic-step`
- **dataType / identifier:** `GenericStep`
- **Spec:** `43-generic-step-deep.spec.ts`
- **QC authority:** `Author Test Cases - Generic Step.pdf` (TC_01–TC_113)
- **Source authority:**
  - `index.html` — step chooser (`#widget-popup`), metadata wizard (`#formsModal`), TOC step rows + per-step menu, keyword tags + Levels of Support
  - `templates/generic-step/generic-step.html` — step canvas container + column drop zones
  - `templates/generic-step/generic-step-settings.html` — step settings panel
  - `templates/generic-step/scripts/generic-step-directive.js` — drop behavior (`onDropComplete`, `pastecomp`)
  - `templates/generic-step/default/generic-step.json` — default settings

> ⚠️ **Not yet live-verified** against a running authoring instance — all
> selectors are source-derived from the files above. A single run with a valid
> `AUTHORING_LAUNCH_URL` will confirm the chooser/wizard/canvas/settings
> selectors.

## Scope

This component is about the **Generic STEP itself** — not a dropped widget. It
covers:

- Opening the **step chooser/tray** and confirming the Generic Step card.
- Creating a Generic Step via the **metadata wizard** (required Step Title
  validation, Basic Info / Levels tabs, keyword tags, cancel).
- The Generic Step **canvas** — column drop zones and the empty-slot prompt.
- Dropping an assessment widget into a **column drop zone**.
- The Generic Step **settings panel** — background colour, pattern, alt text.
- The **TOC lifecycle** — Levels of Support tags, Edit Metadata, Delete.
- A **security** check (alt-text script injection is inert).

## Architecture notes (source-verified)

- **Step chooser** is `#widget-popup` (title `Choose a step`). The Generic Step
  card lives under `.hover-div`/`.step-text`. It is opened from the TOC
  `+ Add` toggle (`#add-page-dropdown.removeAddPreview`) → `Add New Step`
  (`#StepWidgetBtm`), with `.addStepBtn .addNewPageToc` as a fallback.
- **Metadata wizard** is `#formsModal` with tabs **Basic Info / Levels /
  Instructions**. **Step Title** (`#title`, `ng-model="stepTitle"`) is required:
  `#nextBtn` carries `ng-class` `disabledBtn` while `!stepTitle`. Keyword Tags
  live in `#tag-container` (`#tag` input, list `#tag-list li span`). A
  `Generic step` keyword tag is expected to be auto-added (TC_09); the spec logs
  gracefully if the build does not pre-populate it. New steps get the **fixed
  LoS `Core`**.
- **Canvas container** is `.generic-step-container[generic-step-template]`
  (toggles `questionsAdded`/`questionsEmpty`). Each slot is
  `.generic-step-question-container[question-index]` with drop zone
  `.generic-step-column-content` (`ng-drop="true"`). Empty slots show
  `.generic-step-empty-droppable-text` → **"Drag Assessment widget from right
  panel"** (a single `span`, `ng-if` toggled with the "Paste Here" state).
  `questionBank` auto-grows a new empty slot only while `length < 15`.
- **Settings panel** is `#generic-step-settings-panel` (title `Generic Step`):
  - **Background Color** — `#bgColorInput.colorPickerInputBox` (default `#fff`).
  - **Add Pattern** — checkbox `#caption-option`
    (`ng-model="currSettings.isBgPatternActive"`) reveals
    `.icons-container .icons-item`.
  - **Accessibility / Alt Text** — `textarea[ng-model="currSettings.altText"]`,
    `maxlength=2000`, label `Chars 2000`.
  - **TC_113** (multipart background colour) maps to the same `bgColor` model.
- **Per-step TOC kebab menu** (`.tocMenuDiv` → `.tocPageIconMenu`): **Clone New
  Level** (`tocSectionClonePopup`), **Edit Metadata** (`tocSectionEditPopup` →
  wizard edit mode), **Delete** (`tocSectionDeletePopup`, gated by
  `canDeletePage`).

## Reused framework helpers (NOT redefined)

From `support/`:

- `cy.openAuthoringTool` — launch + editor readiness.
- `cy.createTestStep('GenericStep')` — full chooser → wizard → save pipeline.
- `cy.ensureOnFibGenericStep` — navigate to the automation Generic Step in TOC.
- `cy.waitForGenericStepCanvasReady` — column + questionBank readiness.
- `cy.dropComponentForModule` — drop an assessment widget into a column.
- `cy.captureLiveStep` — live-preview screenshots.

Component-local helpers added in `commands.ts` (no duplication of the above):
`ensureGenericStepDeepSetup`, `openGenericStepChooser`, `closeGenericStepChooser`,
`openGenericStepWizard`, `openGenericStepSettings`, `openGenericStepTocMenu`,
`dropSampleWidgetIntoGenericStep`.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 17 | Launch/entry, step chooser/tray, wizard validation + tabs + keyword tag, end-to-end create, column drop zones, widget drop, single drag-assessment message, settings (bg colour / pattern / alt text), edit metadata, delete step, security |
| Deferred | 96 | Per-widget/element/layout authoring, sketchpad/CLIC + math rendering, copy/paste + flexi/sample layers, drop-boundary restrictions, Preview/Reader/CLP, persistence-after-reload |

**Automated TCs:** TC_01, TC_02, TC_03, TC_04, TC_05, TC_06, TC_07, TC_08,
TC_09, TC_94, TC_95, TC_96, TC_104, TC_110, TC_111, TC_112, TC_113.

## Why so many deferrals

The QC suite is dominated by **per-widget and per-element authoring behaviors**
(layouts, Title/Text/Image/Audio/Video, MCQ/FIB/MTP/Carousel/etc.), **CLIC
sketchpad + math** rendering, **copy/paste / flexi / sample-layer** flows,
**drag-boundary** restrictions that are not deterministically checkable from the
step DOM, and **Preview/Reader/CLP/persistence** validation. These are
intentionally `it.skip()` with explicit reasons in the spec and
`generic-step-mapping.json`. The automated set focuses on what is reliably
verifiable in the authoring DOM for the **step itself**.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/generic-step/43-generic-step-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
