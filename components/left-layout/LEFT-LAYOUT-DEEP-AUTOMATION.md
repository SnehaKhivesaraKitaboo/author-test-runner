# Left Layout (layout-1) — Deep Automation

- **Component slug:** `left-layout`
- **dataType:** `layout-1` · **widget name:** `Left` · **directive:** `layout-template`
- **Spec:** `18-left-layout-deep.spec.ts`
- **QC authority:** `Author Test Cases - Left Layout.pdf` (TC_01–TC_67)
- **Source authority:**
  - `config/config.js` (catalog: name "Left", dataType "layout-1" — **verified**, both catalogs agree)
  - `templates/layouts/layout1.html`
  - `templates/layouts/layout-setting-panel.html`
  - `templates/layouts/default/layout.json`
  - `templates/layouts/scripts/layout-directive.js`

## Architecture notes (source-verified)

- **Left is a LAYOUT, not an assessment widget.** `layout-1` is absent from
  `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so the framework routes it
  to the canvas. It is dropped onto the **Instructions-for-Students** page
  (`#desktop_view`) via `cy.dropComponent('Left')` — **not** a Generic Step
  column. This mirrors the `Text` element convention.
- Canvas wrapper is `.customClass[data-type="layout-1"]` containing
  `.layout-container.layout-1` (`[layout-template]`).
- **2 columns:** `.column.one-third` (template1) + `.column.two-thirds`
  (template2), separated by `.vertical-divider`. Each column owns a
  `.column-content.editables` drop zone and an `.empty-droppable-text`
  placeholder ("Drag Elements or Widgets").
- Clicking the `.sd-item` runs `con.setSettingsValues($('#target'),'settings')`
  and sets `currSettings.templateName='Left'`; the settings panel is
  `#layout-template-setting` with a **Full Width** checkbox
  (`.layout-width-setup`). Full Width sets `data-pagemargin="fullwidth"` on the
  layout `.sd-item`.
- **Nested child-drop rules** (one element/widget per column; no
  layout-inside-layout) are enforced in `layout-directive.js`
  (`onDropComplete` / `isDroppable` guards) at runtime — **not DOM-assertable**,
  so those QC cases are deferred.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 15 | Drop, 2-column structure/count, drop-zone presence, settings (Full Width, no bg colour), divider, delete, security |
| Deferred | 52 | Bootstrap, nested child-drop rules, Preview/Reader/Publish, media/tables/math/languages, multipart, persistence, refresh, CLP |

## Why so many deferrals

The QC suite is dominated by **runtime nesting** (dropping elements/widgets/
multipart/media/tables/math into columns, then deleting them), **Preview /
Reader / Publish** lifecycle, **persistence-after-reload**, and **special
languages**. Those need flows outside the authoring DOM (or runtime drag-drop
rejection that is not DOM-assertable) and are marked `it.skip()` with explicit
reasons in the spec and `left-layout-mapping.json`.

## Run

```bash
npx cypress run --spec "components/left-layout/18-left-layout-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from `layout1.html` + `layout-setting-panel.html` +
> `layout-directive.js`. A single headed run will confirm the drop +
> settings-panel selectors.
