/// <reference types="cypress" />
// =============================================================================
// Center Layout (layout-2) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                   (catalog: name "Center", dataType "layout-2")
//   templates/layouts/layout2.html                     (canvas DOM — 2 equal columns)
//   templates/layouts/layout-setting-panel.html        (settings panel)
//   templates/layouts/default/layout.json              (default field data)
//   templates/layouts/scripts/layout-directive.js      (directive: layoutTemplate)
//
// VERIFIED against config.js (grep "layout"): widget name = "Center",
// dataType = "layout-2" (BOTH catalogs agree).
//
// Source-driven facts:
//   • Center is a LAYOUT (Layout section), NOT an assessment widget — "layout-2"
//     is absent from support/module-setup.ts ASSESSMENT_DATA_TYPES, so it drops
//     onto the Instructions-for-Students canvas (#desktop_view) via
//     cy.dropComponent('Center'), NOT a Generic Step column.
//   • Canvas wrapper = `.customClass[data-type="layout-2"]` containing
//     `.layout-container.layout-2` ([layout-template]).
//   • layout-2 has TWO EQUAL columns: both `.column.one-half` (template1 +
//     template2), separated by `.vertical-divider`.
//   • Each column has a `.column-content.editables` drop zone and an
//     `.empty-droppable-text` placeholder ("Drag Elements or Widgets").
//   • Clicking the .sd-item opens `#layout-template-setting` with a Full Width
//     checkbox (.layout-width-setup); Full Width sets data-pagemargin="fullwidth".
// =============================================================================

export const LAYOUT_DATA_TYPE = 'layout-2';
export const LAYOUT_WIDGET_NAME = 'Center';
export const LAYOUT_COLUMN_COUNT = 2;

/** Authoring-canvas DOM (the dropped Center layout). */
export const LAYOUT_CANVAS = {
  widget: `.customClass[data-type="${LAYOUT_DATA_TYPE}"], [data-type="${LAYOUT_DATA_TYPE}"]`,
  component: `.layout-container.${LAYOUT_DATA_TYPE}, [layout-template]`,
  sdItem: `#desktop_view .sd-item:has([data-type="${LAYOUT_DATA_TYPE}"]), #desktop_view .sd-item:has(.layout-container.${LAYOUT_DATA_TYPE})`,
  columns: `.layout-container.${LAYOUT_DATA_TYPE} .column.selector`,
  dropZones: `.layout-container.${LAYOUT_DATA_TYPE} .column-content.editables`,
  emptyDroppable: `.layout-container.${LAYOUT_DATA_TYPE} .empty-droppable-text`,
  /** Both columns are equal (one-half) for layout-2. */
  columnNarrow: `.layout-container.${LAYOUT_DATA_TYPE} .column.one-half`,
  columnWide: `.layout-container.${LAYOUT_DATA_TYPE} .column.one-half`,
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
  /** layout-2 column widths: two equal halves. */
  columnWidths: ['one-half', 'one-half'] as const,
  oneItemPerColumn: true,
  noLayoutInLayout: true,
} as const;
