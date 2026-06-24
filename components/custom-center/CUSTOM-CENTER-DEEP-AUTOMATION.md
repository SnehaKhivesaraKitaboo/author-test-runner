# Custom Center Layout (layout-6) — Deep Automation

- **Component slug:** `custom-center`
- **dataType:** `layout-6` · **widget name:** `Custom Center` · **directive:** `layout-template`
- **Spec:** `22-custom-center-deep.spec.ts`
- **QC authority:** `Author Test Cases - Custom Center.pdf` (TC_01–TC_67)
- **Source authority:**
  - `config/config.js` (catalog: name "Custom Center", dataType "layout-6" — **verified**)
  - `templates/layouts/layout6.html`
  - `templates/layouts/layout-setting-panel.html`
  - `templates/layouts/default/layout.json`
  - `templates/layouts/scripts/layout-directive.js`

## Source ambiguity — resolved

The docs guessed `layout-6` for Custom Center. **This is correct.**
`config/config.js` (both catalogs) maps `Custom Center` → `layout-6`. The
adjacent `layout-5` is a *separate* widget named **"Three Column"** (out of
scope), so there is no confusion between the two.

## Architecture notes (source-verified)

- **Custom Center is a LAYOUT, not an assessment widget.** `layout-6` is absent
  from `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so it drops onto the
  **Instructions-for-Students** canvas (`#desktop_view`) via
  `cy.dropComponent('Custom Center')` — **not** a Generic Step column.
- Canvas wrapper is `.customClass[data-type="layout-6"]` containing
  `.layout-container.custome-layout.layout-6` (`[layout-template]`).
- **Structurally different from layout-1..4.** Two `.column.one-half` columns,
  but each holds a `.question-container-box` with `.question-container` slots
  driven by `fieldData.settings.questionBank` (left) / `questionBank2` (right).
  Drop zones are `.column-content.first-box` (left, `onDropComplete` `boxNo=0`)
  and `.column-content.second-box` (right, `boxNo=1`).
- Clicking the `.sd-item` opens `#layout-template-setting` with a **Full Width**
  checkbox (`.layout-width-setup`); Full Width sets `data-pagemargin="fullwidth"`.
- **Nested child-drop rules** are enforced in `layout-directive.js` at runtime —
  not DOM-assertable, so those QC cases are deferred.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 15 | Drop, 2-column / question-bank structure, first-box+second-box drop zones, settings (Full Width, no bg colour), divider, delete, security |
| Deferred | 52 | Bootstrap, nested child-drop rules, Preview/Reader/Publish, media/tables/math/languages, multipart, persistence, refresh, CLP |

## Run

```bash
npx cypress run --spec "components/custom-center/22-custom-center-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from `layout6.html` + `layout-setting-panel.html` +
> `layout-directive.js`. A single headed run will confirm the drop +
> settings-panel selectors.
