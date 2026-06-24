# Thumbs Card Header (thumbcard) — Deep Automation

- **Component slug:** `thumbcard`
- **dataType:** `thumbs-card-header` · **widget name:** `Thumbs Card Header` · **directive:** `thumbs-card-header-template`
- **Spec:** `38-thumbcard-deep.spec.ts`
- **QC authority:** `Author Test Cases - Thumbcard.pdf` (TC_01–TC_38)
- **Source authority:**
  - `config/config.js` (widget catalog: `name: "Thumbs Card Header"`, `dataType: "thumbs-card-header"`, **flag-gated** `"thumbs-card-header": false` for most subjects)
  - `templates/thumbs-card-header/thumbs-card-header.html`
  - `templates/thumbs-card-header/thumbs-card-header-settings-pannel.html`
  - `templates/thumbs-card-header/default/thumbs-card-header.json`
  - `templates/thumbs-card-header/scripts/thumbs-card-header-directive.js`
  - `templates/thumbs-card-header/styles/thumbs-card-header-template.css`

## ⚠️ Verified dataType / name (QC catalog mismatch)

The QC catalog (`thumbcard-testcases.json`) lists `dataType: "thumbcard"`. The
**config.js widget catalog is the source of truth**, and it defines the widget
as `name: "Thumbs Card Header"`, `dataType: "thumbs-card-header"`. This
automation uses the **source-verified** values; `thumbcard` is only the
test-runner folder slug.

## Element vs assessment widget (drop mechanism)

Thumbs Card Header is an **element**, not an assessment widget.
`thumbs-card-header` is **not** in `support/module-setup.ts`
`ASSESSMENT_DATA_TYPES`, so `resolveDropTarget` returns `'canvas'`. The
component is dropped onto the **Instructions-for-Students** page
(`#desktop_view`) via the existing `cy.dropComponent('Thumbs Card Header')`
primitive (matching the catalog widget by name) — it is **not** dropped into a
Generic Step column. `cy.ensureThumbcardDeepSetup` mirrors the Text sibling's
canvas-drop contract.

## ⚠️ Flag-gated widget

In `config.js`, `"thumbs-card-header"` is `false` for most subjects/modules and
`true` for only a few. When the active catalog does not offer the widget,
`dropThumbcardIntoCanvas` logs + returns gracefully and every canvas/settings
test short-circuits via the `ifThumbcardPresent(...)` guard (log + return) — no
hard failure.

## ⚠️ Single-header source vs. QC "card" wording (source ambiguity)

The QC catalog repeatedly references **multiple cards** ("add/remove cards",
"card link"), a **"Rounded Corners Text Box"**, and **navigation runtime**. The
real source DOM is a **single header**: one fixed icon + one contenteditable
heading. There is **no** multi-card grid, **no** add/remove-card control, **no**
per-card link, and **no** separate "Rounded Corners Text Box" element. The
automation therefore:

- maps the QC "plain text" / "Rounded Corners Box" cases (TC_37/TC_38) to the
  **single editable heading** (`.thumbs-card-header-heading.editables`), noting
  the heading is a full RTE field (not a plain-text-only box), and
- exposes `cy.addThumbcardCard()` which **logs that no add-card control exists**
  rather than inventing a selector.

## Architecture notes (source-verified)

- Canvas wrapper: **`section.thumbs-card-header[thumbs-card-header-template]`** →
  inner **`.thumbs-card-container`** (carries `ng-style` `headerBgColor` /
  `headerStrokeColor`).
- Fixed icon: **`img.thumbs-card-header-icon`** inside
  `.thumbs-card-header-icon-span`. `src` is data-driven from
  `settings.thumbsCardIcons[thumbsCardActiveIcons].icon`. The img has **no**
  `contenteditable` and **no** `ng-click` → not user-editable (TC_10).
- Editable heading: **`.thumbs-card-header-heading.editables`**
  (`contenteditable`, `ng-model="fieldData.introductionText"`,
  `math-read-only-field`) — set via **`cy.setContentEditableOn`**, never
  `cy.type()`.
- Settings panel: **`.thumbs-card-header-setting`**, title **"Thumbs Card
  Header"**, icon `.icon-Thumbs-Card-Header1.settings-icon`. Exposes:
  - **two selectable thumbs icons** (`.icons-item` over
    `currSettings.thumbsCardIcons`; active item gets `.active`),
  - **Background Color** (`#headerBgColorInput`, source default `#FFF1D0`),
  - **Stroke Color** (`#headerStrokeColorInput`, source default `#FFFFFF`),
  - **Alt Text** textarea (`maxlength=2000`).
- RTE formatting / math live in the shared floating `textEditor` toolbar (the
  directive injects `#textEditorBox` / `text-editor-panel` on focus). Control
  presence/entry is automated; the **applied render** is a Preview/Reader check
  (deferred).

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 16 | Drop + settings panel, fixed icon present + not editable, two selectable thumbs icons + active toggle, default bg colour input, stroke + alt-text (2000 limit), heading plain-text + line-break entry, contenteditable RTE field, long-content layout, security |
| Deferred | 22 | Login/activity bootstrap (TC_01–03), persistence-after-reload (TC_12/17/18/19/26/31), Preview/Reader/CLP/Publish/saLTIre (TC_20–28), cross-browser (TC_29/30), Figma match (TC_32), math+format RENDER (TC_33/34) |

(Honest split — every QC TC_01–TC_38 appears exactly once in
`thumbcard-mapping.json`.)

## Why these deferrals

QC TC_01–TC_03 are **login → create activity → start authoring** bootstrap
(handled by `cy.openAuthoringTool`). The rest require flows outside the
authoring DOM: **persistence after reload/save/republish**,
**Preview / CLP / Reader / Publish / saLTIre** rendering and submission,
**cross-browser** runs, **Figma** visual comparison, and **math/format render**
(vs. the contenteditable-presence that is automated). All are `it.skip()` with
explicit reasons in the spec and `thumbcard-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/thumbcard/38-thumbcard-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from the templates above, and the widget is **flag-gated**
> (`"thumbs-card-header": false` in most subjects). A single run on a subject
> where the flag is `true` will confirm the element drop onto the canvas + the
> `.thumbs-card-header-setting` selectors.
