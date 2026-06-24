/// <reference types="cypress" />
// =============================================================================
// Table (tablesNew element) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                  (widget catalog: name "Table", dataType "tablesNew")
//   templates/tableNew/tables.html                    (canvas DOM)
//   templates/tableNew/tables-settings-panel.html     (settings panel)
//   templates/tableNew/default/tablesTemplate.json    (default field data + style_tab)
//   templates/tableNew/scripts/tablesTemplate-directive.js (directive: table-new-init / edittemplate)
//   templates/tableNew/scripts/resizable.js           (column resize)
//   templates/stylepanel.html                         (shared <stylepanel> markup)
//
// dataType = "tablesNew"; widget name = "Table"; directive = "table-new-init"
// (also `edittemplate`). Catalog url = templates/tableNew/tables.html.
// Settings panel id = "#table-settings-panel" (title "Table", icon .icon-Table-01).
//
// Source-driven facts:
//   • Table is an ELEMENT (not an assessment widget): "tablesNew" is NOT in
//     support/module-setup.ts ASSESSMENT_DATA_TYPES, so resolveDropTarget routes
//     it to the canvas — it drops onto the Instructions-for-Students page
//     (#desktop_view) via cy.dropComponent('Table'), NOT into a Generic Step.
//   • Canvas wrapper = `section.tablecomponent.tabletemplate` (has [edittemplate]
//     [table-new-init] [add-common-hover]). Standard framework wraps it in
//     `.customClass[data-type="tablesNew"]` / `.sd-item`.
//   • On first drop a jQuery-UI "Create Table" dialog (`.rows-columns-dialog`,
//     title `.edit-table-title` = "Create Table") opens with rows input
//     `#table-rows-input` (default 8, min 1, max 20) and cols `#table-cols-input`
//     (default 4, min 1, max 20). The dialog "Create" button is rendered by
//     jQuery-UI as `.table-ok-button` (text "Create"). After Create, the grid
//     renders into `table.tableNew` and fieldData.isTableCreated becomes true.
//   • Editable cells = `table.tableNew td` (children are contenteditable text
//     nodes) — use cy.setContentEditableOn, never cy.type().
//   • Header = `.table-template-header` (contenteditable, ng-model
//     fieldData.header) — only when settings.isHeaderVisible.
//   • Caption = `figcaption.template-caption` (placeholder "Enter caption text
//     here") — only when settings.optionalcaption.
//   • Right-click on a cell shows `.vmenu` with row/column buttons keyed by
//     [data-attr]: rowAbove/rowBelow/delRow, colLeft/colRight/delCol. Selecting
//     2+ cells then right-click shows `.margeMenu` ("Merge All"); a merged
//     master cell shows `.unmargeMenu` ("Unmerge").
//   • Styles are data-driven from settings.style_tab.stylesHolder (style1..style5);
//     each <stylepanel> button is `.stylebgdiv[id="styleN"] .styleBackground`
//     (active = .active-style). Default styleSelected = "style1".
//   • Settings checkboxes (ng-model): verticalLines (Show Vertical Lines),
//     optionalcaption (Show Caption), isHeaderVisible (Show Header),
//     isLabelTypeTable (Show Label Type), rowAlternate (Alternate Colors).
//   • Vertical Align radios name="table_alignment" (tabel_align_top default /
//     _middle / _bottom). Outline radios name="outline" (outline default /
//     outlineBg = "Outline with Fill Background", #daebed fill).
//   • FLAG-GATED / NOT RENDERED: "Show Horizontal Lines" is commented out in
//     tables-settings-panel.html (horizontal lines always on by default), and
//     Row-Header / per-cell colour pickers render only when styleSelected ==
//     'style5'. The spec degrades gracefully (log + return) for these.
// =============================================================================

export const TABLE_DATA_TYPE = 'tablesNew';
export const TABLE_WIDGET_NAME = 'Table';
export const TABLE_DIRECTIVE = 'table-new-init';

/** Authoring-canvas DOM (the dropped Table/tablesNew element). */
export const TABLE_CANVAS = {
  widget: `.customClass[data-type="${TABLE_DATA_TYPE}"], [data-type="${TABLE_DATA_TYPE}"], section.tablecomponent.tabletemplate`,
  /** The component <section> wrapper (table-new-init / edittemplate). */
  component: 'section.tablecomponent.tabletemplate, .component-holder.tablecomponent',
  sdItem: '#desktop_view .sd-item:has(section.tablecomponent), #desktop_view .sd-item:has([data-type="tablesNew"])',
  /** Rendered table grid (after Create). */
  table: 'table.tableNew',
  /** All cells of the rendered grid. */
  cells: 'table.tableNew td',
  rows: 'table.tableNew tr',
  /** Header title (only when settings.isHeaderVisible). */
  header: '.table-template-header',
  /** Caption (only when settings.optionalcaption). */
  caption: 'figcaption.template-caption',
  /** Label-type fields (only when isLabelTypeTable). */
  labelPrimary: '.tablecomponent .questionNoText',
  labelSecondary: '.tablecomponent .questionNoSecondaryText',
  /** Drop-time overlay shown until Create. */
  overlay: '.tableOverlay',
} as const;

/** "Create Table" jQuery-UI dialog (shown on first drop). */
export const TABLE_CREATE_DIALOG = {
  dialog: '.rows-columns-dialog',
  title: '.rows-columns-dialog .edit-table-title',
  rowsInput: '#table-rows-input',
  colsInput: '#table-cols-input',
  /** jQuery-UI renders the dialog button with this class + text "Create". */
  createButton: '.table-ok-button, .tableDialog button:contains("Create")',
} as const;

/** Right-click row/column context menu (.vmenu) + merge menus. */
export const TABLE_CONTEXT_MENU = {
  menu: '.vmenu',
  rowSection: '.vmenu .vmenuRowDiv',
  colSection: '.vmenu .vmenuColDiv',
  rowInsertAbove: '.vmenu [data-attr="rowAbove"]',
  rowInsertBelow: '.vmenu [data-attr="rowBelow"]',
  rowDelete: '.vmenu [data-attr="delRow"]',
  colInsertLeft: '.vmenu [data-attr="colLeft"]',
  colInsertRight: '.vmenu [data-attr="colRight"]',
  colDelete: '.vmenu [data-attr="delCol"]',
  mergeMenu: '.margeMenu',
  unmergeMenu: '.unmargeMenu',
} as const;

/** Settings panel DOM (#table-settings-panel). */
export const TABLE_SETTINGS = {
  panel: '#table-settings-panel',
  title: '#table-settings-panel .para-ellipsis',
  icon: '#table-settings-panel .icon-Table-01',

  // Styles (shared <stylepanel>)
  stylePanel: '#table-settings-panel .header-styles-panel',
  styleButtons: '#table-settings-panel .styleBackground',
  styleDivs: '#table-settings-panel .stylebgdiv[id]',

  // Checkboxes (ng-model on currSettings)
  showHeader: '#table-settings-panel input[ng-model="currSettings.isHeaderVisible"]',
  showLabelType: '#table-settings-panel input[ng-model="currSettings.isLabelTypeTable"]',
  labelPrimary: '#table-settings-panel input[name="labelType"][value="primary"]',
  labelSecondary: '#table-settings-panel input[name="labelType"][value="secondary"]',
  showVerticalLines: '#table-settings-panel input[ng-model="currSettings.verticalLines"]',
  showCaption: '#table-settings-panel input[ng-model="currSettings.optionalcaption"]',
  rowAlternate: '#table-settings-panel input[ng-model="currSettings.rowAlternate"]',

  // Vertical align radios (name="table_alignment")
  alignTop: '#table-settings-panel input[name="table_alignment"][value="tabel_align_top"]',
  alignCenter: '#table-settings-panel input[name="table_alignment"][value="tabel_align_middle"]',
  alignBottom: '#table-settings-panel input[name="table_alignment"][value="tabel_align_bottom"]',

  // Outline radios (name="outline")
  outlineNone: '#table-settings-panel input[name="outline"][value="outline"]',
  outlineFill: '#table-settings-panel input[name="outline"][value="outlineBg"]',
  outlineColorOptions: '#table-settings-panel .section-outline .colorOption .color',
  outlineBgColorInput: '#table-settings-panel #outlineBgColorInput',

  // Stroke / divider colour (only when styleSelected == 'style5')
  strokeColorInput: '#table-settings-panel #dividerColorInput',
  headerColorInput: '#table-settings-panel #headerColorInput',

  // FLAG-GATED — commented out in source (horizontal lines always on)
  showHorizontalLines: '#table-settings-panel input[ng-model="currSettings.horizontalLines"]',

  accessibilityPara: '#table-settings-panel .accessibilityPara',
} as const;

/** Source-verified style option names (style_tab.stylesHolder[].name → div id). */
export const TABLE_STYLES = {
  style1: 'style1',
  style2: 'style2',
  style3: 'style3',
  style4: 'style4',
  style5: 'style5',
} as const;

/** Source-verified business rules / defaults (from tablesTemplate.json). */
export const TABLE_RULES = {
  defaultRows: 8,
  defaultCols: 4,
  minRows: 1,
  minCols: 1,
  /** input max="20" on both rows + cols (tables.html). */
  maxRows: 20,
  maxCols: 20,
  defaultStyle: 'style1',
  defaultVerticalAlign: 'tabel_align_top',
  defaultOutline: 'outline',
  outlineFillColor: '#daebed',
  /** Defaults that ship true in tablesTemplate.json.settings. */
  verticalLinesDefaultOn: true,
  horizontalLinesDefaultOn: true,
  captionDefaultOn: true,
  headerDefaultVisible: true,
  widgetName: TABLE_WIDGET_NAME,
  dataType: TABLE_DATA_TYPE,
  directive: TABLE_DIRECTIVE,
} as const;
