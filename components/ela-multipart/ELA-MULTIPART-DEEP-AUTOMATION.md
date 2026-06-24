# ELA Multipart (Multipart Question / Group Activity) — Deep Automation

- **Component slug:** `ela-multipart`
- **Verified dataType:** `group-interactivity-template` · **directive:** `groupInteractivity`
- **Widget name:** `Multipart Question` (Widgets tab) · **alias:** `Group Activity`
- **Spec:** `41-ela-multipart-deep.spec.ts`
- **QC authority:** `Author Test Cases - ELA- Multipart.pdf` (TC_01–TC_155)
- **Source authority:**
  - `config/config.js` (Widgets catalog entry)
  - `templates/group-activity/group-activity.html`
  - `templates/group-activity/group-activity-settings.html`
  - `templates/group-activity/default/group-activity.json`
  - `templates/group-activity/scripts/group-activity-directive.js`
  - `templates/stylepanel.html`

> ⚠️ **NOT yet live-verified.** All selectors are derived from the source
> templates above; they have **not** been executed against a running authoring
> instance (`AUTHORING_LAUNCH_URL` was unavailable). A single headed run will
> confirm the container drop, the inner sub-question drop mechanism, and the
> settings-panel selectors.

## Verified dataType / name / mechanism

The QC catalog (`ela-multipart-testcases.json`) lists `dataType: "ela-multipart"`,
but that is an **auto-extracted placeholder** — there is **no** `ela-multipart`
widget in `config/config.js`. The real widget the QC suite exercises is:

| Field | Value (source-verified) |
|---|---|
| Catalog name | **Multipart Question** (alias **Group Activity**) |
| dataType | **`group-interactivity-template`** |
| directive | `groupInteractivity` (attribute `group-interactivity`) |
| template | `templates/group-activity/group-activity.html` |
| settings | `templates/group-activity/group-activity-settings.html` |

**Drop mechanism:** `group-interactivity-template` **is** in
`support/module-setup.ts` → `ASSESSMENT_DATA_TYPES`, so `resolveDropTarget`
routes the container into a **Generic Step column** (same path as Extended
Response / Correction). `cy.dropElaMultipartIntoGenericStepColumn` calls
`cy.dropComponentForModule('Multipart Question', { dataType: 'group-interactivity-template' })`.

> **Source ambiguity flagged:** `module-setup.ts` `NAME_TO_DATA_TYPE` maps the
> *name* `"ela multipart"` → `"ela-multipart"` (a non-assessment type that would
> route to the canvas). To land on the correct generic-step routing the commands
> deliberately drop by the **real widget name** `"Multipart Question"`, not the
> QC slug. `module-setup.ts` was **not** modified.

## Architecture notes (source-verified)

- **Container DOM:** outer wrapper **`.group-interactivity-container`**; the inner
  repeater host carries the **`group-interactivity`** attribute. Sub-question
  slots are **`.question-container`** (ng-repeat over
  `fieldData.settings.questionBank`). Empty slots render
  **`.empty-droppable-text`** ("Drag Assessment widget from right panel"); filled
  slots host the widget HTML in **`.save-html.column-content.editables`**.
- **Parts:** a fresh empty slot is auto-appended after each successful inner drop.
  `group-activity-directive.js` caps pushes at `questionBank.length < 35`
  (**effective max parts = 35**). Only widgets with `enableGroupInteractivity:true`
  (MCQ, FIB, …) are accepted inside the container.
- **Inner drop:** the framework's `cy.dropWidgetIntoGenericStep` targets the
  **outer** `.generic-step-column-content`, so sub-question drops are performed by
  **`cy.addElaMultipartPart`**, which invokes the multipart directive's own
  `onDropComplete` on its `[group-interactivity]` scope. It is **best-effort** —
  it logs + returns gracefully when the directive scope, the widget catalog, or
  an empty slot is unavailable in the headless DOM.
- **Settings panel:** shared id **`#fib-settings-panel`** (directive
  `group-interactivity-settings`, title **"Group Activity"**). Interactive
  Component yes/no radios → `currSettings.isInteractive` (default `yes`). Shuffle
  (`#add-shuftle-choices`), Background Color (`#grp-Background`) and Corner Radius
  (`#grp-CornerRadius`) checkboxes reveal dependent inputs. Outline radios
  `outline`/`outlineBg` → `currSettings.outline` (default `outline`); Action
  Assets colour → `#appearanceInput` (`currSettings.Appearance`, default
  `#7eb1eb`). Tags → `#metaTagsInput`.
- **Flag-gated controls** (spec degrades gracefully with log+return):
  - Header Background Color (`#headerBgColorInput`) — only when
    `styleClass == "workedExample"`.
  - Try Again (`#add-activity-restart`) / Show Me (`#add-show-me`) / Reset
    (`#btn-rest`) — only when `!isGradableActivity`.
  - Worked-Example Hide/Show bar (`.showhideButton`) — only for the
    `workedExample` style.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 38 | Container drop + inner slots, MCQ/FIB part add, Interactive, Shuffle, Background, Corner Radius, Outline, Action Assets, Tags, settings layout/styles, flag-gated presence, security |
| Deferred | 117 | Reader/Preview runtime, per-part-type regression, media, publishing/data-patch, persistence, a11y, responsiveness, cross-browser |
| **Total** | **155** | |

## Why so many deferrals

The 155-case QC suite is dominated by behaviour that lives **outside the
authoring DOM**:

- **Reader/Preview runtime** (TC_110–155): answer icons, scoring counts,
  submit-enable rules, outline highlighting, review mode, progress, timer,
  conditional navigation, reporting.
- **Per-part-type widget regression** (TC_10–49): "drag each widget into the
  multipart" — only MCQ (TC_25) and FIB (TC_27) are kept as DOM-assertable inner
  drops; the rest are deferred to per-widget suites + Reader.
- **Media/upload, publishing/data-patch, persistence-after-reload, accessibility,
  responsiveness, cross-browser.**

All deferrals are `it.skip()` with explicit reasons in the spec and
`ela-multipart-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/ela-multipart/41-ela-multipart-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
