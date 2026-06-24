# Four Column Layout (layout-4) — Deep Automation

- **Component slug:** `four-column`
- **dataType:** `layout-4` · **widget name:** `Four Column` · **directive:** `layout-template`
- **Spec:** `21-four-column-deep.spec.ts`
- **QC authority:** `Author Test Cases - Four column.pdf` (TC_01–TC_67)
- **Source authority:**
  - `config/config.js` (catalog: name "Four Column", dataType "layout-4" — **verified**)
  - `templates/layouts/layout4.html`
  - `templates/layouts/layout-setting-panel.html`
  - `templates/layouts/default/layout.json`
  - `templates/layouts/scripts/layout-directive.js`

## Architecture notes (source-verified)

- **Four Column is a LAYOUT, not an assessment widget.** `layout-4` is absent
  from `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so it drops onto the
  **Instructions-for-Students** canvas (`#desktop_view`) via
  `cy.dropComponent('Four Column')` — **not** a Generic Step column.
- Canvas wrapper is `.customClass[data-type="layout-4"]` containing
  `.layout-container.layout-4` (`[layout-template]`).
- **4 equal columns:** all `.column.one-fourth` (template1..template4), each
  followed by a `.vertical-divider`. Each column owns a `.column-content.editables`
  drop zone and an `.empty-droppable-text` placeholder.
- Clicking the `.sd-item` opens `#layout-template-setting` with a **Full Width**
  checkbox (`.layout-width-setup`); Full Width sets `data-pagemargin="fullwidth"`.
- **Nested child-drop rules** are enforced in `layout-directive.js` at runtime —
  not DOM-assertable, so those QC cases are deferred.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 15 | Drop, 4-column structure/count, drop-zone presence, settings (Full Width, no bg colour), dividers, delete, security |
| Deferred | 52 | Bootstrap, nested child-drop rules, Preview/Reader/Publish, media/tables/math/languages, multipart, persistence, refresh, CLP |

## Run

```bash
npx cypress run --spec "components/four-column/21-four-column-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from `layout4.html` + `layout-setting-panel.html` +
> `layout-directive.js`. A single headed run will confirm the drop +
> settings-panel selectors.
