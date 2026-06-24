# Flexi Layout (layout-7) — Deep Automation

- **Component slug:** `flexi-layout`
- **dataType:** `layout-7` · **widget name:** `Flexi` · **directive:** `layout-flexi-template`
- **Spec:** `23-flexi-layout-deep.spec.ts`
- **QC authority:** `Author Test Cases - Flexi Layout.pdf` (TC_01–TC_87)
- **Source authority:**
  - `config/config.js` (catalog: name "Flexi", dataType "layout-7", `isDroppable: true` — **verified**)
  - `templates/layout-flexi/flexi-layout.html`
  - `templates/layout-flexi/flexi-layout-setting-panel.html`
  - `templates/layout-flexi/default/flexi-layout.json`
  - `templates/layout-flexi/scripts/flexi-layout-directive.js`

## Architecture notes (source-verified)

- **Flexi is a LAYOUT, not an assessment widget.** `layout-7` is absent from
  `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so it drops onto the
  **Instructions-for-Students** canvas (`#desktop_view`) via
  `cy.dropComponent('Flexi')` — **not** a Generic Step column.
- Uses `templates/layout-flexi/` (NOT `templates/layouts/`). Canvas wrapper is
  `.customClass[data-type="layout-7"]` containing `.layout-container.layout-7`
  (`[layout-flexi-template]`).
- **DYNAMIC columns.** `.flexi-columns > .column.flexi-section`, one per
  `fieldData.settings.flexiData` entry, width = `section.width%`. `flexiData`
  starts empty, so a **separator-count dialog**
  (`.tableGO-rows-columns-dialog`, shown when `fieldData.noOfRows < 0`) prompts
  for vertical separators; `.icon-Up`/`.icon-Down` step the count and the
  **Create** button (`onSeparatorCreate`, `name="ok-button"`) builds the columns.
  The `createFlexiColumns` command drives this; it no-ops if the build
  auto-creates columns.
- Each column → `.flexi-column` → `.question-container-box.flexi-container-box`
  → `.question-container` slots with `.column-content.flexi-box.editables` drop
  zones and `.empty-droppable-text.flexi-empty-draggble` placeholders.
- Settings panel is `#layout-flexi-template-setting`: a **Column Ratio** section
  with per-column editable % boxes (`#row-{{$index}}`) + **Update** button, a
  **Full Width** checkbox, and an **Alt Text** textarea (maxlength **2000**).

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 16 | Drop, separator dialog (count/steppers/Create), dynamic column creation, drop zones, settings (Column Ratio, Full Width, Alt Text maxlength), dividers, delete, security |
| Deferred | 71 | Bootstrap, runtime ratio input-validation, nested child-drop rules, runtime resize/column-delete, Preview/Reader/Publish, media/tables/math/languages, multipart, persistence, refresh, CLP |

## Why so many deferrals

The flexi QC suite is heavy on **runtime input validation** of the column-ratio
boxes (alphabets / decimals / negatives / 3-digit / min-10% / auto-adjust /
total-100%), **runtime resize and column deletion** (right-click flows),
**nested drops**, and the **Preview / Reader / Publish** lifecycle. Those need
flows outside the authoring DOM (or runtime drag/validation not DOM-assertable)
and are marked `it.skip()` with explicit reasons in the spec and
`flexi-layout-mapping.json`.

## Run

```bash
npx cypress run --spec "components/flexi-layout/23-flexi-layout-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from `flexi-layout.html` + `flexi-layout-setting-panel.html`
> + `flexi-layout-directive.js`. A single headed run will confirm the drop, the
> separator dialog, dynamic-column and settings-panel selectors.
