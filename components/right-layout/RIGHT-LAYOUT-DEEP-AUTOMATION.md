# Right Layout (layout-3) — Deep Automation

- **Component slug:** `right-layout`
- **dataType:** `layout-3` · **widget name:** `Right` · **directive:** `layout-template`
- **Spec:** `20-right-layout-deep.spec.ts`
- **QC authority:** `Author Test Cases - Right Layout.pdf` (TC_01–TC_67)
- **Source authority:**
  - `config/config.js` (catalog: name "Right", dataType "layout-3" — **verified**)
  - `templates/layouts/layout3.html`
  - `templates/layouts/layout-setting-panel.html`
  - `templates/layouts/default/layout.json`
  - `templates/layouts/scripts/layout-directive.js`

## Architecture notes (source-verified)

- **Right is a LAYOUT, not an assessment widget.** `layout-3` is absent from
  `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so it drops onto the
  **Instructions-for-Students** canvas (`#desktop_view`) via
  `cy.dropComponent('Right')` — **not** a Generic Step column.
- Canvas wrapper is `.customClass[data-type="layout-3"]` containing
  `.layout-container.layout-3` (`[layout-template]`).
- **2 columns:** `.column.two-thirds` (template1, wide-first) +
  `.column.one-third` (template2), separated by `.vertical-divider` — a mirror
  of layout-1 with the wide column leading. Each column owns a
  `.column-content.editables` drop zone and an `.empty-droppable-text` placeholder.
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
npx cypress run --spec "components/right-layout/20-right-layout-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from `layout3.html` + `layout-setting-panel.html` +
> `layout-directive.js`. A single headed run will confirm the drop +
> settings-panel selectors.
