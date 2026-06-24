# Annotation (Highlight / Outline) — Deep Automation

- **Component slug:** `annotation`
- **dataType:** `annotationHighlightOutline` · **directive:** `annotation-template`
- **Widget name:** `Annotation`
- **Spec:** `27-annotation-deep.spec.ts`
- **QC authority:** `Author Test Cases - Annotation.pdf` (TC_01–TC_29)
- **Source authority:**
  - `config/config.js` (widget catalog: name `Annotation`, dataType `annotationHighlightOutline`)
  - `templates/annotation/annotation.html`
  - `templates/annotation/annotation-setting.html`
  - `templates/annotation/default/annotation.json`
  - `templates/annotation/scripts/annotation.js`

## Architecture notes (source-verified)

- **Drop target = canvas (element), not Generic Step.** `annotationHighlightOutline`
  is **absent** from `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so
  `resolveDropTarget` routes it to the canvas. It is dropped onto the
  Instructions-for-Students page (`#desktop_view`) via `cy.dropComponent('Annotation')`
  — the same element-drop primitive used by the **Text** component. Verified
  against `config/config.js`:
  `{ "name": "Annotation", ..., "dataType": "annotationHighlightOutline", "url": "templates/annotation/annotation.html", "settingsURL": "templates/annotation/annotation-setting.html" }`.
- Canvas container is **`.annotationContainer.annotationHighlightOutline.component-holder`**
  hosting the **`annotation-template`** directive.
- Two flag-gated sections:
  - **Highlight** (`#highlights-section`) — rendered when `settings.showHighlights` (default **true**).
  - **Outline** (`#outline-section`) — rendered when `settings.showOutline` (default **false**; the spec enables it via the settings toggle before asserting).
- Each section repeats `.label-row` entries, each with a `.color-button` (inline
  colour picker → `.color-option` swatches), a **contenteditable** `.text-input`
  label (set with `cy.setContentEditableOn`, never `cy.type()`), and a
  `.remove-button` shown **only when the section has more than one row**.
- **"+ Add Label"** (`.add-button`) appends a row; `addHighlight`/`addOutline`
  **hard-cap each section at 5** (`if (length >= 5) return`) and grey the button
  at 5 — this backs the TC_15 / TC_16 max-label cases.
- Settings panel root is **`.annotation-setting`** (title **"Annotation"**, icon
  `.icon-Image-labelling_number-01`) with **"Add Highlight"** / **"Add Outline"**
  toggles and an **Alt Text** textarea (`maxlength=2000`). The directive forces at
  least one type ON (`window.alert` if both are unchecked), so the "both off" path
  is a runtime alert rather than an authoring-DOM assertion.
- **No free-text annotation body exists in authoring.** The QC PDF's
  "select text → Annotate → type text → save", Reader-visibility, persistence,
  copy-paste-formatting, annotate-on-image, and screen-reader steps describe the
  **Reader/student runtime**. Authoring only configures the highlight/outline
  **label + colour catalogue** — so those QC cases are deferred.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 11 | Drop/placement, label content (normal/long/math/special), 5-label caps, edit/delete, blank handling, highlight+outline coexist, settings toggles + Alt Text, security |
| Deferred | 18 | Login/activity/Generic-Step bootstrap (TC_01–TC_09), copy-paste formatting, Reader/student annotate-on-selection, annotate-on-image, persistence, full a11y, Publish/Reader lifecycle |

## Why so many deferrals

QC TC_01–TC_09 are login / activity / Generic-Step-wizard **bootstrap** (handled
by the harness, not the Annotation element). The remaining deferrals (TC_14, TC_19,
TC_21–TC_23, TC_26–TC_29) target the **Reader/student annotate-on-selection
runtime** and **Publish/Reader** lifecycle, which live outside the authoring DOM.
All are marked `it.skip()` with explicit reasons in the spec and
`annotation-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/annotation/27-annotation-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from the templates and the `annotation-template` directive.
> A single live run will confirm the drop target, the `#highlights-section` /
> `#outline-section` DOM, the 5-label cap behaviour, and the settings-panel
> selectors (title/toggles/Alt Text).
