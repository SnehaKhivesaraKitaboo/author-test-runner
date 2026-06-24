# Center Layout (layout-2) — Deep Automation

- **Component slug:** `center-layout`
- **dataType:** `layout-2` · **widget name:** `Center` · **directive:** `layout-template`
- **Spec:** `19-center-layout-deep.spec.ts`
- **QC authority:** `Author Test Cases - Center Layout.pdf` (TC_01–TC_67)
- **Source authority:**
  - `config/config.js` (catalog: name "Center", dataType "layout-2" — **verified**)
  - `templates/layouts/layout2.html`
  - `templates/layouts/layout-setting-panel.html`
  - `templates/layouts/default/layout.json`
  - `templates/layouts/scripts/layout-directive.js`

## Architecture notes (source-verified)

- **Center is a LAYOUT, not an assessment widget.** `layout-2` is absent from
  `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so it drops onto the
  **Instructions-for-Students** canvas (`#desktop_view`) via
  `cy.dropComponent('Center')` — **not** a Generic Step column.
- Canvas wrapper is `.customClass[data-type="layout-2"]` containing
  `.layout-container.layout-2` (`[layout-template]`).
- **2 equal columns:** both `.column.one-half` (template1 + template2),
  separated by `.vertical-divider`. Each column owns a `.column-content.editables`
  drop zone and an `.empty-droppable-text` placeholder.
- Clicking the `.sd-item` opens `#layout-template-setting` with a **Full Width**
  checkbox (`.layout-width-setup`); Full Width sets `data-pagemargin="fullwidth"`.
- **Nested child-drop rules** are enforced in `layout-directive.js` at runtime —
  not DOM-assertable, so those QC cases are deferred.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 15 | Drop, 2-column structure/count, drop-zone presence, settings (Full Width, no bg colour), divider, delete, security |
| Deferred | 52 | Bootstrap, nested child-drop rules, Preview/Reader/Publish, media/tables/math/languages, multipart, persistence, refresh, CLP |

## Run

```bash
npx cypress run --spec "components/center-layout/19-center-layout-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from `layout2.html` + `layout-setting-panel.html` +
> `layout-directive.js`. A single headed run will confirm the drop +
> settings-panel selectors.
