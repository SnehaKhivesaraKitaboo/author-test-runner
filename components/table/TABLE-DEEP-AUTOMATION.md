# Table (tablesNew) — Deep Automation

> ⚠️ **NOT YET LIVE-VERIFIED.** All selectors and flows are **derived** from the
> KITABOO_Authoring source (`config/config.js` + `templates/tableNew/*`) and
> mirror the verified **Text** element pattern. They have **not** been executed
> against a running `AUTHORING_LAUNCH_URL`. Run `10-table-deep.spec.ts` once
> against the live Studio environment and adjust any selectors that drift
> (especially the jQuery-UI "Create" dialog button class and the `.vmenu`
> right-click overlay) before treating coverage as verified.

- **Component slug:** `table`
- **dataType:** `tablesNew` · **directive:** `table-new-init` (also `edittemplate`)
- **Widget name:** `Table` · **Catalog url:** `templates/tableNew/tables.html`
- **Spec:** `10-table-deep.spec.ts`
- **QC authority:** `Author Test Cases - Table.pdf` (TC_01–TC_88)
- **Source authority:**
  - `config/config.js`
  - `templates/tableNew/tables.html`
  - `templates/tableNew/tables-settings-panel.html`
  - `templates/tableNew/default/tablesTemplate.json`
  - `templates/tableNew/scripts/tablesTemplate-directive.js`
  - `templates/stylepanel.html`

## Verified source facts

- **config.js** entry: `{ name: "Table", iconClass: "icon-Table-01", dataType:
  "tablesNew", url: "templates/tableNew/tables.html", json:
  "templates/tableNew/default/tablesTemplate.json", settingsURL:
  "templates/tableNew/tables-settings-panel.html", isDroppable: true }`.
- **Table is an ELEMENT, not an assessment widget.** `tablesNew` is absent from
  `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so `resolveDropTarget`
  routes it to the **canvas** — it drops onto **Instructions for Students**
  (`#desktop_view`) via `cy.dropComponent('Table')`, **not** a Generic Step.
- **Canvas wrapper:** `section.tablecomponent.tabletemplate` (carries
  `[edittemplate][table-new-init][add-common-hover]`), wrapped by the framework
  in `.customClass[data-type="tablesNew"]` / `.sd-item`.
- **Create flow:** first drop opens a jQuery-UI **"Create Table"** dialog
  (`.rows-columns-dialog`, title `.edit-table-title`) with `#table-rows-input`
  (default **8**, min 1, **max 20**) and `#table-cols-input` (default **4**, min
  1, **max 20**). Confirming the dialog button (`.table-ok-button`, text
  "Create") sets `fieldData.isTableCreated` and builds `table.tableNew`.
- **Editable cells:** `table.tableNew td` (contenteditable children) — set via
  `cy.setContentEditableOn`, never `cy.type()`.
- **Header:** `.table-template-header` (ng-model `fieldData.header`, only when
  `settings.isHeaderVisible`). **Caption:** `figcaption.template-caption`
  (placeholder "Enter caption text here", only when `settings.optionalcaption`).
- **Row/column edits:** right-click a cell → `.vmenu` with `[data-attr]` buttons
  `rowAbove` / `rowBelow` / `delRow` and `colLeft` / `colRight` / `delCol`.
  Multi-cell drag selection (`.tableDataSelected`) then right-click shows
  `.margeMenu` ("Merge All"); a merged master cell shows `.unmargeMenu`.
- **Settings panel:** `#table-settings-panel` (title "Table", icon
  `.icon-Table-01`). **Styles** are data-driven from
  `settings.style_tab.stylesHolder` (`style1`..`style5`) via shared
  `<stylepanel>` → `.stylebgdiv[id="styleN"] .styleBackground` (active =
  `.active-style`; default `styleSelected = "style1"`).
- **Settings checkboxes** (`ng-model` on `currSettings`): `verticalLines`
  (Show Vertical Lines, default ON), `optionalcaption` (Show Caption, default
  ON), `isHeaderVisible` (Show Header, default ON), `isLabelTypeTable` (Show
  Label Type), `rowAlternate` (Alternate Colors). **Vertical Align** radios
  `name="table_alignment"` (`tabel_align_top` default / `_middle` / `_bottom`).
  **Outline** radios `name="outline"` (`outline` default = "No Outline" /
  `outlineBg` = "Outline with Fill Background", `#daebed` fill).

## Flag-gated / not rendered (graceful log + return)

- **"Show Horizontal Lines"** is **commented out** in
  `tables-settings-panel.html` — horizontal lines are always enabled by default,
  so the control is not rendered (TC_24/25/51/52 degrade gracefully).
- **Row-Header direction** + per-cell colour pickers (header / stroke / cell
  text) render **only when `currSettings.styleSelected == 'style5'`**
  (TC_32/59 select style5 first, then degrade if still absent).
- The **`.vmenu`** right-click overlay and **merge** menus are
  selection/right-click-driven and may not mount in a headless context — the
  row/column/merge specs assert control presence and log + return otherwise.

## Source ambiguity / QC vs source divergence

Several QC colour assertions do **not** match the shipped
`tablesTemplate.json` defaults, so they are **deferred** (best verified in
Preview/Reader against the live theme rather than the authoring DOM):

| QC | QC colour | Shipped default | Notes |
|---|---|---|---|
| TC_15/43 | header `#005A9C` | `headerTitleColor #ffffff`, `headerColor #CFBA99` | theme-dependent |
| TC_16/44 | row header `#C2E5FF` | n/a in defaults | theme-dependent |
| TC_17/45 | cell `#ffffff` | `rowAlternateColor1 #faf8f5` | alternate-colours ON by default |
| TC_20/47 | stroke `#B7B7BD` | `dividerColor #ccc` | computed-colour |
| TC_18 | cell text `#176299` | `ContentCellTextColor #333` | computed-colour |
| TC_31/58 | fill `#daebed` | colour-picker driven | apply verified in Preview |

QC also references "math activity" and an "Offline step" in the bootstrap cases
(TC_01–TC_09); these are harness/activity-creation concerns, not Table-element
assertions.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 45 | Drop, Create dialog (defaults / custom / max=20), grid presence, styles, settings toggles, vertical align, outline, cell content entry, row/column controls, merge controls, copy/delete, security |
| Deferred | 43 | Login/activity/step bootstrap, paste-from-Excel, Math equation, Preview/Reader, undo, persistence-after-reload + style-switch retention, keyboard-nav a11y, repeated-delete-to-one edges, computed-colour/theme assertions |

See `table-mapping.json` for the per-TC mapping (every TC_01–TC_88 appears once).

## Run

```bash
# headed, single spec
npx cypress run --spec "components/table/10-table-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
