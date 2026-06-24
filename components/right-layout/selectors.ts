/// <reference types="cypress" />
// =============================================================================
// Right Layout (layout-3) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                   (catalog: name "Right", dataType "layout-3")
//   templates/layouts/layout3.html                     (canvas DOM — 2 columns)
//   templates/layouts/layout-setting-panel.html        (settings panel)
//   templates/layouts/default/layout.json              (default field data)
//   templates/layouts/scripts/layout-directive.js      (directive: layoutTemplate)
//
// VERIFIED against config.js (grep "layout"): widget name = "Right",
// dataType = "layout-3" (BOTH catalogs agree).
//
// Source-driven facts:
//   • Right is a LAYOUT (Layout section), NOT an assessment widget — "layout-3"
//     is absent from support/module-setup.ts ASSESSMENT_DATA_TYPES, so it drops
//     onto the Instructions-for-Students canvas (#desktop_view) via
//     cy.dropComponent('Right'), NOT a Generic Step column.
//   • Canvas wrapper = `.customClass[data-type="layout-3"]` containing
//     `.layout-container.layout-3` ([layout-template]).
//   • layout-3 has TWO columns: `.column.two-thirds` (template1, wide-first) +
//     `.column.one-third` (template2), separated by `.vertical-divider`.
//     (Mirror of layout-1 — wide column leads.)
//   • Each column has a `.column-content.editables` drop zone and an
//     `.empty-droppable-text` placeholder ("Drag Elements or Widgets").
//   • Clicking the .sd-item opens `#layout-template-setting` with a Full Width
//     checkbox (.layout-width-setup); Full Width sets data-pagemargin="fullwidth".
// =============================================================================

export const LAYOUT_DATA_TYPE = 'layout-3';
export const LAYOUT_WIDGET_NAME = 'Right';
export const LAYOUT_COLUMN_COUNT = 2;

/** Authoring-canvas DOM (the dropped Right layout). */
export const LAYOUT_CANVAS = {
  widget: `.customClass[data-type="${LAYOUT_DATA_TYPE}"], [data-type="${LAYOUT_DATA_TYPE}"]`,
  component: `.layout-container.${LAYOUT_DATA_TYPE}, [layout-template]`,
  sdItem: `#desktop_view .sd-item:has([data-type="${LAYOUT_DATA_TYPE}"]), #desktop_view .sd-item:has(.layout-container.${LAYOUT_DATA_TYPE})`,
  columns: `.layout-container.${LAYOUT_DATA_TYPE} .column.selector`,
  dropZones: `.layout-container.${LAYOUT_DATA_TYPE} .column-content.editables`,
  emptyDroppable: `.layout-container.${LAYOUT_DATA_TYPE} .empty-droppable-text`,
  /** layout-3 leads with the wide (two-thirds) column, then narrow (one-third). */
  columnWide: `.layout-container.${LAYOUT_DATA_TYPE} .column.two-thirds`,
  columnNarrow: `.layout-container.${LAYOUT_DATA_TYPE} .column.one-third`,
  divider: `.layout-container.${LAYOUT_DATA_TYPE} .vertical-divider`,
} as const;

/** Settings panel DOM (#layout-template-setting). */
export const LAYOUT_SETTINGS = {
  panel: '#layout-template-setting',
  title: '#layout-template-setting .templateName',
  icon: '#layout-template-setting .layout-setting-icon',
  fullWidth: '#layout-template-setting input.layout-width-setup',
  fullWidthLabel: '#layout-template-setting .common-radio-txt',
} as const;

/** Source-verified business rules / defaults. */
export const LAYOUT_RULES = {
  widgetName: LAYOUT_WIDGET_NAME,
  dataType: LAYOUT_DATA_TYPE,
  columnCount: LAYOUT_COLUMN_COUNT,
  /** layout-3 column widths: wide (2/3) first, then narrow (1/3). */
  columnWidths: ['two-thirds', 'one-third'] as const,
  oneItemPerColumn: true,
  noLayoutInLayout: true,
} as const;
